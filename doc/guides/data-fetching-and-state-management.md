# Data Fetching & State Management in PlanX

This guide outlines our approach to handling data and state within the PlanX frontend (`/apps/editor.planx.uk`).

Our architecture is built using a hybrid, "best-tool-for-the-job" approach. We strictly separate server-side state (data from APIs) from client-side state (UI interactions, user state).

## The decision tree

When implementing a new feature, use this decision tree to choose your tools:

1.  **Are you fetching/mutating data from our GraphQL API (Hasura)?**
      * ➡️ **Use Apollo Client** via `useQuery()` and `useMutation()`
      * 🔮 In future, via auto-generated hooks and types
2.  **Are you fetching/mutating data from a REST API (internal or external)?**
      * ➡️ **Use TanStack Query** consuming our typed API layer
3.  **Are you managing UI state (modals, clipboard, layout preferences)?**
      * ➡️ **Use Zustand**
4.  **Are you managing flow state (breadcrumbs, passport, etc)?**
      * ➡️ **Use Zustand**
5.  **Are you testing a component that fetches data?**
      * ➡️ **Use MSW (Mock Service Worker)** to mock the network requests, not the implementation.


## 1. GraphQL Data (Apollo Client)
   
We use Apollo Client for interacting with our Hasura middleware. It provides a normalized cache that keeps our UI consistent without manual state management.

>[!NOTE] Future architecture: codegen 
> We are in the process of migrating to GraphQL Code Generator. Once fully set up, we will define queries in `.graphql` files and import auto-generated, fully-typed hooks.

For now, please follow the manual pattern below - 

###  Workflow
**1. Define query** 
Write your GraphQL query using the `gql` tag within a custom hook file. The Hasura GraphiQL playground is very helpful for defining these.

**2. Type query**
Manually define the TypeScript interfaces for the query response and variables.

**3. Define hook**
Export a custom hook that wraps Apollo's `useQuery()` or `useMutation()`.

**4. Consume hook**
Use the hook within our React components. Apollo manages loading and error states, as well as caching, and refetching.


### Example
```ts 
import { gql, useQuery } from "@apollo/client";

// 1. Define the query
const GET_FLOW =  gql`
  GetFlow($flowId: uuid!) { 
    flow: flows_by_pk(id: $flowId) { 
      id 
      name 
      slug 
      team {
        # Apollo uses the id field to manage the cache
        # Queries and mutations should always include this field
        id
        name
        slug
      } 
    }
  };
`

// 2. Define the types (Codegen will do this for us in the future) 
interface GetFlow { 
  id: string; 
  name: string;
  slug: string
  team: {
    id: number
    name: string
    slug: string
  } 
} | null;

interface GetFlowVars { 
  flowId: string;
}

// 3. Write a hook
export const useFlow = (flowId: string) => 
  useQuery<GetFlow, GetFlowVars>(GET_FLOW, { 
    variables: { flowId }
  });
```

```tsx 
// 4. Consume the hook
import { useFlow } from "../hooks/useFlow";

export const FlowDetails: React.FC<{ flowId: string}> = ({ flowId }) => { 

const { data, loading, error } = useFlow(flowId);

if (loading) return <DelayedLoadingIndicator />; 
if (error) return <ErrorSummary error={error} />;

const flow = data?.flow;

return ( 
  <Box>
    <Typography component="h1">{flow.name}</Typography>
    <Typography component="h2">{flow.team.name}</Typography>
  </Box>
)
```


## 2. REST API Data (TanStack Query + API Layer)

For REST endpoints, we use **TanStack Query** for state management and caching. We do not make `axios` calls directly inside components - we use a dedicated API layer.

### The workflow

1.  **API layer** Define a pure, typed `async` function in `/src/lib/api`.
2.  **Hook layer** Create a custom hook that wraps TanStack's `useQuery()` or `useMutation()`
3.  **Component** Consume the custom hook

### Example

**1. API layer**

Filepath: `src/lib/api/flow/requests.ts`

>[!NOTE]
We use a centralised `apiClient` that automatically handles auth headers and error handling

```ts
import { FlowGraph } from "@opensystemslab/planx-core/types";
import apiClient from "lib/api/client";

import { CreateFlowResponse, NewFlow } from "./types";

export const createFlow = async (newFlow: NewFlow) => {
  const { data } = await apiClient.post<CreateFlowResponse>(
    "/flows/create",
    newFlow,
  );

  return data;
};
```

**2. Hook layer**

Filepath: Feature based

```ts
import { useMutation } from "@tanstack/react-query";
import { createFlow } from "lib/api/flow/requests";
import { useStore } from "pages/FlowEditor/lib/store";

import { CreateFlow } from "../types";

export const useCreateFlow = () => {
  return useMutation({
    mutationFn: createFlow,
    // Handle side-effects in onSuccess
    onSuccess: ({ mode }) => {
      if (mode === "template") useStore.setState({ isTemplatedFrom: true });
    },
  });
};
```

**3. Component**

Filepath: Feature based

```tsx
export const CreateFlowButton = () => {
 const { mutate: createFlow, isPending } = useCreateFlow()

return (
  <Button
    onClick={createFlow}
    disabled={isPending}
  >
    {isPending ? "Creating..." : "Create"}
  </Button>
)};
```

>[!NOTE]
It's not always necessary to use a custom hook if an API call is simple (no side effects, no custom logic), and only used in one location. However, it is a simple abstraction to make and usually worth doing.


## 3. Client state (Zustand)

We use **Zustand** stores for global client-side state.

### ⚠️ Critical rule

**Do not store server data in Zustand**

  * ❌ **Bad:** Storing `teamSettings`, `teamMembers`, or `planningConstraints` in a global store. (Use Apollo/TanStack Query caches for this).
  * ✅ **Good:** Storing `isSidebarOpen`, `breadcrumbs`, or `sectionNodes` (simple UI data, client side data, or complex derived flow data)

>[!NOTE]
>Currently, this rule is very much not adhered to in our codebase! Going forward we're working to improve and simplify this by taking server state out of the stores and relying on Apollo and Tanstack caches.
>
>Whilst working on this migration, we should not add *additional* server state to the stores
>
>Please see [ADR#11](https://github.com/theopensystemslab/planx-new/blob/90297a934dbd39f9b5659873d64cd538f778d0c6/doc/architecture/decisions/0011-standardised-data-fetching-and-state-management.md) for further information here.


### Example
Filepath: `apps/editor.planx.uk/src/pages/FlowEditor/lib/store/editor.ts`

```ts
interface EditorUIStore {
  showSidebar: boolean;
  toggleSidebar: () => void;
}

export const editorUIStore: StateCreator<
  EditorUIStore,
  [],
  [["zustand/persist", unknown]],
  EditorUIStore
> = (set, get) => ({
  showSidebar: true,
  
  toggleSidebar: () => {
    set({ showSidebar: !get().showSidebar });
  },
});
```


## 4. Testing strategy

Where possible, we try to prioritise integration tests over implementation details - we want to test that our components work from a user's perspective.

  * **Do not mock the hook** (for example, don't mock `createFlow()`)
  * **Do not mock the Zustand store state** (unless strictly required, e.g. complex graph logic)
  * **Mock the network** using [MSW (Mock Service Worker)](https://mswjs.io/)

### Example: REST API calls
```tsx
const handlers: HttpHandler[] = [
  // GIS requests
  http.get(`${API_URL}/gis/*`, () => {
    return HttpResponse.json(digitalLandResponseMock);
  }),
  // Classified roads requests
  http.get(`${API_URL}/roads`, () => {
    return HttpResponse.json(classifiedRoadsResponseMock);
  }),
];

beforeEach(() => {
  server.use(...handlers);
});

// Tests can now make network requests, and receive mocks back
it("renders correctly", async () => {
  setup(
    <PlanningConstraints title="Planning constraints" />
  );

  expect(
    getByRole("heading", { name: "Planning constraints" }),
  ).toBeInTheDocument();

  // Data returned from mocks
  expect(
    await findByRole("button", { name: /Parks and gardens/ }),
  ).toBeVisible();
});
```

### Example: GraphQL API calls
```tsx
import { graphql, HttpResponse } from "msw";
import server from "test/mockServer";
import { setup } from "testUtils";
import { mockTeams } from "ui/shared/DataTable/mockTeams";

import { PlatformAdminPanel } from "./PlatformAdminPanel";

const handlers = [
  // Use the msw graphql handler - matches on query name
  graphql.query("GetAdminPanelData", () =>
    HttpResponse.json({ data: { adminPanel: mockTeams } }),
  ),
];

beforeEach(() => {
  server.use(...handlers);
});

it("renders the admin panel", async () => {
  setup(<PlatformAdminPanel />);

  // Wait for the returned data, not the removal of a loading state
  await screen.findByText("Barking and Dagenham");
  ...
});
```


## Legacy patterns to avoid

As we migrate our codebase, you will still see older patterns. **Please do not replicate these in new code, and follow the guidelines laid out here.**

1.  **"The God Store"** 

      Large Zustand stores that fetch data, hold it in state, and manage UI logic (e.g., `teamStore.ts`).

2.  **Manually managing loading or error state via React state** 
      ```ts
      const [isLoading, setIsLoading] = useState(false)
      ```

      We should use derived state from our queries and mutations - 

      ```ts
      const { isPending, isError } = useQuery({...})
      ```

3.  **Calling Axios directly from components** 
      ```ts
      useEffect(() => { axios.get(...) }, [])
      ```

      This can cause loading waterfalls, and managing async calls within `useEffect()`s can get complex. This method does not have any caching we can rely on. 
      
      Instead we should use our API layer for making requests, via TanStack query.

      External APIs, such as PlanningData, should still be wrapped in a query.

4.  **Mocking implementations within tests** 
      
      ```ts
      vi.mock("axios", () => {...})
      ```
      
      Instead, we should mock network requests via `msw`.
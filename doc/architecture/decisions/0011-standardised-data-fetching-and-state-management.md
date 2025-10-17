# 11. Standardised data fetching and state management

Date: 2025-10-13

## Status

Approved

## Context

Data fetching and server-side state management have grown organically in PlanX, which has lead to inconsistency and complexity. The current approach, generally relying on Zustand stores to manage server state, has been a source of friction and confusion - this usually rears it's head as having to manage manual cache invalidation (e.g. on route change, or form submission), or requiring a lot of boilerplate code for simple functionality (e.g. user management, team settings).

Our `TeamStore` (`editor.planx.uk/src/pages/FlowEditor/lib/store/team.ts`) is a prime example of these limitations - 

**Manual data fetching**: Functions like `initTeamStore()` make direct GraphQL calls, and then manage the returned values within the store.

**No declarative state**: Components using this store cannot easily access loading or error states. This leads to repeated try/catch blocks and manual state management across multiple components.

**No caching strategy**: There's no mechanism for invalidating queries or refetching - right now we have to clear the store on route changes, as well as updating the store after updating server state (e.g. updating team settings in the store after calling a GraphQL mutation).

**Mixing concerns**: It's not clear what should and should not live in a store - data fetching, a cache of server-side data, UI information (team colours etc). Currently it's an "all of the above" approach.

We would benefit from a clear, robust, and scalable approach here - we should be leveraging modering tooling for our GraphQL and REST APIs and clearly defining the role of our Zustand stores.

## Decision

I don't believe there's a single approach here that will meet all our requirements, as neat a solution as that would be. I'm proposing a hybrid, "best-tool-for-the-job" approach. This should give us flexibility, without too much complexity, and clearly separating concerns between REST APIs, GraphQL APIs, and client-side state.

### Decision tree
**1. Are you fetching data from our GraphQL API?**

- ➡️ Use Apollo Client with our auto-generated hooks

**2. Are youfetching data from a REST API (internal or external)?**

- ➡️ Use TanStack Query with our API layer

**3. Are you managing state that only exists on the client (e.g., breadcrumbs, section data, UI state)?**

- ➡️ Use Zustand stores (`useStore()` hook)

### REST API interactions
All interactions with or REST APIs will be managed by a dedicated API layer, consumed exclusively by TanStack Query hooks.

**Centralized API layer (using Axios)**: We will implement a single, pre-configured Axios client with interceptors for auth and error handling.

**Typed functions per endpoint**: Each REST endpoint will have a corresponding pure, typed function within the API layer. These can be grouped per-feature for convenience, much as our API modules are organised.

**State Management with TanStack Query**: All calls to the REST API layer from the frontend application must be wrapped in TanStack Query hooks (`useQuery`, `useMutation`).

### GraphQL API interactions
We will continue to use Apollo Client for GraphQL queries and mutations. Once the monorepo migration is complete we will extract this out to it's own package to be shared across PlanX applications (Editor, API, e2e).

**Retain Apollo Client**: The level of use within the PlanX Editor, the normalised cache, and general best-in-class GraphQL handling, seem too good to pivot away from. Tanstack query can use Apollo as a fetching client but it would handle caching via query keys instead of via a normalised list of entities as Apollo does. Within the application we would use Apollo's `useQuery()` and `useMutation()` hooks which have a very similar API to Tanstack Query.

**Shared, typed, client package**: We will create a dedicated, shared package (`packages/graphql-client`) containing all GraphQL operations and use a GraphQL Code Generator configuration. Codegen will be configured to connect to our GraphQL schema and automatically generate -

 - Fully typed Apollo React hooks for the frontend
 - A typed SDK for server-to-server communication in our backend and for use in E2E tests

Inspiration 
  - https://www.apollographql.com/tutorials/lift-off-part1/09-codegen
  - https://www.apollographql.com/docs/react/development-testing/graphql-codegen

### Client state management

**Zustand should be used for client state only**: Zustand stores should be strictly limited to managing client-side state (UI state, breadcrumbs, flow navigation, sections, etc.). It will not be used as a cache for server data (e.g. team settings, user management, admin dashboard details).

## Consequences

### Positives

**Much simpler onboarding**: This has been a significant issue in the past - a simpler and well-documented approach should take the guesswork out of writing queries and managing state. It will also mean that there will be greater consistency here within the current team.

**True type safety & code reuse for the GraphQL API**: Having an auto-generated SDK for Hasura should be a bit of a game-changer. All of our services can now call the GraphQL API with full type safety - we won't need to manage manual types for queries, or manage adding/removing columns from queries when the schema changes. Our E2E tests can use this SDK to reliably set up state for testing. This would also allow us to remove the old request methods in planx-core. Any complex operations remaining here that aren't pure requests can move to the REST API.

**Enhanced perceived performance:** Beyond simple query caching, we can now easily implement optimistic updates with TanStack Query, making the UI feel much more responsive. Apollo's normalized cache will allow us to reliably reduce network requests when navigating between pages that display the same data entities. Currently, we manually manage the Zustand stores to allow this.

**Clear separation of concerns**: We would now draw a clean line between data fetching, server state, and client state, and eliminate manual fetching functions and try/catch blocks in components.

**Reduced boilerplate**: No more having to type a function in planx-core, update planx-core, import and define function via a store, and then call in a component. We can just define once in `packages/graphql-client` and then call `useMyNewQuery()` via Apollo.

**Caching**: We can use the caching strategies of both Apollo (normalized) and TanStack Query (key-based). This will reduce network requests, improving performance for Editors and public users.

### Negatives - Trade offs and risks

**Migration drag**: I'm keenly aware that whilst this is being rolled out we'll have an additional pattern to manage. In order to mitigate this I recommend that we - 
 - enforce that all new code must be compliant with this ADR
 - track the migration via a GitHub project (I'll set this up in detail once this ADR has been discussed and approved)

**Initial overhead of setting up the GraphQL client**: There is an upfront cost here to getting this setup, but Gunar has done some work on this in the past and it's a fairly standard approach to managing GraphQL schemas (there are [Hasura specific docs](https://hasura.io/blog/your-guide-to-graphql-with-typescript) here). I'd estimate this would take a couple of dedicated days once the monorepo is configured.

**Two state management libraries**: The team must be comfortable with the distinct roles of Apollo and TanStack Query. If this is too much of an overhead, or leads to issues, we can use Apollo as a fetching client for Tanstack Query, and give up the normalised cache. A

## Migration
I would recommend that we begin working on this once we've fully migrated to the monorepo. None of the work below is really blocking anything else, so I think the best approach here given current workloads and expectations would be to chip away at this plan, sprint-by-sprint, rather than trying to sequence a block of dedicated work here. This should also lower the risk and testing burden of multiple changes at once.

### Phase 1: Tackle REST API usage via Editor interface
 - Proof-of-concept: Use Tanstack query to test the new pattern and formalise our understanding of the problem (https://github.com/theopensystemslab/planx-new/pull/5397)
 - Require than any new REST API code follow the Tanstack Query pattern
 - Remove all axios calls within the Editor interface - swap for Tanstack Query, implementing loading states and caching

### Phase 2: Tackle REST API usage via Public interface
 - Remove `useSWR()`, replacing with `useQuery()` (e.g. planning constraints)
 - Remove `axios` from Pay component (this is high risk, possibly low-reward, let's discuss this one)
 - Remove direct `axios` calls elsewhere from public interface (send, file upload, etc)

### Phase 3: GraphQL client
 - Create `packages/graphql-client` and configure codegen to read types from the Hasura schema
 - Proof of concept - refactor a component currently using a manual GraphQL query for a generated Apollo hook
 - Ensure CI/CD generates and validated types

### Phase 4: Migration of other GraphQL calls, route by route
 - Most GraphQL requests are made via routes and data passed to child components. This pattern will fundamentally remain - but rather than prop drilling or saving values to stores, we can simply re-query the cache within child components.
 - We can migrate these by-route, by-feature or by-component, updating tests as we go
 - As data fetching is moved to hooks, we will remove server state (and fetching methods) from Zustand stores

## Testing, enforcement, and documentation

### Testing strategy
Our current practice of mocking the Zustand store state, or composing components from simpler "presentational" layers, is both tricky to manage within unit tests and less accurate than a real test which makes https requests. We currently use the `msw` library in some components to simulate realistic request/response behaviour within components. We should continue to implement this pattern in order to realistically test our components.

Docs: https://tanstack.com/query/latest/docs/framework/react/guides/testing

### Enforcement
To enforce the new patterns, we will implement the following ESLint rules -

- `eslint-plugin-tanstack-query`: recommended linting for Tanstack Query, should keep us on track!
- `no-restricted-imports`: we should ban direct imports of our `apiClient` and `axios` within React component files, forcing all usage through a dedicated Tanstack Query backed hook

From the date that this ADR is accepted onward, we'll enforce at PR level that new code follows the guidelines laid out and agreed here.

### Documentation

This ADR will be the primary source of truth for the new patterns, in terms of explaining the decision making and the journey we took to get here.

Dev calls can be used to talk though and demo both the REST and GraphQL pilot refactors. This should give us all a chance to get familiar with new query methods, and to provide feedback.

Once we've settled on an approach and have examples to refer to, I'll create `apps/editor.planx.uk/docs/data-fetching-and-state-management.md` which will serve as a more readable reference than this ADR, and can be used for onboarding.
# TanStack Router v1.31 Migration Plan

**Date:** August 2025
**Project:** PlanX Editor
**Migration:** react-navi → TanStack Router v1.31
**Strategy:** Gradual Migration with Dual Router Setup

## Summary

This document outlines a comprehensive migration plan from react-navi to TanStack Router v1.31. Given the complexity of the current routing structure, we recommend a **gradual migration approach** with both routers running simultaneously during the transition period.

## Current State Analysis

### React-navi Implementation Complexity

- **25+ route files** with complex nested structure
- **Domain-specific routing** (preview-only domains vs editor domains)
- **Deep authentication guards** with role-based access control
- **Async data loading** patterns throughout the routing tree
- **Custom context management** for user/team/flow state
- **Complex URL patterns** (comma-separated flow params, nested nodes)

### Key Challenges for Migration

1. **Authentication Integration**: Current `withContext()` and `withView()` patterns
2. **Data Loading**: Extensive use of `withData()` for route-level data fetching
3. **Domain Logic**: Complex routing behavior based on hostname
4. **State Management**: Deep integration with Zustand store
5. **Lazy Loading**: Dynamic imports for route components
6. **Error Handling**: Custom error boundaries and 404 handling

## Migration Strategy: Gradual Dual-Router Approach

### Why Gradual Migration?

1. **Risk Mitigation**: Allows thorough testing of each section
2. **Continuous Development**: Team can continue working on unmigrated routes
3. **Quick Rollback**: Can revert specific sections if issues arise
4. **Incremental Learning**: Team learns TanStack Router patterns gradually
5. **User Experience**: No disruption to critical user flows

### Dual Router Architecture

During migration, we'll run both routers simultaneously:

```typescript
// Migration period architecture
function App() {
  return (
    <MigrationRouterProvider>
      {/* TanStack Router handles migrated routes */}
      <RouterProvider router={tanstackRouter} />

      {/* react-navi handles legacy routes */}
      <Router navigation={naviNavigation}>
        <LegacyRoutes />
      </Router>
    </MigrationRouterProvider>
  );
}
```

## TanStack Router v1.31 Setup

### Installation

```bash
# Remove react-navi dependencies (after migration complete)
npm uninstall navi react-navi react-navi-helmet-async

# Install TanStack Router v1.31
npm install @tanstack/react-router@^1.31.0
npm install -D @tanstack/router-devtools@^1.31.0 @tanstack/router-cli@^1.31.0
```

### Project Configuration

```typescript
// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { TanStackRouterVite } from "@tanstack/router-plugin/vite";

export default defineConfig({
  plugins: [
    TanStackRouterVite({
      routesDirectory: "./src/routes-tanstack",
      generatedRouteTree: "./src/routeTree.gen.ts",
      routeFileIgnorePrefix: "-",
      quoteStyle: "single",
    }),
    react(),
  ],
});
```

```json
// tsconfig.json additions
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"],
      "@/routes-tanstack/*": ["./src/routes-tanstack/*"]
    }
  }
}
```

### Router Setup

```typescript
// src/index.tsx
import { createRouter, RouterProvider as TanstackRouteProvider } from '@tanstack/react-router'
import { routeTree } from './routeTree.gen'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
//...rest of imports

const routeTree = rootRoute.addChildren([indexRoute, aboutRoute])

const router = createRouter({ routeTree })

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

//... rest of index.tsx
//
  root.render(
    //...previous providers
    <Router context={{ currentUser: hasJWT() }} navigation={navigation}> //Existing navi router provider
    <TanstackRouterProvider router={router} />
    //... rest of providers
  )
}
```

## Migration Timeline: 8-Week Gradual Approach

### Phase 1: Foundation & Public Routes (Weeks 1-2)

**Week 1: Setup & Infrastructure**

- [ ] Install TanStack Router v1.31 and dependencies
- [ ] Set up dual router architecture
- [ ] Configure build tools and TypeScript
- [ ] Create migration utilities and helpers
- [ ] Set up testing framework for new routes
- [ ] Create route migration tracking system

**Week 2: Global & Public Routes**

- [ ] Migrate global routes (`/login`, `/logout`, `/network-error`)
- [ ] Migrate preview-only domain routes (`/:flow`, `/:flow/pay`)
- [ ] Implement domain detection logic
- [ ] Migrate published flow routes (`/:team/:flow/published`)
- [ ] Test public route functionality thoroughly

**Deliverables:**

- Working dual router setup
- All public routes migrated and tested
- Domain-specific routing functional

### Phase 2: Authentication & Team Routes (Weeks 3-4)

**Week 3: Authentication Foundation**

- [ ] Create TanStack Router authentication context
- [ ] Migrate root authenticated routes (`/`, `/resources`, `/onboarding`)
- [ ] Implement route guards and protection levels
- [ ] Migrate platform admin routes (`/global-settings`, `/admin-panel`)
- [ ] Set up user store integration

**Week 4: Team-Level Routes**

- [ ] Migrate team root routes (`/:team`)
- [ ] Migrate team settings routes (`/:team/design`, `/:team/general-settings`)
- [ ] Migrate protected team routes (`/:team/members`, `/:team/feedback`)
- [ ] Implement team ownership validation
- [ ] Test authentication flows thoroughly

**Deliverables:**

- Complete authentication system
- All team-level routes migrated
- Role-based access control functional

### Phase 3: Flow & Editor Routes (Weeks 5-6)

**Week 5: Basic Flow Routes**

- [ ] Migrate flow editor foundation (`/:team/:flow`)
- [ ] Migrate flow information routes (`/:team/:flow/about`)
- [ ] Migrate service settings (`/:team/:flow/service`)
- [ ] Implement flow data loading patterns
- [ ] Set up flow editor context

**Week 6: Node Management Routes**

- [ ] Migrate node creation routes (`/:team/:flow/nodes/new`)
- [ ] Migrate node editing routes (`/:team/:flow/:id/edit`)
- [ ] Handle complex nested node routes
- [ ] Implement parent/child node relationships
- [ ] Test flow editor functionality

**Deliverables:**

- Complete flow editor routing
- Node management fully functional
- Flow data loading optimized

### Phase 4: Advanced Routes & Features (Weeks 7-8)

**Week 7: Specialized Routes**

- [ ] Migrate preview routes (`/:team/:flow/preview`)
- [ ] Migrate draft routes (`/:team/:flow/draft`)
- [ ] Migrate payment routes (`/:team/:flow/pay`)
- [ ] Migrate submission routes and downloads
- [ ] Handle complex URL parameters (comma-separated flows)

**Week 8: Final Integration & Cleanup**

- [ ] Remove react-navi dependencies
- [ ] Clean up dual router architecture
- [ ] Optimize bundle size and performance
- [ ] Complete comprehensive testing
- [ ] Update documentation and developer guides
- [ ] Deploy to production

**Deliverables:**

- Complete migration to TanStack Router
- All legacy code removed
- Performance optimized
- Comprehensive documentation

## Detailed Migration Patterns

### 1. Route Definition Migration

#### Current react-navi Pattern

```typescript
// routes/authenticated.tsx
export default compose(
  withView(authenticatedView),
  withContext(async (): Promise<Context> => {
    const user = await useStore.getState().initUserStore();
    return { user }
  }),
  mount({
    "/": route(() => ({ view: <Teams /> })),
    "/:team": lazy(() => import("./team")),
  }),
)
```

#### TanStack Router Pattern

```typescript
// routes-tanstack/__root.tsx
import { createRootRoute, Outlet } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/router-devtools'

export const Route = createRootRoute({
  component: RootComponent,
})

function RootComponent() {
  return (
    <>
      <Outlet />
      <TanStackRouterDevtools />
    </>
  )
}
```

```typescript
// routes-tanstack/authenticated.tsx
import { createFileRoute, redirect } from '@tanstack/react-router'
import { useStore } from '@/pages/FlowEditor/lib/store'

export const Route = createFileRoute('/authenticated')({
  beforeLoad: async ({ context }) => {
    try {
      const user = await useStore.getState().initUserStore()
      return { user }
    } catch (error) {
      throw redirect({ to: '/login' })
    }
  },
  component: AuthenticatedLayout,
})

function AuthenticatedLayout() {
  return <Outlet />
}
```

```typescript
// routes-tanstack/authenticated/index.tsx
import { createFileRoute } from '@tanstack/react-router'
import Teams from '@/pages/Teams'

export const Route = createFileRoute('/authenticated/')({
  loader: async () => {
    const { data } = await client.query({ query: GET_TEAMS_QUERY })
    return { teams: data.teams }
  },
  component: TeamsPage,
})

function TeamsPage() {
  const { teams } = Route.useLoaderData()
  return <Teams teams={teams} />
}
```

### 2. Authentication Guard Migration

#### Current Pattern

```typescript
const routes = map<Context>(async (req, { user }) => {
  const isAuthorised = user.isPlatformAdmin;
  if (!isAuthorised) throw new NotFoundError();
  return route({ view: <GlobalSettings /> });
});
```

#### TanStack Router Pattern

```typescript
// routes-tanstack/authenticated/global-settings.tsx
export const Route = createFileRoute("/authenticated/global-settings")({
  beforeLoad: async ({ context }) => {
    const { user } = context;
    if (!user?.isPlatformAdmin) {
      throw redirect({ to: "/", replace: true });
    }
  },
  loader: async () => {
    const { data } = await client.query({ query: GET_GLOBAL_SETTINGS_QUERY });
    return { globalSettings: data.globalSettings };
  },
  component: GlobalSettingsPage,
});
```

### 3. Data Loading Migration

#### Current Pattern

```typescript
const routes = withData(async (req) => {
  const { team: teamSlug, flow: flowSlug } = req.params;
  const data = await fetchFlowData(flowSlug, teamSlug);
  return { flow: data };
})(route({ view: <FlowEditor /> }));
```

#### TanStack Router Pattern

```typescript
// routes-tanstack/authenticated/$team/$flow/index.tsx
export const Route = createFileRoute('/authenticated/$team/$flow/')({
  loader: async ({ params }) => {
    const { team, flow } = params
    const [flowData, teamData] = await Promise.all([
      fetchFlowData(flow, team),
      fetchTeamData(team),
    ])
    return { flow: flowData, team: teamData }
  },
  component: FlowEditor,
  pendingComponent: () => <LoadingSpinner />,
  errorComponent: ({ error }) => <ErrorBoundary error={error} />,
})
```

### 4. Domain-Specific Routing

#### Current Pattern

```typescript
export default isPreviewOnlyDomain
  ? mount({
      "/:team/:flow/published": loadPublishedRoutes(),
      "/:flow": loadPublishedRoutes(),
      "/:flow/pay": loadPayRoutes(),
    })
  : mount({
      "/:team/:flow/published": loadPublishedRoutes(),
      "*": editorRoutes,
    });
```

#### TanStack Router Pattern

```typescript
// routes-tanstack/__root.tsx
export const Route = createRootRoute({
  beforeLoad: ({ location }) => {
    const isPreviewDomain = RouteUtils.isPreviewOnlyDomain(
      window.location.hostname,
    );
    return { isPreviewDomain };
  },
  component: RootComponent,
});

// routes-tanstack/$flow.tsx (preview domains)
export const Route = createFileRoute("/$flow")({
  beforeLoad: ({ context }) => {
    if (!context.isPreviewDomain) {
      throw redirect({ to: "/not-found" });
    }
  },
  loader: async ({ params, context }) => {
    const teamSlug = await getTeamFromDomain(window.location.hostname);
    const flowData = await fetchPublishedFlow(params.flow, teamSlug);
    return { flow: flowData, team: teamSlug };
  },
  component: PublishedFlow,
});
```

### 5. Complex Parameter Handling

#### Current Pattern

```typescript
// Handling comma-separated flow parameters
withData((req) => ({
  flow: req.params.flow.split(",")[0],
}));
```

#### TanStack Router Pattern

```typescript
export const Route = createFileRoute("/authenticated/$team/$flow/")({
  params: {
    parse: (params) => ({
      team: params.team,
      flow: params.flow.split(",")[0], // Handle comma-separated values
      additionalParams: params.flow.split(",").slice(1),
    }),
    stringify: ({ team, flow, additionalParams = [] }) => ({
      team,
      flow: [flow, ...additionalParams].join(","),
    }),
  },
  loader: async ({ params }) => {
    const { flow, team } = params;
    return { flowData: await fetchFlow(flow, team) };
  },
  component: FlowComponent,
});
```

## Migration Utilities

### Route Migration Tracker

```typescript
// utils/migration-tracker.ts
interface MigratedRoute {
  path: string;
  status: "pending" | "in-progress" | "completed" | "tested";
  originalFile: string;
  newFile: string;
  complexity: "low" | "medium" | "high";
  dependencies: string[];
}

export const MIGRATION_ROUTES: MigratedRoute[] = [
  {
    path: "/login",
    status: "pending",
    originalFile: "routes/index.tsx",
    newFile: "routes-tanstack/login.tsx",
    complexity: "low",
    dependencies: [],
  },
  // ... more routes
];

export function trackMigrationProgress() {
  const completed = MIGRATION_ROUTES.filter(
    (r) => r.status === "completed",
  ).length;
  const total = MIGRATION_ROUTES.length;
  return { completed, total, percentage: (completed / total) * 100 };
}
```

### Router Bridge Utility

```typescript
// utils/router-bridge.ts
import { useNavigate as useNaviNavigate } from "react-navi";
import { useNavigate as useTanStackNavigate } from "@tanstack/react-router";

export function useMigrationNavigate() {
  const naviNavigate = useNaviNavigate();
  const tanStackNavigate = useTanStackNavigate();

  return (to: string, options?: any) => {
    // Determine which router should handle this route
    if (isMigratedRoute(to)) {
      return tanStackNavigate({ to, ...options });
    } else {
      return naviNavigate(to, options);
    }
  };
}

function isMigratedRoute(path: string): boolean {
  // Check against list of migrated routes
  return MIGRATION_ROUTES.some(
    (route) => route.status === "completed" && path.startsWith(route.path),
  );
}
```

### Component Migration Helper

```typescript
// utils/component-migrator.ts
export function migrateLinkComponent(originalPath: string) {
  return function MigratedLink({ to, children, ...props }: any) {
    if (isMigratedRoute(to)) {
      return <TanStackLink to={to} {...props}>{children}</TanStackLink>
    } else {
      return <NaviLink href={to} {...props}>{children}</NaviLink>
    }
  }
}
```

## Testing Strategy

### Testing Framework Setup

```typescript
// tests/setup/router-test-utils.tsx
import { createMemoryHistory } from '@tanstack/react-router'
import { render } from '@testing-library/react'

export function renderWithTanStackRouter(
  component: React.ReactElement,
  { initialEntries = ['/'] } = {}
) {
  const router = createRouter({
    routeTree,
    history: createMemoryHistory({ initialEntries }),
  })

  return render(
    <RouterProvider router={router}>
      {component}
    </RouterProvider>
  )
}
```

### Migration Test Suite

```typescript
// tests/migration/route-migration.test.tsx
describe('Route Migration', () => {
  describe('Authentication Routes', () => {
    test('should redirect unauthenticated users to login', async () => {
      const { getByText } = renderWithTanStackRouter(<App />, {
        initialEntries: ['/authenticated/global-settings'],
      })

      await waitFor(() => {
        expect(window.location.pathname).toBe('/login')
      })
    })
  })

  describe('Team Routes', () => {
    test('should load team data correctly', async () => {
      const { getByText } = renderWithTanStackRouter(<App />, {
        initialEntries: ['/authenticated/test-team'],
      })

      await waitFor(() => {
        expect(getByText('Test Team')).toBeInTheDocument()
      })
    })
  })
})
```

### Performance Testing

```typescript
// tests/performance/bundle-size.test.ts
describe("Bundle Size Impact", () => {
  test("should not increase bundle size by more than 10%", () => {
    const currentSize = getBundleSize();
    const maxAllowedSize = BASELINE_SIZE * 1.1;
    expect(currentSize).toBeLessThan(maxAllowedSize);
  });
});
```

## Error Handling & Rollback Strategy

### Error Boundaries

```typescript
// components/MigrationErrorBoundary.tsx
export function MigrationErrorBoundary({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary
      fallback={({ error, reset }) => (
        <div>
          <h2>Migration Error Detected</h2>
          <p>Route: {window.location.pathname}</p>
          <p>Error: {error.message}</p>
          <button onClick={reset}>Try Again</button>
          <button onClick={() => window.location.reload()}>
            Fallback to Legacy Router
          </button>
        </div>
      )}
    >
      {children}
    </ErrorBoundary>
  )
}
```

### Rollback Procedure

1. **Route-Level Rollback**: Revert specific routes to react-navi
2. **Feature Flags**: Use feature flags to enable/disable TanStack routes
3. **Full Rollback**: Complete reversion to react-navi if critical issues occur

```typescript
// utils/feature-flags.ts
export const MIGRATION_FLAGS = {
  enableTanStackAuth: false,
  enableTanStackTeamRoutes: false,
  enableTanStackFlowRoutes: false,
} as const;

export function shouldUseTanStackRouter(path: string): boolean {
  if (
    path.startsWith("/authenticated") &&
    !MIGRATION_FLAGS.enableTanStackAuth
  ) {
    return false;
  }
  // ... more checks
  return true;
}
```

## Performance Optimizations

### Code Splitting

```typescript
// routes-tanstack/authenticated/$team/$flow/index.lazy.tsx
import { createLazyFileRoute } from '@tanstack/react-router'

export const Route = createLazyFileRoute('/authenticated/$team/$flow/')({
  component: () => {
    const FlowEditor = lazy(() => import('@/pages/FlowEditor'))
    return (
      <Suspense fallback={<LoadingSpinner />}>
        <FlowEditor />
      </Suspense>
    )
  },
})
```

### Preloading Strategy

```typescript
// Configure aggressive preloading for editor routes
const router = createRouter({
  routeTree,
  defaultPreload: "intent",
  defaultPreloadStaleTime: 0,
  defaultPreloadGcTime: 1000 * 60 * 10, // 10 minutes
});
```

### Data Caching

```typescript
// routes-tanstack/authenticated/$team/$flow/index.tsx
export const Route = createFileRoute("/authenticated/$team/$flow/")({
  loader: async ({ params }) => {
    return {
      flow: await queryClient.ensureQueryData({
        queryKey: ["flow", params.team, params.flow],
        queryFn: () => fetchFlow(params.flow, params.team),
        staleTime: 1000 * 60 * 5, // 5 minutes
      }),
    };
  },
  component: FlowEditor,
});
```

## Risk Assessment & Mitigation

### High Risk Areas

1. **Authentication Integration**: Complex user/team context management
   - **Mitigation**: Thorough testing, gradual rollout, feature flags

2. **Data Loading**: Extensive async patterns throughout app
   - **Mitigation**: Parallel migration with current patterns, performance monitoring

3. **Domain Routing**: Complex logic for preview-only domains
   - **Mitigation**: Isolated testing environment, comprehensive test coverage

4. **Flow Editor**: Core functionality with complex state management
   - **Mitigation**: Last to migrate, extensive testing, rollback plan

### Medium Risk Areas

1. **URL Parameter Handling**: Complex comma-separated parameters
2. **Lazy Loading**: Dynamic imports and code splitting
3. **Error Boundaries**: Custom error handling patterns

### Low Risk Areas

1. **Static Routes**: Simple routes with no complex logic
2. **Public Routes**: Limited functionality and dependencies

## Success Metrics

### Technical Metrics

- **Bundle Size**: No increase >5% from current size
- **Performance**: Route transitions <200ms (50% improvement target)
- **Type Safety**: 100% TypeScript coverage for routing
- **Test Coverage**: 95% coverage for routing logic
- **Error Rate**: <0.1% increase in routing-related errors

### User Experience Metrics

- **Zero Breaking Changes**: All existing URLs continue to work
- **Improved Performance**: Faster route transitions and data loading
- **Better Developer Experience**: Type-safe routing with autocomplete
- **Enhanced Error Handling**: Better error messages and recovery

## Dependencies & Prerequisites

### Required Dependencies

```json
{
  "dependencies": {
    "@tanstack/react-router": "^1.31.0",
    "@tanstack/react-query": "^5.0.0"
  },
  "devDependencies": {
    "@tanstack/router-devtools": "^1.31.0",
    "@tanstack/router-cli": "^1.31.0",
    "@tanstack/router-plugin": "^1.31.0"
  }
}
```

### Environment Requirements

- Node.js 18+
- React 18+
- TypeScript 5.0+
- Vite 5.0+

## Appendix

### A. Complete Route Mapping

| Current Route            | New Route                              | Complexity | Dependencies           |
| ------------------------ | -------------------------------------- | ---------- | ---------------------- |
| `/login`                 | `/login`                               | Low        | None                   |
| `/logout`                | `/logout`                              | Low        | Auth store             |
| `/:team`                 | `/authenticated/$team`                 | Medium     | Team store             |
| `/:team/:flow`           | `/authenticated/$team/$flow`           | High       | Flow store, Team store |
| `/:team/:flow/nodes/new` | `/authenticated/$team/$flow/nodes/new` | High       | Node editor            |

### B. TanStack Router v1.31 Key Features

- **File-based routing** with automatic code generation
- **Type-safe parameters** and search params
- **Built-in data loading** with React Query integration
- **Advanced caching** with stale-while-revalidate
- **Optimistic navigation** with preloading
- **React 18+ support** with Suspense and Concurrent Features

### C. Migration Checklist

#### Phase 1: Foundation

- [ ] TanStack Router installed and configured
- [ ] Dual router architecture implemented
- [ ] Global routes migrated
- [ ] Public routes migrated
- [ ] Initial testing completed

#### Phase 2: Authentication

- [ ] Authentication context migrated
- [ ] Protected routes implemented
- [ ] Team-level routes migrated
- [ ] Role-based access working
- [ ] Authentication flow tested

#### Phase 3: Flow Editor

- [ ] Flow routes migrated
- [ ] Node management working
- [ ] Data loading optimized
- [ ] Editor functionality tested
- [ ] Performance benchmarked

#### Phase 4: Completion

- [ ] All routes migrated
- [ ] Legacy code removed
- [ ] Performance optimized
- [ ] Documentation updated
- [ ] Production deployment completed

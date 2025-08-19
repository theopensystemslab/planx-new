# React-navi Migration Analysis and Recommendations

**Date:** August 13, 2025
**Project:** PlanX Editor
**Status:** Research Phase
**Updated for:** React Router v7.8.0

## Executive Summary

This document analyzes the current React-navi routing implementation in the PlanX editor application and provides recommendations for migration to a maintained routing solution. React-navi is no longer actively maintained and poses risks for future React compatibility and security updates.

## Current Implementation Analysis

### Technology Stack

- **Primary Router:** `navi` v0.15.0
- **React Integration:** `react-navi` v0.15.0
- **Additional:** `react-navi-helmet-async` v0.15.0
- **React Version:** 18.2.0

### Architecture Overview

The current routing system uses a declarative, async-first approach with the following key characteristics:

#### 1. **Nested Route Structure**

```
/                           (Main editor routes)
├── /login
├── /logout
├── /:team                  (Team-specific routes)
│   ├── /
│   ├── /:flow             (Flow editor)
│   │   ├── /nodes         (Node management)
│   │   ├── /about
│   │   ├── /service
│   │   └── /submissions
│   ├── /members
│   └── /feedback
├── /:team/:flow/published  (Published flows)
├── /:team/:flow/preview    (Preview mode)
├── /:team/:flow/draft      (Draft mode)
└── /:team/:flow/pay        (Payment integration)
```

#### 2. **Key Features Used**

- **Lazy Loading:** Routes dynamically import components using `lazy()`
- **Data Fetching:** `withData()` and `withView()` for route-level data loading
- **Authentication Guards:** Context-based route protection
- **Custom Domain Support:** Preview-only domains with different routing behavior
- **Complex URL Patterns:** Multi-segment parameters (e.g., flow slugs with commas)

#### 3. **Critical Dependencies**

- `createBrowserNavigation()` for navigation setup
- `Router`, `View`, `NotFoundBoundary` components
- Hooks: `useCurrentRoute()`, `useNavigation()`, `useLoadingRoute()`
- Route builders: `mount()`, `route()`, `map()`, `compose()`
- Higher-order components: `withView()`, `withData()`, `withContext()`

### Current Usage Patterns

#### Route Definition Example

```typescript
const routes = compose(
  withView(authenticatedView),
  withContext(async (): Promise<Context> => {
    const user = await useStore.getState().initUserStore();
    return { user }
  }),
  mount({
    "/": route(() => ({ view: <Teams /> })),
    "/:team": lazy(() => import("./team")),
  })
);
```

#### Navigation Usage

```typescript
const { navigate } = useNavigation();
const route = useCurrentRoute();
const isLoading = useLoadingRoute();
```

### Key Implementation Files

- **Main Routes:** `src/routes/index.tsx` - Entry point with domain-specific routing
- **Authentication:** `src/routes/authenticated.tsx` - Protected route wrapper
- **Team Routes:** `src/routes/team.tsx` - Team-specific routing logic
- **Flow Routes:** `src/routes/flow.tsx` - Flow editor and node management
- **Published Routes:** `src/routes/published.tsx` - Public flow viewing
- **Navigation Setup:** `src/lib/navigation.ts` - Router configuration
- **App Entry:** `src/index.tsx` - Main application setup

### Complex Routing Features

- **Multi-domain Support:** Different routing for preview-only domains vs editor domains
- **Dynamic Route Loading:** Async flow and team data loading with validation
- **Deep Authentication:** User context and team permissions integrated into routing
- **External Portal Handling:** Complex flow relationships and portal management
- **Session Management:** Save & return functionality with session-based routing

## Migration Options Analysis

### 1. React Router v7 (Recommended)

**Current Version:** 7.8.0 (Latest)

**Pros:**

- Industry standard with excellent community support and long-term maintenance
- **Non-breaking upgrade from v6** - Major advantage for migration
- Native async/lazy loading support with improved performance
- Advanced data loading with loaders, actions, and fetchers
- **Simplified package structure** - single `react-router` package instead of multiple
- Type-safe routing with enhanced TypeScript support
- **Framework features** - Built-in SSR, pre-rendering, and streaming capabilities
- **React 18+ optimized** - Uses React.useTransition for better performance
- Active maintenance with regular updates and React 19 compatibility roadmap
- **New in v7:** Enhanced type generation, improved bundle splitting, middleware support

**Cons:**

- Different declarative syntax requires code restructuring
- Migration from navi patterns to React Router loaders/actions
- Learning curve for new v7 framework features (optional)

**Migration Effort:** Medium-High (4-5 weeks)

**Requirements:**

- Node.js 20+
- React 18+
- react-dom 18+

**Example Migration:**

```typescript
// Current navi
const routes = mount({
  "/:team/:flow": withData(loadFlowData)(
    route({ view: <FlowEditor /> })
  )
});

// React Router v7
const router = createBrowserRouter([
  {
    path: "/:team/:flow",
    element: <FlowEditor />,
    loader: loadFlowData,
  }
]);
```

**New v7 Package Structure:**

```typescript
// v7 simplifies imports - everything from one package
import {
  createBrowserRouter,
  RouterProvider,
  useNavigate,
  useLoaderData,
} from "react-router";

// DOM-specific features use deep import
import { RouterProvider } from "react-router/dom";
```

### 2. TanStack Router

**Current Version:** Latest with React 19 support

**Pros:**

- **100% type-safe routing** with excellent TypeScript integration
- Built-in data loading with suspense
- Modern architecture with React 18+ features
- Small bundle size and good performance
- Growing ecosystem

**Cons:**

- Relatively new with smaller community compared to React Router
- Complex type system may be overwhelming
- Less mature ecosystem
- Fewer learning resources available

**Migration Effort:** Medium-High (4-5 weeks)

### 4. Wouter

**Pros:**

- Lightweight (2KB)
- Hook-based API
- Simple migration path
- Good TypeScript support

**Cons:**

- Smaller community
- Less comprehensive ecosystem
- Limited advanced features
- May lack enterprise-grade features needed for complex routing requirements

**Migration Effort:** Low-Medium (2-3 weeks)

### 5. Reach Router / React Router v5

**Status:** Deprecated

**Recommendation:** Not recommended due to deprecation and lack of future support

## Risk Assessment

### Current Risks with React-navi

- **Security:** No security updates or bug fixes
- **Compatibility:** Potential React 19+ compatibility issues
- **Dependencies:** Transitive dependency vulnerabilities
- **Support:** No community or maintainer support
- **Technical Debt:** Accumulating over time
- **Performance:** Missing modern React 18+ optimizations

### Migration Risks

- **Breaking Changes:** Potential UI/UX disruptions during migration
- **Development Time:** Significant engineering effort required
- **Testing:** Comprehensive testing needed for all routes
- **Performance:** Temporary performance impacts during transition

## Recommended Migration Plan

### Phase 1: React Router v7 Migration (Recommended)

**Timeline:** 4-5 weeks

**Rationale:**

- Industry standard with long-term support and React 19 roadmap
- **Non-breaking upgrade path** from v6 reduces risk
- Comprehensive feature set matching current needs
- Enhanced TypeScript support with type generation
- Excellent performance with React 18+ optimizations
- Large community and mature ecosystem
- **Simplified package structure** in v7 reduces complexity

**Implementation Strategy:**

#### Week 1: Planning and Setup

- [ ] Install React Router v7 (`react-router@latest`)
- [ ] Remove react-navi dependencies
- [ ] Set up TypeScript types and route type generation
- [ ] Create migration utilities and helpers
- [ ] Plan parallel routing structure

#### Week 2: Core Route Migration

- [ ] Migrate main application routes (`/`, `/login`, `/logout`)
- [ ] Implement authentication guards using React Router loaders
- [ ] Migrate team-level routes (`/:team`)
- [ ] Set up data loading with React Router v7 loaders
- [ ] Update navigation hooks throughout application

#### Week 3: Flow and Editor Routes

- [ ] Migrate flow editor routes (`/:team/:flow`)
- [ ] Implement lazy loading for components
- [ ] Migrate complex nested routes (`/nodes`, `/published`, etc.)
- [ ] Handle custom domain routing logic
- [ ] Update all Link components and navigation calls

#### Week 4: Integration and Testing

- [ ] Comprehensive testing of all route scenarios
- [ ] Performance testing and optimization
- [ ] Update error boundaries and 404 handling
- [ ] Verify deep linking and URL parameter handling

#### Week 5: Cleanup and Documentation

- [ ] Final testing and bug fixes
- [ ] Update documentation and developer guides
- [ ] Deploy to staging and production
- [ ] Monitor performance and user feedback

### Migration Code Examples

#### Router Setup (v7)

```typescript
// Replace createBrowserNavigation with v7 setup
import { createBrowserRouter, RouterProvider } from "react-router";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    loader: rootLoader,
    children: [
      {
        path: "login",
        element: <Login />,
        loader: loginLoader,
      },
      {
        path: ":team",
        element: <TeamLayout />,
        loader: teamLoader,
        children: [
          {
            path: ":flow",
            element: <FlowEditor />,
            loader: flowLoader,
          }
        ]
      }
    ]
  }
]);

// In your app
function App() {
  return <RouterProvider router={router} />;
}
```

#### Hook Replacements

```typescript
// Replace useCurrentRoute
import { useLocation, useParams } from "react-router";

// Replace useNavigation
import { useNavigate } from "react-router";

// Replace useLoadingRoute
import { useNavigation } from "react-router";
const navigation = useNavigation();
const isLoading = navigation.state === "loading";
```

#### Data Loading Migration

```typescript
// Current withData pattern
const routes = mount({
  "/:team/:flow": withData(async (req) => {
    const flow = await fetchFlow(req.params.flow);
    return { flow };
  })(route({ view: <FlowEditor /> }))
});

// React Router v7 loader pattern
const flowLoader = async ({ params }) => {
  const flow = await fetchFlow(params.flow);
  return { flow };
};

const router = createBrowserRouter([
  {
    path: "/:team/:flow",
    element: <FlowEditor />,
    loader: flowLoader,
  }
]);

// In component
function FlowEditor() {
  const { flow } = useLoaderData();
  // Component logic
}
```

#### Authentication Guards

```typescript
// Current withContext pattern
const routes = compose(
  withContext(async () => {
    const user = await useStore.getState().initUserStore();
    return { user };
  }),
  mount({
    "/:team": route({ view: <TeamPage /> })
  })
);

// React Router v7 loader pattern
const protectedLoader = async ({ request }) => {
  const user = await getUserFromRequest(request);
  if (!user) {
    throw redirect("/login");
  }
  return { user };
};

const router = createBrowserRouter([
  {
    path: "/:team",
    element: <TeamPage />,
    loader: protectedLoader,
  }
]);
```

## Testing Strategy

### Test Coverage Requirements

- [ ] All existing route paths and redirects
- [ ] Authentication and authorization flows
- [ ] Custom domain routing behavior
- [ ] Lazy loading and code splitting
- [ ] Error boundaries and 404 handling
- [ ] Deep linking and URL parameter handling
- [ ] Data loading and error states

### Testing Tools

- **Unit Tests:** React Testing Library with React Router test utilities
- **Integration Tests:** Cypress for full routing flows
- **Performance Tests:** Lighthouse and bundle analysis
- **Accessibility Tests:** axe-core for route transitions
- **Type Tests:** TypeScript compiler and tsc-expect

## Success Metrics

### Technical Metrics

- Zero regression in existing functionality
- Improved bundle size (target: 5-10% reduction with v7)
- Faster route transitions (target: <200ms)
- 100% test coverage for routing logic
- Improved TypeScript coverage with generated types

### User Experience Metrics

- No broken links or navigation flows
- Consistent URL structure and behavior
- Proper browser back/forward button support
- Maintained accessibility standards
- Enhanced performance with React 18+ optimizations

## Dependencies to Update/Remove

### Remove

```json
{
  "navi": "^0.15.0",
  "react-navi": "^0.15.0",
  "react-navi-helmet-async": "^0.15.0"
}
```

### Add

```json
{
  "react-router": "^7.8.0"
}
```

### Note on v7 Package Simplification

React Router v7 consolidates everything into a single `react-router` package, eliminating the need for `react-router-dom`. DOM-specific features use deep imports: `react-router/dom`.

## Alternative: Gradual Migration Strategy

If a full migration is not feasible, consider:

1. **Hybrid Approach:** Run both routers in parallel for different sections
2. **Feature Flags:** Gradually enable React Router for specific routes
3. **Micro-frontend:** Isolate routing changes to specific application areas

## React Router v7 Advantages for This Migration

### Non-Breaking Upgrade Path

- v7 is designed as a non-breaking upgrade from v6
- Future flags allow gradual adoption
- Simplified migration process compared to other major version changes

### Enhanced Performance

- React 18+ optimizations with useTransition
- Improved bundle splitting and lazy loading
- Better streaming and hydration support

### Developer Experience

- Type generation for routes, loaders, and params
- Enhanced debugging tools
- Simplified package structure

### Future-Proofing

- React 19 compatibility roadmap
- Active development and maintenance
- Framework features for modern web apps

## Conclusion

React Router v7 provides the optimal balance of features, community support, and migration effort for the PlanX editor application. The **non-breaking upgrade path** and **simplified package structure** significantly reduce migration risks compared to other alternatives.

The 4-5 week migration timeline allows for thorough testing and gradual rollout while addressing the technical debt and maintenance risks of the current React-navi implementation.

The migration will result in a more maintainable, performant, and future-proof routing solution that leverages modern React patterns and ensures long-term project sustainability.

## Next Steps

1. **Stakeholder Approval:** Present this analysis to development team and product stakeholders
2. **Resource Allocation:** Assign dedicated development resources for migration period
3. **Timeline Coordination:** Schedule migration around other development priorities
4. **Risk Mitigation:** Establish rollback procedures and monitoring for migration phases
5. **Team Training:** Provide React Router v7 training for development team
6. **Proof of Concept:** Create small demo migration to validate approach

---

**Document Owner:** Development Team
**Last Updated:** August 13, 2025
**Next Review:** Upon stakeholder approval
**React Router Version:** v7.8.0

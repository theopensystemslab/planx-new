# Team Route Migration Plan: React Navi → TanStack Router

## Overview
Migrating the complex team route structure from `routes-navi/team.tsx` to TanStack Router at `routes/_authenticated/$team/`.

## Current Structure Analysis

### Navi Implementation Patterns:
1. **withData**: Passes `team` param as route data
2. **withContext**: Handles team initialization via `initTeamStore()`
3. **mount**: Defines nested route structure with lazy loading
4. **Flow caching**: Uses cached variables to avoid re-fetching flow data

### Current Routes to Migrate:
- `/` → Team component (root team page)
- `/:flow` → Flow editor with GraphQL query and store updates
- `/:flow/about` → ReadMe page
- `/:flow/settings` → Service settings
- `/:flow/feedback` → Service feedback
- `/:flow/submissions` → Service submissions
- `/submissions` → Team submissions
- `/members` → Team members
- `/design` → Design settings component
- `/feedback` → Team feedback
- `/general-settings` → General settings component
- `/subscription` → Team subscription

## Migration Strategy

### 1. Team Route Layout (`$team.tsx`)
- **beforeLoad**: Handle team initialization (replace withContext logic)
- **loader**: Fetch team data if needed
- **component**: Outlet wrapper for nested routes

### 2. Team Index Route (`$team/index.tsx`)
- Simple route rendering Team component
- Access team data from parent context/store

### 3. Flow Routes (`$team/$flow/`)
- Create layout route for flow-specific logic
- Handle GraphQL flow query and caching
- Nested routes for flow features

### 4. Team-Level Routes
- Direct routes under `$team/` for team features
- Members, feedback, subscription, etc.

## Implementation Checklist

### Phase 1: Core Team Route Setup
- [ ] Create `$team.tsx` layout route with team initialization
- [ ] Implement `beforeLoad` for team context setup
- [ ] Create `$team/index.tsx` for Team component
- [ ] Test basic team route functionality

### Phase 2: Flow Route Migration
- [ ] Create `$team/$flow.tsx` layout route
- [ ] Migrate GraphQL flow query logic
- [ ] Implement flow caching mechanism
- [ ] Create `$team/$flow/index.tsx` for flow editor
- [ ] Test flow route access and data loading

### Phase 3: Flow Feature Routes
- [ ] Create `$team/$flow/about.tsx`
- [ ] Create `$team/$flow/settings.tsx`
- [ ] Create `$team/$flow/feedback.tsx`
- [ ] Create `$team/$flow/submissions.tsx`
- [ ] Test all flow feature routes

### Phase 4: Team Feature Routes
- [ ] Create `$team/submissions.tsx`
- [ ] Create `$team/members.tsx`
- [ ] Create `$team/design.tsx`
- [ ] Create `$team/feedback.tsx`
- [ ] Create `$team/general-settings.tsx`
- [ ] Create `$team/subscription.tsx`
- [ ] Test all team feature routes

### Phase 5: Integration & Testing
- [ ] Test route navigation between all routes
- [ ] Verify store state management works correctly
- [ ] Test error handling (team not found, flow not found)
- [ ] Verify lazy loading still works
- [ ] Test caching behavior for flows
- [ ] Update any navigation links/components

## Key Technical Considerations

### Store Integration Pattern
**Current Analysis**: The Team component relies heavily on the store:
- Uses `useStore((state) => [state.getTeam(), state.canUserEditTeam, ...])`
- Expects team data to be available in store via `initTeamStore()`
- No props passed from Navi route - all data comes from store

**Migration Strategy**:
- Use `beforeLoad` for team initialization (mirror `withContext` logic)
- Keep Team component unchanged - continue reading from store
- Loader functions will handle data fetching but sync to store for compatibility

### Route Structure Implementation
```
$team.tsx (layout)
├── beforeLoad: team validation & initTeamStore()
├── loader: additional team data if needed
├── component: <Outlet /> wrapper
│
├── index.tsx → Team component
├── members.tsx → lazy(() => import("../teamMembers"))
├── submissions.tsx → lazy(() => import("../submissions"))
├── feedback.tsx → lazy(() => import("../feedback"))
├── design.tsx → DesignSettings component
├── general-settings.tsx → GeneralSettings component
├── subscription.tsx → lazy(() => import("../subscription"))
│
└── $flow.tsx (nested layout)
    ├── beforeLoad: flow validation & caching
    ├── loader: GraphQL flow query
    ├── component: flowEditorView wrapper
    │
    ├── index.tsx → flow editor
    ├── about.tsx → lazy(() => import("../readMePage"))
    ├── settings.tsx → lazy(() => import("../serviceSettings"))
    ├── feedback.tsx → lazy(() => import("../serviceFeedback"))
    └── submissions.tsx → lazy(() => import("../serviceSubmissions"))
```

### Error Handling Strategy
- **Team not found**: throw NotFoundError in `$team.tsx` beforeLoad
- **Flow not found**: handle in `$flow.tsx` loader with custom error component
- **Domain validation**: implement `validateTeamRoute` in beforeLoad
- Maintain existing error UX patterns

### Caching Implementation
```typescript
// Global cache object (maintain existing pattern)
let cached: { flowSlug?: string; teamSlug?: string } = {
  flowSlug: undefined,
  teamSlug: undefined,
};

// In $flow.tsx loader
if (JSON.stringify(cached) !== JSON.stringify(variables)) {
  cached = variables;
  // Fetch and cache flow data
}
```

### Data Flow Pattern
1. **beforeLoad** (team): `getTeamFromDomain()` → `initTeamStore()` → store populated
2. **beforeLoad** (flow): validate flow params, check cache
3. **loader** (flow): GraphQL query → cache → store update → return data
4. **component**: reads from store (existing pattern) + optional loader data

## Migration Order & Implementation Details

### Phase 1: Core Team Route Setup ✅ COMPLETED
**Files created:**
- ✅ `$team.tsx` - Layout with team initialization
- ✅ `$team/index.tsx` - Team component route

**Key Implementation:**
```typescript
// $team.tsx beforeLoad
beforeLoad: async ({ params }) => {
  const routeSlug = params.team || (await getTeamFromDomain(window.location.hostname));

  if (currentSlug !== routeSlug) {
    try {
      await useStore.getState().initTeamStore(routeSlug);
    } catch (error) {
      throw new NotFoundError(`Team not found: ${error}`);
    }
  }

  await validateTeamRoute({ params }); // domain validation
}
```

### Phase 2: Flow Route Migration ✅ COMPLETED
**Files created:**
- ✅ `$team/$flow.tsx` - Flow layout with caching logic
- ✅ `$team/$flow/index.tsx` - Flow editor route

**Key Implementation:**
- ✅ Migrated complex GraphQL caching from Navi
- ✅ Handle flow name setting in store
- ⏳ Preserve `setFlowAndLazyLoad` pattern (partially - needs flow feature routes)

### Phase 3: Team & Flow Feature Routes ⏳ IN PROGRESS
**Simple routes (direct component imports):**
- [ ] `$team/design.tsx` → DesignSettings
- [ ] `$team/general-settings.tsx` → GeneralSettings

**Lazy routes (maintain code splitting):**
- [ ] `$team/members.tsx` → `lazy(() => import("routes-navi/teamMembers"))`
- [ ] `$team/submissions.tsx` → `lazy(() => import("routes-navi/submissions"))`
- [ ] `$team/feedback.tsx` → `lazy(() => import("routes-navi/feedback"))`
- [ ] `$team/subscription.tsx` → `lazy(() => import("routes-navi/subscription"))`

**Flow feature routes:**
- [ ] `$team/$flow/about.tsx` → `setFlowAndLazyLoad(() => import("routes-navi/readMePage"))`
- [ ] `$team/$flow/settings.tsx` → `setFlowAndLazyLoad(() => import("routes-navi/serviceSettings"))`
- [ ] `$team/$flow/feedback.tsx` → `setFlowAndLazyLoad(() => import("routes-navi/serviceFeedback"))`
- [ ] `$team/$flow/submissions.tsx` → `setFlowAndLazyLoad(() => import("routes-navi/serviceSubmissions"))`

## Testing Strategy
- [ ] Test team route loads Team component correctly
- [ ] Verify store state after team initialization
- [ ] Test team not found error handling
- [ ] Test domain validation for custom domains
- [ ] Test flow route caching behavior
- [ ] Test flow not found error handling
- [ ] Test all lazy-loaded routes resolve correctly
- [ ] Verify navigation between team and flow routes
- [ ] Test with different team/flow combinations
- [ ] Verify `makeTitle` functionality works

## Progress Summary
**✅ Completed:**
- Core team route structure with layout and index
- Team initialization logic ported from Navi withContext
- Domain validation for custom domains
- Flow route with GraphQL caching logic
- Flow editor route setup

**⏳ Next Steps:**
- Implement remaining team feature routes (members, submissions, etc.)
- Create flow feature routes (about, settings, feedback, submissions)
- Test navigation and data flow
- Verify error handling scenarios

## Critical Dependencies & Utilities Needed
- `getTeamFromDomain` - domain to team mapping
- `validateTeamRoute` - custom domain validation
- `makeTitle` - page title generation
- `getFlowEditorData` - flow metadata fetching
- `useStore.getState().initTeamStore()` - team initialization
- GraphQL flow query with caching logic
- All existing lazy import paths from routes-navi

## Rollback Plan
- Keep `routes-navi/team.tsx` until full migration verified
- Use route precedence to test TanStack routes gradually
- Document any breaking changes for team awareness
- Feature flag approach if needed for gradual rollout

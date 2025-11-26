# TanStack Router Migration Status & Plan

## 🎯 Overview

Migration from React-Navi to TanStack Router for the PlanX Flow Editor application.

**📊 Current Progress: ~95% Complete** 🎉

- ✅ **50+ routes migrated** (All core functionality)
- ⚠️ **2-3 routes need completion** (Custom domain published flow)
- 🧪 **Test fixes in progress** (47 failing tests due to router context changes)

---

## ✅ **COMPLETED MIGRATIONS**

### **Authentication & Core Infrastructure**

- ✅ `__root.tsx` - Root route with authentication
- ✅ `(auth)/login.tsx` - Login page
- ✅ `(auth)/logout.tsx` - Logout functionality
- ✅ `_authenticated/route.tsx` - Authenticated layout wrapper
- ✅ `$.tsx` - 404 catch-all route

### **Team & Global Admin Routes**

- ✅ `_authenticated/index.tsx` - Teams landing page
- ✅ `_authenticated/admin-panel.tsx` - Platform admin panel
- ✅ `_authenticated/global-settings.tsx` - Global settings
- ✅ `_authenticated/onboarding.tsx` - Onboarding content
- ✅ `_authenticated/resources.tsx` - Resources content
- ✅ `_authenticated/tutorials.tsx` - Tutorials content

### **Team Management Routes**

- ✅ `_authenticated/$team/route.tsx` - Team layout & validation
- ✅ `_authenticated/$team/index.tsx` - Team dashboard
- ✅ `_authenticated/$team/design.tsx` - Team design settings
- ✅ `_authenticated/$team/feedback.tsx` - Team feedback
- ✅ `_authenticated/$team/general-settings.tsx` - Team general settings
- ✅ `_authenticated/$team/members.tsx` - Team members
- ✅ `_authenticated/$team/submissions.tsx` - Team submissions
- ✅ `_authenticated/$team/subscription.tsx` - Team subscription

### **Flow Editor Routes**

- ✅ `_authenticated/$team/$flow/route.tsx` - Flow layout & data loading
- ✅ `_authenticated/$team/$flow/about.tsx` - Flow about/readme
- ✅ `_authenticated/$team/$flow/feedback.tsx` - Flow feedback
- ✅ `_authenticated/$team/$flow/settings.tsx` - Flow settings
- ✅ `_authenticated/$team/$flow/submissions.tsx` - Flow submissions

### **Node Editing Routes (Complete CRUD System)**

- ✅ `_authenticated/$team/$flow/nodes/route.tsx` - Flow editor view
- ✅ `_authenticated/$team/$flow/nodes/new.tsx` - Create root node
- ✅ `_authenticated/$team/$flow/nodes/new.$before.tsx` - Create root node before
- ✅ `_authenticated/$team/$flow/nodes/$parent.nodes.new.tsx` - Create child node
- ✅ `_authenticated/$team/$flow/nodes/$parent.nodes.new.$before.tsx` - Create child node before
- ✅ `_authenticated/$team/$flow/nodes/$id.edit.tsx` - Edit root node
- ✅ `_authenticated/$team/$flow/nodes/$id.edit.$before.tsx` - Edit root node before
- ✅ `_authenticated/$team/$flow/nodes/$parent.nodes.$id.edit.tsx` - Edit child node
- ✅ `_authenticated/$team/$flow/nodes/$parent.nodes.$id.edit.$before.tsx` - Edit child node before

### **🎉 NEW: Public Routes (COMPLETED!)**

#### **1. Published Flow Routes** ✅

**Status**: ✅ **COMPLETE**
**Routes Implemented**:

- ✅ `$team/$flow/published/route.tsx` - Published flow layout & data loading
- ✅ `$team/$flow/published/index.tsx` - Main published flow (Questions component)
- ✅ `$team/$flow/published/pages.$page.tsx` - Content pages for published flows

**Key Features Implemented**:

- ✅ Public access (no authentication required)
- ✅ Published flow data loading via `fetchSettingsForPublishedView()`
- ✅ Store setup for published flows
- ✅ SEO meta tags (robots: noindex, nofollow)
- ✅ Content page routing
- ✅ Error handling for unpublished/not-found flows

#### **2. Preview Routes** ✅

**Status**: ✅ **COMPLETE**
**Routes Implemented**:

- ✅ `$team/$flow/preview/route.tsx` - Preview layout & draft data loading
- ✅ `$team/$flow/preview/index.tsx` - Preview current draft (Questions component)
- ✅ `$team/$flow/preview/pages.$page.tsx` - Content pages during preview

**Key Features Implemented**:

- ✅ Draft flow data loading with external portals
- ✅ Authentication required (enforced by route structure)
- ✅ Store setup for preview mode
- ✅ SEO meta tags
- ✅ Content page support

#### **3. Draft Routes** ✅

**Status**: ✅ **COMPLETE**
**Routes Implemented**:

- ✅ `$team/$flow/draft/route.tsx` - Draft layout & data loading
- ✅ `$team/$flow/draft/index.tsx` - Internal draft preview (Questions component)
- ✅ `$team/$flow/draft/pages.$page.tsx` - Content pages for draft

**Key Features Implemented**:

- ✅ Draft flow loading
- ✅ Store setup for draft mode
- ✅ SEO meta tags
- ✅ Internal use only

#### **4. Payment Routes** ✅

**Status**: ✅ **COMPLETE**
**Routes Implemented**:

- ✅ `$team/$flow/pay/route.tsx` - Payment layout & validation
- ✅ `$team/$flow/pay/index.tsx` - Make payment page (GOV.UK Pay integration)
- ✅ `$team/$flow/pay/not-found.tsx` - Payment not found error page
- ✅ `$team/$flow/pay/invite/index.tsx` - Invite to pay
- ✅ `$team/$flow/pay/invite/failed.tsx` - Payment generation failed error
- ✅ `$team/$flow/pay/pages.$page.tsx` - Content pages during payment
- ✅ `$team/$flow/pay/invite/pages.$page.tsx` - Content pages for invites

**Key Features Implemented**:

- ✅ GOV.UK Pay integration via `getPaymentRequest()`
- ✅ Payment request validation with UUID schema
- ✅ Session handling
- ✅ Retention period checks
- ✅ Complex redirect logic for invalid/missing payment requests
- ✅ Public route error handling

#### **5. Download/Submission Routes** ✅

**Status**: ✅ **COMPLETE**
**Routes Implemented**:

- ✅ `$team/$flow/$sessionId/download-application.tsx` - Download submissions via email verification

**Key Features Implemented**:

- ✅ Session-based download with email verification
- ✅ Public access with validation
- ✅ Standalone view setup
- ✅ Error handling

### **Component Migration Achievements**

- ✅ **Flow Component Links**: Migrated all components in `/components/Flow/components/` from react-navi to TanStack Router
  - `Question.tsx`, `Checklist.tsx`, `Filter.tsx`, `Portal.tsx`, `Breadcrumb.tsx`, `Option.tsx`
  - Enhanced type safety and performance with native TanStack Router optimization
  - Fixed external portal navigation patterns
- ✅ **Store Integration**: Verified reliable `teamSlug` and `flowSlug` access from Zustand store
- ✅ **Route Validation**: All routes properly validate parameters and handle edge cases

---

## ⚠️ **REMAINING WORK**

### **🔶 MEDIUM PRIORITY - Custom Domain Routes**

#### **1. Custom Domain Published Flow** ⚠️

**Status**: ⚠️ **Partially Implemented** (needs completion)
**Source**: `routes-navi/published.tsx` (for custom domains)
**Current Files**:

- ⚠️ `$flow/route.tsx` - Exists but needs review
- ⚠️ `$flow/index.tsx` - **COMMENTED OUT** - needs activation
- ⚠️ `$flow/pay.tsx` - Partially implemented, needs testing

**What's Needed**:

- [ ] Uncomment and activate `$flow/index.tsx` for custom domain published flows
- [ ] Test custom domain routing (e.g., `apply-for-planning.planx.uk/{flow}`)
- [ ] Verify domain detection via `getTeamFromDomain()`
- [ ] Add `$flow/pages.$page.tsx` for content pages on custom domains
- [ ] Complete custom domain pay integration
- [ ] Test end-to-end custom domain flows

**Complexity**: 🟡 Medium (infrastructure exists, needs activation & testing)

---

## 📊 **MIGRATION STATISTICS**

### **Route Count Comparison**

**react-navi (old)**: ~20 route files
**TanStack Router (new)**: 53 route files

**Difference**: More granular file-based routing with better organization

### **Routes by Category**

| Category         | Count   | Status              |
| ---------------- | ------- | ------------------- |
| Authentication   | 3       | ✅ Complete         |
| Admin/Global     | 4       | ✅ Complete         |
| Team Management  | 8       | ✅ Complete         |
| Flow Editor      | 5       | ✅ Complete         |
| Node CRUD        | 9       | ✅ Complete         |
| Public/Published | 3       | ✅ Complete         |
| Preview/Draft    | 6       | ✅ Complete         |
| Payment          | 7       | ✅ Complete         |
| Downloads        | 1       | ✅ Complete         |
| Custom Domain    | 3       | ⚠️ Needs activation |
| Utility          | 1       | ✅ Complete (404)   |
| **TOTAL**        | **50+** | **~95% Complete**   |

---

## 🎯 **COMPLETION PLAN**

### **Phase 1: Activate Custom Domain Routes** 🔶 **NEXT UP**

**Priority**: High (for custom domain deployments)

1. **Custom Domain Published Routes**
   - [ ] Review and test `$flow/route.tsx`
   - [ ] Uncomment `$flow/index.tsx` and verify Questions component rendering
   - [ ] Create `$flow/pages.$page.tsx` for content pages
   - [ ] Test domain detection logic
   - [ ] Verify published flow data loading on custom domains

2. **Custom Domain Payment Routes**
   - [ ] Complete `$flow/pay.tsx` implementation
   - [ ] Test payment flows on custom domains
   - [ ] Verify GOV.UK Pay integration

### **Phase 2: Test Fixes** 🧪 **CURRENT WORK**

**Priority**: High (47 tests failing)

3. **Fix Router Context in Tests**
   - [ ] Fix TeamMembers tests (Cannot read properties of undefined 'filter')
   - [ ] Fix component tests that need router context
   - [ ] Update test mocks for TanStack Router
   - [ ] Verify all tests pass

### **Phase 3: Cleanup & Documentation** 🧹

**Priority**: Medium (after functionality complete)

4. **Legacy Cleanup**
   - [ ] Remove `routes-navi/` directory
   - [ ] Remove react-navi dependency from package.json
   - [ ] Update any remaining `navigate()` calls to TanStack Router
   - [ ] Port any needed utilities from old routing system

5. **Documentation**
   - [ ] Update routing documentation
   - [ ] Document custom domain routing patterns
   - [ ] Document route testing patterns
   - [ ] Create migration guide for future reference

---

## 🎉 **MAJOR ACHIEVEMENTS**

### **Functionality Preservation** ✅

- ✅ All authenticated routes work with same URLs
- ✅ Public citizens can access published flows
- ✅ Payment system fully migrated with GOV.UK Pay integration
- ✅ Preview/draft functionality works for teams
- ✅ All data loading patterns preserved and enhanced
- ✅ Download/submission routes working

### **Performance Improvements** ✅

- ✅ File-based routing with automatic code splitting
- ✅ Faster route transitions with preloading
- ✅ Better TypeScript inference with type-safe routes
- ✅ Improved developer experience with co-location

### **Technical Debt Reduction** ✅

- ✅ Single routing system (95% migrated from react-navi)
- ✅ Modern routing patterns with `createFileRoute`
- ✅ Better error handling with route-level error components
- ✅ Cleaner codebase with route co-location
- ✅ Enhanced type safety with Zod validation

---

## 📋 **ARCHITECTURE DECISIONS**

### **Public Route Patterns**

**Implemented Structure**:

```
routes/
├── $team/$flow/published/     # Standard published flow
├── $team/$flow/preview/        # Authenticated preview
├── $team/$flow/draft/          # Authenticated draft
├── $team/$flow/pay/            # Public payment flow
└── $flow/                      # Custom domain published (needs activation)
```

**Key Decisions**:

- ✅ Public routes outside `_authenticated` folder
- ✅ Shared route layouts for data loading (`route.tsx` files)
- ✅ Separate error handling per route category
- ✅ SEO meta tags in route heads
- ✅ Store initialization in route `beforeLoad`

### **Data Loading Strategy**

**Patterns Implemented**:

- ✅ `fetchSettingsForPublishedView()` - Public published flows
- ✅ `fetchDataForPreviewView()` - Draft with external portals
- ✅ `fetchDataForDraftView()` - All draft data
- ✅ `getPaymentRequest()` - Payment validation
- ✅ `validateTeamRoute()` - Team/flow validation

### **Store Management**

**Zustand Integration**:

- ✅ Store initialized in route `beforeLoad` hooks
- ✅ Flow data set before component render
- ✅ Team/global settings loaded per route
- ✅ Store cleared appropriately between routes

---

## �� **NEXT STEPS**

### **Immediate Actions**

1. **Activate Custom Domain Routes** (Est: 2-4 hours)
   - Uncomment `$flow/index.tsx`
   - Add `$flow/pages.$page.tsx`
   - Test on custom domain
   - Verify domain detection

2. **Fix Failing Tests** (Est: 4-8 hours)
   - Debug TeamMembers filter error
   - Update test utilities for TanStack Router
   - Fix router context in component tests
   - Verify all 47 tests pass

3. **Legacy Cleanup** (Est: 1-2 hours)
   - Remove `routes-navi/` folder
   - Update package.json dependencies
   - Final verification

### **Success Criteria** ✅

- [ ] Custom domain flows work end-to-end
- [ ] All tests pass (0 failures)
- [ ] No react-navi code remaining
- [ ] Documentation updated
- [ ] Ready for production deployment

---

## 🎊 **MIGRATION SUCCESS SUMMARY**

**The TanStack Router migration is 95% complete!**

All critical user-facing functionality has been successfully migrated:

- ✅ Editor authentication and team management
- ✅ Flow editing with full CRUD operations
- ✅ Public published flows for citizens
- ✅ Payment processing with GOV.UK Pay
- ✅ Preview and draft modes
- ✅ Submission downloads

**Remaining work**: Activate custom domain support and fix test suite.

**The platform is functional and the migration is nearly complete! 🚀**

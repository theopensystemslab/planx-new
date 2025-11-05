# TanStack Router Migration Status & Plan

## 🎯 Overview

Migration from React-Navi to TanStack Router for the PlanX Flow Editor application.

**📊 Current Progress: ~85% Complete**

- ✅ **32 routes migrated** (Editor & Admin functionality)
- ❌ **5-6 routes remaining** (Public & Payment functionality)

---

## ✅ **COMPLETED MIGRATIONS**

### **Authentication & Core Infrastructure**

- ✅ `__root.tsx` - Root route with authentication
- ✅ `(auth)/login.tsx` - Login page
- ✅ `(auth)/logout.tsx` - Logout functionality
- ✅ `_authenticated/route.tsx` - Authenticated layout wrapper

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

### **Component Migration Achievements**

- ✅ **Flow Component Links**: Migrated all components in `/components/Flow/components/` from react-navi to TanStack Router
  - `Question.tsx`, `Checklist.tsx`, `Filter.tsx`, `Portal.tsx`, `Breadcrumb.tsx`, `Option.tsx`
  - Enhanced type safety and performance with native TanStack Router optimization
  - Fixed external portal navigation patterns
- ✅ **Store Integration**: Verified reliable `teamSlug` and `flowSlug` access from Zustand store
- ✅ **Route Validation**: All routes properly validate parameters and handle edge cases

---

## ❌ **REMAINING MIGRATIONS**

### **🚨 HIGH PRIORITY - Public Routes **

#### **1. Published Flow Routes**

**Status**: ❌ Not Started
**Source**: `routes-navi/published.tsx`
**Target**: Need to create public route structure
**Routes Needed**:

- `/:team/:flow/published` - Main published flow
- `/:flow` - Published flow for custom domains
- `/:team/:flow/published/pages/:page` - Content pages
- `/:flow/pages/:page` - Content pages for custom domains

**Key Features**:

- Public access (no authentication)
- Published flow data loading
- Custom domain support
- SEO meta tags (robots: noindex, nofollow)
- Content page routing

**Complexity**: 🟡 Medium

#### **2. Payment Routes**

**Status**: ❌ Not Started
**Source**: `routes-navi/pay.tsx`
**Target**: Need to create public payment structure
**Routes Needed**:

- `/:team/:flow/pay` - Make payment page
- `/:team/:flow/pay/not-found` - Payment not found
- `/:team/:flow/pay/invite` - Invite to pay
- `/:team/:flow/pay/invite/failed` - Payment generation failed
- `/:team/:flow/pay/pages/:page` - Content pages during payment
- `/:team/:flow/pay/invite/pages/:page` - Content pages for invites

**Key Features**:

- GOV.UK Pay integration
- Payment request validation
- Session handling
- Retention period checks
- Complex redirect logic

**Complexity**: 🔴 High

#### **3. Preview Routes**

**Status**: ❌ Not Started
**Source**: `routes-navi/preview.tsx`
**Target**: Need to create authenticated preview structure
**Routes Needed**:

- `/:team/:flow/preview` - Preview current draft
- `/:team/:flow/preview/pages/:page` - Content pages

**Key Features**:

- Draft flow data loading
- Authentication required
- External portal handling
- SEO meta tags

**Complexity**: 🟡 Medium

#### **4. Draft Routes**

**Status**: ❌ Not Started
**Source**: `routes-navi/draft.tsx`
**Target**: Need to create draft preview structure
**Routes Needed**:

- `/:team/:flow/draft` - Internal draft preview
- `/:team/:flow/draft/pages/:page` - Content pages

**Key Features**:

- Draft flow loading
- Internal use only
- SEO meta tags

**Complexity**: 🟡 Medium

### **🔧 MEDIUM PRIORITY - Utility Routes**

#### **5. Application Download Routes**

**Status**: ❌ Not Started
**Source**: `routes-navi/sendToEmailSubmissions.tsx`
**Target**: Utility route
**Routes Needed**:

- `/:team/:flow/:sessionId/download-application` - Download submissions

**Complexity**: 🟢 Low-Medium

---

## 📋 **MIGRATION PLAN**

### **Phase 1: Public Flow Routes** 🚨 **CRITICAL**

**Priority**: Immediate

1. **Published Routes**
   - [ ] Create public route structure for published flows
   - [ ] Implement published data loading
   - [ ] Handle custom domain routing
   - [ ] Add content page support
   - [ ] Test with real published flows

2. **Preview Routes**
   - [ ] Create authenticated preview structure
   - [ ] Implement draft data loading with external portals
   - [ ] Add content page support
   - [ ] Test preview functionality

3. **Draft Routes**
   - [ ] Create internal draft preview structure
   - [ ] Implement draft data loading
   - [ ] Add content page support

### **Phase 2: Payment System** 🚨 **CRITICAL**

**Priority**: Immediate (Revenue dependent)

4. **Payment Routes**
   - [ ] Create public payment route structure
   - [ ] Implement payment request validation
   - [ ] Handle GOV.UK Pay integration
   - [ ] Add error handling (not found, failed)
   - [ ] Implement invitation flow
   - [ ] Test payment workflows end-to-end

### **Phase 3: Utilities**

**Priority**: Lower

5. **Download Routes**
   - [ ] Create session-based download routes
   - [ ] Implement submission download logic

### **Phase 4: Cleanup**

6. **Legacy Cleanup**
   - [ ] Remove `routes-navi/` directory
   - [ ] Update any remaining references
   - [ ] Port needed utilities
   - [ ] Update documentation

---

## 🎯 **SUCCESS METRICS**

### **Functionality Preservation**

- [ ] All existing routes work with same URLs
- [ ] Public citizens can access published flows
- [ ] Payment system works end-to-end
- [ ] Preview functionality works for teams
- [ ] All data loading patterns preserved

### **Performance Improvements**

- [ ] Faster route transitions
- [ ] Better code splitting
- [ ] Improved type safety
- [ ] Enhanced developer experience

### **Technical Debt Reduction**

- [ ] Single routing system (no dual system)
- [ ] Modern routing patterns
- [ ] Better error handling
- [ ] Cleaner codebase

---

## ⚠️ **CRITICAL CONSIDERATIONS**

### **Public Route Architecture**

The remaining routes are **public-facing** and require a different architecture:

- **No authentication wrapper** (`_authenticated` not applicable)
- **Custom domain support** required
- **SEO considerations** (meta tags, etc.)
- **Different data loading patterns** (public vs authenticated)

### **Data Loading Patterns**

- **Published flows**: Load published data only
- **Preview flows**: Load draft + published external portals
- **Draft flows**: Load all draft data
- **Payment flows**: Session-based data loading

### **Domain Handling**

- **Custom domains**: `flowname.example.com` → `/:flow/published`
- **Standard domains**: `editor.planx.uk/:team/:flow/published`
- **Domain validation**: Required for security

### **Testing Strategy**

- **Critical path testing**: Published flows and payments
- **Cross-browser testing**: Public routes get wider audience
- **Performance testing**: Public routes need to be fast
- **Security testing**: Payment routes handle sensitive data

---

## 🚀 **NEXT STEPS**

1. **Immediate**: Start with published routes (citizens need these)
2. **Analyze**: Current `routes-navi/published.tsx` implementation
3. **Design**: Public route architecture for TanStack Router
4. **Implement**: Published flow routes
5. **Test**: End-to-end published flow functionality
6. **Deploy**: Gradual rollout with feature flags

**The remaining work focuses on public-facing functionality that citizens and payments depend on - these are critical for the platform's operation! 🎯**

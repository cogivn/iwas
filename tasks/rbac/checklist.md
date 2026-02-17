# RBAC Implementation Checklist

**Project:** IWAS Platform  
**Feature:** Role-Based Access Control (RBAC)  
**Start Date:** 2026-02-17  
**Target Completion:** Week of 2026-03-10

---

## 🎯 Current Status (2026-02-17)

**Phase 1 Complete! ✅**

All core access utilities have been implemented:

- ✅ User schema updated with tenant-specific roles
- ✅ All role check functions created (isSuperAdmin, isOrgAdmin, isLocationManager, isCustomer)
- ✅ All scope functions created for query filtering
- ✅ Helper functions in auth.ts completed

**Next Up: Phase 2 - Collection Access Control**

- Apply RBAC to Locations, Packages, Sessions, and Tenants collections
- Implement field-level permissions for sensitive data

## 📊 Overall Progress

- [x] **Phase 1:** Core Access Utilities (6/6 tasks) ✅
- [ ] **Phase 2:** Collection Access Control (0/4 tasks)
- [ ] **Phase 3:** Field-Level Permissions (0/3 tasks)
- [ ] **Phase 4:** Testing & Validation (0/4 tasks)
- [ ] **Phase 5:** Documentation & Deployment (0/3 tasks)

**Total Progress:** 6/20 tasks (30%)
**Last Updated:** 2026-02-17 11:15

---

## 🏗️ Phase 1: Core Access Utilities

### Task 1.1: Update User Collection Schema ✅

**File:** `src/collections/Users.ts`  
**Estimated Time:** 2 hours  
**Status:** ✅ Complete

- [x] Add `roles` field to `tenants` array
  - [x] Define role options: `org-admin`, `loc-manager`, `customer`
  - [x] Make field required
  - [x] Allow multiple selection
- [x] Add `assignedLocations` relationship field
  - [x] Set `relationTo: 'locations'`
  - [x] Enable `hasMany: true`
  - [x] Add conditional visibility (only for loc-manager)
- [x] Add `canDownloadScripts` checkbox field
  - [x] Set default value to `false`
  - [x] Add admin description
  - [x] Add conditional visibility (only for loc-manager)
- [x] Generate TypeScript types
  ```bash
  pnpm payload generate:types
  ```
- [x] Verify fields appear correctly in Admin UI
- [x] Test field visibility conditions

**Acceptance Criteria:**

- ✅ All new fields visible in Admin UI
- ✅ Conditional fields show/hide correctly
- ✅ TypeScript types generated without errors
- ✅ No breaking changes to existing user data

---

### Task 1.2: Create `isSuperAdmin` Utility ✅

**File:** `src/access/isSuperAdmin.ts`  
**Estimated Time:** 30 minutes  
**Status:** ✅ Complete

- [x] Create file with function signature
- [x] Implement role check logic
- [x] Add TypeScript type annotations
- [x] Add JSDoc comments
- [ ] Write unit tests (TODO: Phase 4)
- [x] Export from `src/access/index.ts`

**Test Cases:**

- [ ] Returns `true` for `role: 'admin'` (TODO: Phase 4)
- [ ] Returns `false` for `role: 'user'` (TODO: Phase 4)
- [ ] Returns `false` for `null` user (TODO: Phase 4)

---

### Task 1.3: Create `isOrgAdmin` Utility ✅

**File:** `src/access/isOrgAdmin.ts`  
**Estimated Time:** 1 hour  
**Status:** ✅ Complete

- [x] Create `isOrgAdmin` function
  - [x] Check if user is super admin first
  - [x] Check if user has `org-admin` role in any tenant
- [x] Create `orgAdminScope` function
  - [x] Return `true` for super admin
  - [x] Return tenant filter for org admin
  - [x] Return `false` if no tenants
- [x] Add TypeScript type annotations
- [x] Add JSDoc comments
- [ ] Write unit tests (TODO: Phase 4)
- [x] Export from `src/access/index.ts`

**Test Cases:**

- [ ] Super admin returns `true` (TODO: Phase 4)
- [ ] User with `org-admin` role returns `true` (TODO: Phase 4)
- [ ] User without `org-admin` role returns `false` (TODO: Phase 4)
- [ ] Scope returns correct tenant filter (TODO: Phase 4)

---

### Task 1.4: Create `isLocationManager` Utility ✅

**File:** `src/access/isLocationManager.ts`  
**Estimated Time:** 1.5 hours  
**Status:** ✅ Complete

- [x] Create `isLocationManager` function
  - [x] Check super admin
  - [x] Check org admin
  - [x] Check `loc-manager` role in tenants
- [x] Create `locationManagerScope` function
  - [x] Return `true` for super admin
  - [x] Return org scope for org admin
  - [x] Return assigned locations filter for loc manager
  - [x] Handle empty `assignedLocations`
- [x] Add TypeScript type annotations
- [x] Add JSDoc comments
- [ ] Write unit tests (TODO: Phase 4)
- [x] Export from `src/access/index.ts`

**Test Cases:**

- [ ] Super admin returns `true` (TODO: Phase 4)
- [ ] Org admin returns `true` (TODO: Phase 4)
- [ ] User with `loc-manager` role returns `true` (TODO: Phase 4)
- [ ] User without role returns `false` (TODO: Phase 4)
- [ ] Scope returns correct location filter (TODO: Phase 4)
- [ ] Empty `assignedLocations` returns `false` (TODO: Phase 4)

---

### Task 1.5: Create `isCustomer` Utility ✅

**File:** `src/access/isCustomer.ts`  
**Estimated Time:** 45 minutes  
**Status:** ✅ Complete

- [x] Create `isCustomer` function
  - [x] Check `customer` role in tenants
- [x] Create `customerScope` function
  - [x] Return user ID filter
  - [x] Handle null user
- [x] Add TypeScript type annotations
- [x] Add JSDoc comments
- [ ] Write unit tests (TODO: Phase 4)
- [x] Export from `src/access/index.ts`

**Test Cases:**

- [ ] User with `customer` role returns `true` (TODO: Phase 4)
- [ ] User without role returns `false` (TODO: Phase 4)
- [ ] Scope returns correct user filter (TODO: Phase 4)
- [ ] Null user returns `false` (TODO: Phase 4)

---

### Task 1.6: Update `auth.ts` Helper Functions ✅

**File:** `src/access/auth.ts`  
**Estimated Time:** 30 minutes  
**Status:** ✅ Complete

- [x] Review existing `getUserTenantIDs` function
- [x] Add helper to extract role from tenant (`hasRoleInAnyTenant`)
- [x] Add helper to check if user has specific role
- [x] Update TypeScript types
- [x] Add JSDoc comments
- [ ] Write unit tests (TODO: Phase 4)

---

## 🔐 Phase 2: Collection Access Control

### Task 2.1: Update Locations Collection

**File:** `src/collections/Locations.ts`  
**Estimated Time:** 2 hours

- [ ] Import access utilities
- [ ] Add `access.create` control
  - [ ] Super Admin: ✅
  - [ ] Org Admin: ✅
  - [ ] Others: ❌
- [ ] Add `access.read` control
  - [ ] Super Admin: All locations
  - [ ] Org Admin: Tenant locations
  - [ ] Others: ❌
- [ ] Add `access.update` control (same as read)
- [ ] Add `access.delete` control (same as create)
- [ ] Add field-level access for `radiusSecret`
  - [ ] Read: Super Admin only
  - [ ] Update: Super Admin only
- [ ] Test with different user roles
- [ ] Verify tenant scoping works

**Acceptance Criteria:**

- ✅ Super Admin sees all locations
- ✅ Org Admin sees only tenant locations
- ✅ Location Manager cannot create locations
- ✅ `radiusSecret` hidden from non-super-admins

---

### Task 2.2: Update Packages Collection

**File:** `src/collections/Packages.ts`  
**Estimated Time:** 2 hours

- [ ] Import access utilities
- [ ] Add `access.create` control
- [ ] Add `access.read` control
  - [ ] Unauthenticated: Public packages only
  - [ ] Super Admin: All packages
  - [ ] Org Admin: Tenant packages
  - [ ] Customers: Public packages
- [ ] Add `access.update` control
- [ ] Add `access.delete` control
- [ ] Test public package visibility
- [ ] Test tenant scoping

**Acceptance Criteria:**

- ✅ Unauthenticated users see public packages
- ✅ Org Admin can create/edit packages
- ✅ Customers cannot edit packages
- ✅ Tenant scoping prevents cross-tenant access

---

### Task 2.3: Update Sessions Collection

**File:** `src/collections/Sessions.ts`  
**Estimated Time:** 2.5 hours

- [ ] Import access utilities
- [ ] Add `access.create` control (system only)
- [ ] Add `access.read` control
  - [ ] Super Admin: All sessions
  - [ ] Org Admin: Tenant sessions
  - [ ] Location Manager: Location sessions
  - [ ] Customer: Own sessions only
- [ ] Add `access.update` control (system only)
- [ ] Add `access.delete` control (Super Admin only)
- [ ] Test hierarchical access
- [ ] Test location-based filtering

**Acceptance Criteria:**

- ✅ Direct creation blocked (must use hooks)
- ✅ Location Manager sees only assigned location sessions
- ✅ Customer sees only own sessions
- ✅ No cross-tenant session visibility

---

### Task 2.4: Update Tenants Collection

**File:** `src/collections/Tenants.ts`  
**Estimated Time:** 1 hour

- [ ] Add `access.create` control (Super Admin only)
- [ ] Add `access.read` control
  - [ ] Super Admin: All tenants
  - [ ] Org Admin: Own tenant
  - [ ] Others: ❌
- [ ] Add `access.update` control
  - [ ] Super Admin: All tenants
  - [ ] Org Admin: Own tenant (branding only)
- [ ] Add `access.delete` control (Super Admin only)
- [ ] Test tenant isolation

**Acceptance Criteria:**

- ✅ Only Super Admin can create tenants
- ✅ Org Admin can update own tenant branding
- ✅ Org Admin cannot see other tenants

---

## 🔒 Phase 3: Field-Level Permissions

### Task 3.1: Protect Sensitive Location Fields

**File:** `src/collections/Locations.ts`  
**Estimated Time:** 1 hour

- [ ] Add field-level access to `radiusSecret`
  - [ ] Read: Super Admin only
  - [ ] Update: Super Admin only
- [ ] Add field-level access to `wireguardIp` (if needed)
- [ ] Test field visibility in Admin UI
- [ ] Test API responses don't leak data
- [ ] Verify GraphQL queries respect field access

**Acceptance Criteria:**

- ✅ `radiusSecret` hidden from Org Admin in UI
- ✅ `radiusSecret` not returned in API for non-super-admins
- ✅ Update attempts blocked for non-super-admins

---

### Task 3.2: Protect User Permission Fields

**File:** `src/collections/Users.ts`  
**Estimated Time:** 1 hour

- [ ] Add field-level access to `canDownloadScripts`
  - [ ] Read: Super Admin, Org Admin
  - [ ] Update: Org Admin only
- [ ] Add field-level access to `assignedLocations`
  - [ ] Read: Super Admin, Org Admin
  - [ ] Update: Org Admin only
- [ ] Test field visibility
- [ ] Test update permissions

**Acceptance Criteria:**

- ✅ Only Org Admin can toggle `canDownloadScripts`
- ✅ Only Org Admin can assign locations
- ✅ Location Manager cannot modify own permissions

---

### Task 3.3: Protect Package Cost Fields (if applicable)

**File:** `src/collections/Packages.ts`  
**Estimated Time:** 30 minutes

- [ ] Identify if internal cost field exists
- [ ] Add field-level access if needed
- [ ] Test visibility

---

## 🧪 Phase 4: Testing & Validation

### Task 4.1: Write Unit Tests for Access Functions

**File:** `src/access/__tests__/rbac.test.ts`  
**Estimated Time:** 3 hours

- [ ] Test `isSuperAdmin`
  - [ ] Admin role returns true
  - [ ] User role returns false
  - [ ] Null user returns false
- [ ] Test `isOrgAdmin`
  - [ ] Super admin returns true
  - [ ] Org admin role returns true
  - [ ] Other roles return false
- [ ] Test `isLocationManager`
  - [ ] All admin types return true
  - [ ] Loc manager role returns true
  - [ ] Customer returns false
- [ ] Test `isCustomer`
  - [ ] Customer role returns true
  - [ ] Other roles return false
- [ ] Test scope functions
  - [ ] Super admin scope returns true
  - [ ] Org admin scope returns tenant filter
  - [ ] Location manager scope returns location filter
  - [ ] Customer scope returns user filter
- [ ] Run tests: `pnpm test`
- [ ] Achieve >80% coverage

**Acceptance Criteria:**

- ✅ All tests passing
- ✅ Coverage >80%
- ✅ Edge cases covered

---

### Task 4.2: Write Integration Tests

**File:** `tests/rbac/access-control.test.ts`  
**Estimated Time:** 4 hours

- [ ] Setup test database and payload instance
- [ ] Test Super Admin access
  - [ ] Can create tenants
  - [ ] Can access all tenant data
  - [ ] Can see sensitive fields
- [ ] Test Org Admin access
  - [ ] Can create locations (within quota)
  - [ ] Cannot access other tenants
  - [ ] Cannot see super admin fields
- [ ] Test Location Manager access
  - [ ] Can see assigned locations
  - [ ] Cannot see other locations
  - [ ] Can view location sessions
- [ ] Test Customer access
  - [ ] Can see own data only
  - [ ] Cannot access admin features
  - [ ] Can purchase packages
- [ ] Run tests: `pnpm test:integration`

**Acceptance Criteria:**

- ✅ All integration tests passing
- ✅ No data leakage between tenants
- ✅ Hierarchical permissions working

---

### Task 4.3: Manual Testing in Admin UI

**Estimated Time:** 2 hours

- [ ] Login as Super Admin
  - [ ] Verify can see all tenants
  - [ ] Verify can create new tenant
  - [ ] Verify can see all locations
  - [ ] Verify can see `radiusSecret` field
- [ ] Login as Org Admin
  - [ ] Verify can see only own tenant
  - [ ] Verify can create locations
  - [ ] Verify cannot see `radiusSecret`
  - [ ] Verify can manage packages
- [ ] Login as Location Manager
  - [ ] Verify can see assigned locations only
  - [ ] Verify can view sessions at locations
  - [ ] Verify cannot create locations
  - [ ] Verify `canDownloadScripts` toggle works
- [ ] Login as Customer
  - [ ] Verify can see public packages
  - [ ] Verify can see own sessions
  - [ ] Verify cannot access admin features

**Acceptance Criteria:**

- ✅ All role behaviors correct in UI
- ✅ No unexpected errors
- ✅ Field visibility correct

---

### Task 4.4: Security Audit

**Estimated Time:** 2 hours

- [ ] Test API endpoints directly (bypass UI)
  - [ ] Try to access other tenant data
  - [ ] Try to read protected fields
  - [ ] Try to update without permission
- [ ] Test GraphQL queries
  - [ ] Verify field-level access
  - [ ] Verify relationship filtering
- [ ] Test edge cases
  - [ ] User with no tenants
  - [ ] User with multiple tenants
  - [ ] Deleted tenant reference
- [ ] Document any security issues found
- [ ] Fix all critical issues

**Acceptance Criteria:**

- ✅ No data leakage found
- ✅ All protected fields secure
- ✅ No privilege escalation possible

---

## 📚 Phase 5: Documentation & Deployment

### Task 5.1: Update Seed Data

**File:** `src/seed/index.ts`  
**Estimated Time:** 2 hours

- [ ] Create Super Admin user
- [ ] Create default tenant
- [ ] Create Org Admin for default tenant
- [ ] Create sample location
- [ ] Create Location Manager with assigned location
- [ ] Create sample customer
- [ ] Create sample packages
- [ ] Add console output with credentials
- [ ] Test seed function
  ```bash
  pnpm payload seed
  ```
- [ ] Document default credentials in README

**Acceptance Criteria:**

- ✅ Seed creates all role types
- ✅ Relationships properly set up
- ✅ Can login with all test accounts
- ✅ Credentials documented

---

### Task 5.2: Write Migration Guide

**File:** `docs/migrations/001-rbac-implementation.md`  
**Estimated Time:** 1.5 hours

- [ ] Document schema changes
- [ ] List breaking changes (if any)
- [ ] Provide step-by-step migration steps
- [ ] Include rollback plan
- [ ] Add testing checklist
- [ ] Document environment variables (if new)
- [ ] Review with team

**Acceptance Criteria:**

- ✅ Clear migration steps
- ✅ Rollback plan included
- ✅ No ambiguity

---

### Task 5.3: Deploy to Staging

**Estimated Time:** 2 hours

- [ ] Create deployment branch
- [ ] Run all tests
  ```bash
  pnpm test
  pnpm test:integration
  ```
- [ ] Build production bundle
  ```bash
  pnpm build
  ```
- [ ] Deploy to staging environment
- [ ] Run smoke tests on staging
- [ ] Verify all roles work in staging
- [ ] Get stakeholder approval
- [ ] Merge to main branch

**Acceptance Criteria:**

- ✅ All tests passing
- ✅ Staging deployment successful
- ✅ Smoke tests pass
- ✅ Stakeholder approval received

---

## 📋 Final Checklist

### Code Quality

- [ ] All TypeScript errors resolved
- [ ] ESLint warnings addressed
- [ ] Code formatted with Prettier
- [ ] No console.log statements in production code
- [ ] All TODOs resolved or documented

### Testing

- [ ] Unit tests >80% coverage
- [ ] Integration tests passing
- [ ] Manual testing completed
- [ ] Security audit passed
- [ ] Performance benchmarks acceptable

### Documentation

- [ ] Code comments added
- [ ] JSDoc for all public functions
- [ ] README updated
- [ ] Migration guide complete
- [ ] API documentation updated (if applicable)

### Deployment

- [ ] Environment variables documented
- [ ] Seed data tested
- [ ] Staging deployment successful
- [ ] Production deployment plan ready
- [ ] Rollback plan documented

---

## 🎯 Success Metrics

### Functional Metrics

- ✅ All 4 roles implemented
- ✅ Zero data leakage between tenants
- ✅ Field-level permissions working
- ✅ Hierarchical access control working

### Performance Metrics

- ✅ Access control adds <10ms to queries
- ✅ No N+1 query issues
- ✅ Database properly indexed

### Quality Metrics

- ✅ Test coverage >80%
- ✅ Zero critical security issues
- ✅ Zero high-priority bugs

---

## 📞 Support & Resources

### Team Contacts

- **Tech Lead:** [Name]
- **Backend Developer:** [Name]
- **QA Engineer:** [Name]

### Documentation

- [RBAC Implementation Plan](./RBAC_IMPLEMENTATION_PLAN.md)
- [RBAC Feature Spec](./05-features/authentication/rbac.md)
- [Multi-Tenancy Architecture](./04-architecture/multi-tenancy.md)

### External Resources

- [Payload CMS Access Control](https://payloadcms.com/docs/access-control/overview)
- [Multi-Tenant Plugin](https://github.com/payloadcms/payload/tree/main/packages/plugin-multi-tenant)

---

**Last Updated:** 2026-02-17  
**Next Review:** End of Week 1

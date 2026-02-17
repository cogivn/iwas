# RBAC Implementation Plan - IWAS Platform

**Created:** 2026-02-17  
**Status:** 🚀 Ready for Implementation  
**Priority:** P0 (Critical - Phase 1)

---

## 📋 Executive Summary

Plan triển khai chi tiết hệ thống Role-Based Access Control (RBAC) cho IWAS platform, tích hợp với `@payloadcms/plugin-multi-tenant` và `payload-better-auth` để đảm bảo:

- **Multi-tenancy isolation**: Dữ liệu giữa các Enterprise hoàn toàn tách biệt
- **Hierarchical permissions**: 4 cấp độ quyền hạn rõ ràng
- **Scalable architecture**: Dễ dàng mở rộng thêm roles và permissions
- **Security-first**: Field-level và collection-level access control

---

## 🎯 Objectives

### Primary Goals

1. ✅ Implement 4 core roles: Super Admin, Org Admin, Location Manager, Customer
2. ✅ Enforce strict tenant isolation at database query level
3. ✅ Provide granular field-level permissions
4. ✅ Support flexible role assignment per tenant

### Success Criteria

- [ ] Super Admin có thể quản lý tất cả tenants
- [ ] Org Admin chỉ thấy data của organization mình
- [ ] Location Manager chỉ quản lý được branches được assign
- [ ] Customer chỉ truy cập được data của chính họ
- [ ] Không có data leakage giữa các tenants

---

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    Request Layer                             │
│  (Domain Detection → Tenant Context → User Authentication)  │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│              Multi-Tenant Plugin Middleware                  │
│  • Inject tenant filter to all queries                      │
│  • Validate user's tenant membership                         │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                 RBAC Access Control Layer                    │
│  • Check user's roles within tenant                          │
│  • Apply collection-level permissions                        │
│  • Apply field-level permissions                             │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                    Database Layer (SQLite)                   │
│  • Execute filtered queries                                  │
│  • Return scoped results                                     │
└─────────────────────────────────────────────────────────────┘
```

---

## 📊 Role Hierarchy & Permissions

### 1. Super Admin (Platform Owner)

**Scope:** Global - All Tenants  
**Use Case:** Platform infrastructure management

| Resource  | Create | Read | Update | Delete | Special                   |
| --------- | ------ | ---- | ------ | ------ | ------------------------- |
| Tenants   | ✅     | ✅   | ✅     | ✅     | Provision new enterprises |
| Users     | ✅     | ✅   | ✅     | ✅     | Assign any role           |
| Locations | ✅     | ✅   | ✅     | ✅     | Cross-tenant access       |
| Packages  | ✅     | ✅   | ✅     | ✅     | Global templates          |
| Sessions  | ✅     | ✅   | ✅     | ✅     | Monitor all sessions      |
| Payments  | ❌     | ✅   | ❌     | ❌     | View only (audit)         |

**Implementation:**

```typescript
// src/access/isSuperAdmin.ts
export const isSuperAdmin = ({ req: { user } }) => {
  return user?.role === 'admin'
}
```

---

### 2. Organization Admin (Tenant Owner)

**Scope:** Single Tenant  
**Use Case:** Enterprise/Chain management

| Resource  | Create | Read        | Update      | Delete      | Special              |
| --------- | ------ | ----------- | ----------- | ----------- | -------------------- |
| Tenants   | ❌     | ✅ (own)    | ✅ (own)    | ❌          | Branding config      |
| Users     | ✅     | ✅ (tenant) | ✅ (tenant) | ✅ (tenant) | Assign org/loc roles |
| Locations | ✅     | ✅ (tenant) | ✅ (tenant) | ✅ (tenant) | Within quota         |
| Packages  | ✅     | ✅ (tenant) | ✅ (tenant) | ✅ (tenant) | Set pricing          |
| Sessions  | ❌     | ✅ (tenant) | ❌          | ❌          | Monitor only         |
| Payments  | ❌     | ✅ (tenant) | ❌          | ❌          | Financial reports    |

**Implementation:**

```typescript
// src/access/isOrgAdmin.ts
export const isOrgAdmin = ({ req: { user } }) => {
  if (isSuperAdmin({ req: { user } })) return true

  return user?.tenants?.some((t) => t.roles?.includes('org-admin')) || false
}

export const orgAdminScope = ({ req: { user } }) => {
  if (isSuperAdmin({ req: { user } })) return true

  const tenantIDs = getUserTenantIDs(user)
  if (tenantIDs.length === 0) return false

  return {
    tenant: {
      in: tenantIDs,
    },
  }
}
```

---

### 3. Location Manager (Branch Manager)

**Scope:** Assigned Location(s)  
**Use Case:** Individual branch operations

| Resource  | Create | Read          | Update        | Delete | Special             |
| --------- | ------ | ------------- | ------------- | ------ | ------------------- |
| Tenants   | ❌     | ❌            | ❌            | ❌     | -                   |
| Users     | ❌     | ✅ (location) | ❌            | ❌     | View customers only |
| Locations | ❌     | ✅ (assigned) | ✅ (assigned) | ❌     | Own branches        |
| Packages  | ❌     | ✅ (location) | ❌            | ❌     | View only           |
| Sessions  | ❌     | ✅ (location) | ✅ (location) | ❌     | Force disconnect    |
| Payments  | ❌     | ✅ (location) | ❌            | ❌     | Location revenue    |

**Special Permissions:**

- `canDownloadScripts`: Toggle for router setup access (default: false)

**Implementation:**

```typescript
// src/access/isLocationManager.ts
export const isLocationManager = ({ req: { user } }) => {
  if (isSuperAdmin({ req: { user } })) return true
  if (isOrgAdmin({ req: { user } })) return true

  return user?.tenants?.some((t) => t.roles?.includes('loc-manager')) || false
}

export const locationManagerScope = ({ req: { user } }) => {
  if (isSuperAdmin({ req: { user } })) return true
  if (isOrgAdmin({ req: { user } })) return orgAdminScope({ req: { user } })

  // Get assigned locations
  const assignedLocationIDs =
    user?.assignedLocations?.map((loc) => (typeof loc === 'object' ? loc.id : loc)) || []

  if (assignedLocationIDs.length === 0) return false

  return {
    id: {
      in: assignedLocationIDs,
    },
  }
}
```

---

### 4. Customer (End User)

**Scope:** Self Only  
**Use Case:** WiFi service consumption

| Resource  | Create | Read        | Update    | Delete | Special             |
| --------- | ------ | ----------- | --------- | ------ | ------------------- |
| Tenants   | ❌     | ❌          | ❌        | ❌     | -                   |
| Users     | ❌     | ✅ (self)   | ✅ (self) | ❌     | Profile only        |
| Locations | ❌     | ✅ (public) | ❌        | ❌     | Browse locations    |
| Packages  | ❌     | ✅ (public) | ❌        | ❌     | Purchase packages   |
| Sessions  | ✅     | ✅ (own)    | ❌        | ❌     | Create via payment  |
| Payments  | ✅     | ✅ (own)    | ❌        | ❌     | Transaction history |

**Implementation:**

```typescript
// src/access/isCustomer.ts
export const isCustomer = ({ req: { user } }) => {
  return user?.tenants?.some((t) => t.roles?.includes('customer')) || false
}

export const customerScope = ({ req: { user } }) => {
  if (!user) return false

  return {
    user: {
      equals: user.id,
    },
  }
}
```

---

## 🔧 Implementation Steps

### Phase 1: Core Access Utilities (Week 1)

#### Task 1.1: Update User Collection Schema

**File:** `src/collections/Users.ts`

```typescript
import { tenantsArrayField } from '@payloadcms/plugin-multi-tenant/fields'
import type { CollectionConfig } from 'payload'

export const Users: CollectionConfig = {
  slug: 'users',
  admin: {
    useAsTitle: 'email',
  },
  auth: true,
  fields: [
    {
      name: 'role',
      type: 'select',
      required: true,
      defaultValue: 'admin',
      options: [
        { label: 'Super Admin', value: 'admin' },
        { label: 'User', value: 'user' },
      ],
    },
    tenantsArrayField({
      tenantsArrayFieldName: 'tenants',
      tenantsArrayTenantFieldName: 'tenant',
      tenantsCollectionSlug: 'tenants',
      // Add roles per tenant
      fields: [
        {
          name: 'roles',
          type: 'select',
          hasMany: true,
          required: true,
          options: [
            { label: 'Organization Admin', value: 'org-admin' },
            { label: 'Location Manager', value: 'loc-manager' },
            { label: 'Customer', value: 'customer' },
          ],
        },
      ],
    }),
    {
      name: 'assignedLocations',
      type: 'relationship',
      relationTo: 'locations',
      hasMany: true,
      admin: {
        description: 'Locations this user can manage (for Location Managers)',
        condition: (data) => {
          return data?.tenants?.some((t) => t.roles?.includes('loc-manager'))
        },
      },
    },
    {
      name: 'canDownloadScripts',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        description: 'Allow downloading router setup scripts',
        condition: (data) => {
          return data?.tenants?.some((t) => t.roles?.includes('loc-manager'))
        },
      },
    },
  ],
}
```

**Checklist:**

- [ ] Add `roles` field to tenants array
- [ ] Add `assignedLocations` relationship
- [ ] Add `canDownloadScripts` permission toggle
- [ ] Test field visibility conditions
- [ ] Generate TypeScript types: `pnpm payload generate:types`

---

#### Task 1.2: Create Access Control Utilities

**Files to create:**

1. **`src/access/isSuperAdmin.ts`**

```typescript
import type { User } from '../payload-types'

export const isSuperAdmin = (user: User | null): boolean => {
  return user?.role === 'admin'
}
```

2. **`src/access/isOrgAdmin.ts`**

```typescript
import type { User } from '../payload-types'
import { isSuperAdmin } from './isSuperAdmin'
import { getUserTenantIDs } from './auth'

export const isOrgAdmin = (user: User | null): boolean => {
  if (isSuperAdmin(user)) return true

  return user?.tenants?.some((t) => t.roles?.includes('org-admin')) || false
}

export const orgAdminScope = ({ req: { user } }) => {
  if (isSuperAdmin(user)) return true

  const tenantIDs = getUserTenantIDs(user)
  if (tenantIDs.length === 0) return false

  return {
    tenant: {
      in: tenantIDs,
    },
  }
}
```

3. **`src/access/isLocationManager.ts`**

```typescript
import type { User } from '../payload-types'
import { isSuperAdmin } from './isSuperAdmin'
import { isOrgAdmin, orgAdminScope } from './isOrgAdmin'
import { extractID } from './auth'

export const isLocationManager = (user: User | null): boolean => {
  if (isSuperAdmin(user)) return true
  if (isOrgAdmin(user)) return true

  return user?.tenants?.some((t) => t.roles?.includes('loc-manager')) || false
}

export const locationManagerScope = ({ req: { user } }) => {
  if (isSuperAdmin(user)) return true
  if (isOrgAdmin(user)) return orgAdminScope({ req: { user } })

  const assignedLocationIDs = user?.assignedLocations?.map((loc) => extractID(loc)) || []

  if (assignedLocationIDs.length === 0) return false

  return {
    id: {
      in: assignedLocationIDs,
    },
  }
}
```

4. **`src/access/isCustomer.ts`**

```typescript
import type { User } from '../payload-types'

export const isCustomer = (user: User | null): boolean => {
  return user?.tenants?.some((t) => t.roles?.includes('customer')) || false
}

export const customerScope = ({ req: { user } }) => {
  if (!user) return false

  return {
    user: {
      equals: user.id,
    },
  }
}
```

5. **`src/access/index.ts`** (Barrel export)

```typescript
export * from './auth'
export * from './isSuperAdmin'
export * from './isOrgAdmin'
export * from './isLocationManager'
export * from './isCustomer'
```

**Checklist:**

- [ ] Create all access utility files
- [ ] Test each function with mock user data
- [ ] Verify TypeScript types are correct
- [ ] Add JSDoc comments for documentation

---

### Phase 2: Apply Access Control to Collections (Week 1-2)

#### Task 2.1: Update Locations Collection

**File:** `src/collections/Locations.ts`

```typescript
import type { CollectionConfig } from 'payload'
import { isSuperAdmin, isOrgAdmin, orgAdminScope } from '../access'

export const Locations: CollectionConfig = {
  slug: 'locations',
  admin: {
    useAsTitle: 'name',
  },
  access: {
    // Only Super Admin and Org Admin can create locations
    create: ({ req: { user } }) => isSuperAdmin(user) || isOrgAdmin(user),

    // Read: Super Admin sees all, Org Admin sees tenant locations
    read: ({ req: { user } }) => {
      if (isSuperAdmin(user)) return true
      return orgAdminScope({ req: { user } })
    },

    // Update: Same as read
    update: ({ req: { user } }) => {
      if (isSuperAdmin(user)) return true
      return orgAdminScope({ req: { user } })
    },

    // Delete: Only Super Admin and Org Admin
    delete: ({ req: { user } }) => isSuperAdmin(user) || isOrgAdmin(user),
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
    },
    // Network Configuration Group
    {
      name: 'networkConfig',
      type: 'group',
      fields: [
        {
          name: 'wireguardIp',
          type: 'text',
          required: true,
        },
        {
          name: 'radiusSecret',
          type: 'text',
          required: true,
          // Field-level access: Only Super Admin can see/edit
          access: {
            read: ({ req: { user } }) => isSuperAdmin(user),
            update: ({ req: { user } }) => isSuperAdmin(user),
          },
        },
        {
          name: 'nasId',
          type: 'text',
          required: true,
        },
      ],
    },
    // ... other fields
  ],
}
```

**Checklist:**

- [ ] Apply collection-level access control
- [ ] Add field-level access for sensitive data (radiusSecret)
- [ ] Test with different user roles
- [ ] Verify tenant scoping works correctly

---

#### Task 2.2: Update Packages Collection

**File:** `src/collections/Packages.ts`

```typescript
import type { CollectionConfig } from 'payload'
import { isSuperAdmin, isOrgAdmin, orgAdminScope } from '../access'

export const Packages: CollectionConfig = {
  slug: 'packages',
  admin: {
    useAsTitle: 'name',
  },
  access: {
    // Create: Super Admin and Org Admin
    create: ({ req: { user } }) => isSuperAdmin(user) || isOrgAdmin(user),

    // Read: Public for customers, scoped for admins
    read: ({ req: { user } }) => {
      if (!user) return { isPublic: { equals: true } } // Public packages
      if (isSuperAdmin(user)) return true
      return orgAdminScope({ req: { user } })
    },

    // Update: Super Admin and Org Admin only
    update: ({ req: { user } }) => {
      if (isSuperAdmin(user)) return true
      return orgAdminScope({ req: { user } })
    },

    // Delete: Super Admin and Org Admin only
    delete: ({ req: { user } }) => isSuperAdmin(user) || isOrgAdmin(user),
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
    },
    {
      name: 'price',
      type: 'number',
      required: true,
      min: 0,
    },
    {
      name: 'duration',
      type: 'number',
      required: true,
      min: 1,
      admin: {
        description: 'Duration in minutes',
      },
    },
    {
      name: 'isPublic',
      type: 'checkbox',
      defaultValue: true,
      admin: {
        description: 'Show this package to customers',
      },
    },
    // Bandwidth Group
    {
      name: 'bandwidth',
      type: 'group',
      fields: [
        {
          name: 'downloadLimit',
          type: 'number',
          admin: {
            description: 'Mbps',
          },
        },
        {
          name: 'uploadLimit',
          type: 'number',
          admin: {
            description: 'Mbps',
          },
        },
      ],
    },
    // ... other fields
  ],
}
```

**Checklist:**

- [ ] Apply access control
- [ ] Allow public read for unauthenticated users
- [ ] Test package visibility for customers
- [ ] Verify pricing can only be changed by admins

---

#### Task 2.3: Update Sessions Collection

**File:** `src/collections/Sessions.ts`

```typescript
import type { CollectionConfig } from 'payload'
import {
  isSuperAdmin,
  isOrgAdmin,
  orgAdminScope,
  isLocationManager,
  locationManagerScope,
  customerScope,
} from '../access'

export const Sessions: CollectionConfig = {
  slug: 'sessions',
  admin: {
    useAsTitle: 'macAddress',
  },
  access: {
    // Create: System only (via hooks/API)
    create: () => false, // Will be created via payment hooks

    // Read: Hierarchical scoping
    read: ({ req: { user } }) => {
      if (!user) return false
      if (isSuperAdmin(user)) return true
      if (isOrgAdmin(user)) return orgAdminScope({ req: { user } })
      if (isLocationManager(user)) {
        // Location managers see sessions at their locations
        return {
          location: locationManagerScope({ req: { user } }),
        }
      }
      // Customers see only their own sessions
      return customerScope({ req: { user } })
    },

    // Update: System only (for status changes)
    update: () => false,

    // Delete: Super Admin only (for cleanup)
    delete: ({ req: { user } }) => isSuperAdmin(user),
  },
  fields: [
    {
      name: 'macAddress',
      type: 'text',
      required: true,
      unique: true,
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'active',
      options: [
        { label: 'Active', value: 'active' },
        { label: 'Expired', value: 'expired' },
        { label: 'Disconnected', value: 'disconnected' },
      ],
    },
    {
      name: 'user',
      type: 'relationship',
      relationTo: 'users',
      required: true,
    },
    {
      name: 'package',
      type: 'relationship',
      relationTo: 'packages',
      required: true,
    },
    {
      name: 'location',
      type: 'relationship',
      relationTo: 'locations',
      required: true,
    },
    {
      name: 'startTime',
      type: 'date',
      required: true,
      defaultValue: () => new Date().toISOString(),
    },
    {
      name: 'endTime',
      type: 'date',
      required: true,
    },
    {
      name: 'dataUsed',
      type: 'number',
      defaultValue: 0,
      admin: {
        description: 'Bytes',
      },
    },
  ],
}
```

**Checklist:**

- [ ] Apply hierarchical access control
- [ ] Prevent direct creation/update (system-only)
- [ ] Test session visibility for each role
- [ ] Verify location managers can see their branch sessions

---

### Phase 3: Field-Level Permissions (Week 2)

#### Task 3.1: Sensitive Field Protection

**Fields to protect:**

1. **Locations.networkConfig.radiusSecret**
   - Read: Super Admin only
   - Update: Super Admin only

2. **Users.canDownloadScripts**
   - Read: Super Admin, Org Admin
   - Update: Org Admin only

3. **Packages.cost** (internal cost, if different from price)
   - Read: Super Admin, Org Admin
   - Update: Super Admin, Org Admin

**Implementation Example:**

```typescript
{
  name: 'radiusSecret',
  type: 'text',
  required: true,
  access: {
    read: ({ req: { user } }) => isSuperAdmin(user),
    update: ({ req: { user } }) => isSuperAdmin(user),
  },
  admin: {
    description: 'RADIUS shared secret (Super Admin only)',
  },
}
```

**Checklist:**

- [ ] Identify all sensitive fields
- [ ] Apply field-level access control
- [ ] Test field visibility in Admin UI
- [ ] Verify API responses don't leak sensitive data

---

### Phase 4: Testing & Validation (Week 2-3)

#### Task 4.1: Unit Tests for Access Functions

**File:** `src/access/__tests__/rbac.test.ts`

```typescript
import { describe, it, expect } from 'vitest'
import { isSuperAdmin, isOrgAdmin, isLocationManager, isCustomer } from '../index'
import type { User } from '../../payload-types'

describe('RBAC Access Functions', () => {
  describe('isSuperAdmin', () => {
    it('should return true for admin role', () => {
      const user: Partial<User> = { role: 'admin' }
      expect(isSuperAdmin(user as User)).toBe(true)
    })

    it('should return false for non-admin role', () => {
      const user: Partial<User> = { role: 'user' }
      expect(isSuperAdmin(user as User)).toBe(false)
    })

    it('should return false for null user', () => {
      expect(isSuperAdmin(null)).toBe(false)
    })
  })

  describe('isOrgAdmin', () => {
    it('should return true for user with org-admin role in tenant', () => {
      const user: Partial<User> = {
        role: 'user',
        tenants: [
          {
            tenant: 'tenant-1',
            roles: ['org-admin'],
          },
        ],
      }
      expect(isOrgAdmin(user as User)).toBe(true)
    })

    it('should return true for super admin', () => {
      const user: Partial<User> = { role: 'admin' }
      expect(isOrgAdmin(user as User)).toBe(true)
    })

    it('should return false for user without org-admin role', () => {
      const user: Partial<User> = {
        role: 'user',
        tenants: [
          {
            tenant: 'tenant-1',
            roles: ['customer'],
          },
        ],
      }
      expect(isOrgAdmin(user as User)).toBe(false)
    })
  })

  // Add more tests for isLocationManager, isCustomer, etc.
})
```

**Checklist:**

- [ ] Write unit tests for all access functions
- [ ] Test with various user role combinations
- [ ] Test edge cases (null user, empty tenants, etc.)
- [ ] Achieve >80% code coverage

---

#### Task 4.2: Integration Tests

**File:** `tests/rbac/access-control.test.ts`

```typescript
import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { getPayload } from 'payload'
import config from '../../src/payload.config'

describe('RBAC Integration Tests', () => {
  let payload

  beforeAll(async () => {
    payload = await getPayload({ config })
  })

  afterAll(async () => {
    // Cleanup
  })

  describe('Super Admin Access', () => {
    it('should access all tenants', async () => {
      // Create super admin user
      // Create multiple tenants
      // Verify super admin can read all tenants
    })

    it('should create new tenants', async () => {
      // Test tenant creation
    })
  })

  describe('Org Admin Access', () => {
    it('should only access own tenant', async () => {
      // Create org admin for tenant A
      // Create tenant B
      // Verify org admin cannot access tenant B
    })

    it('should create locations within quota', async () => {
      // Test location creation
    })
  })

  describe('Location Manager Access', () => {
    it('should only access assigned locations', async () => {
      // Create location manager
      // Assign specific locations
      // Verify access is limited
    })

    it('should not access other locations', async () => {
      // Test access denial
    })
  })

  describe('Customer Access', () => {
    it('should only access own data', async () => {
      // Create customer
      // Verify self-only access
    })

    it('should not access admin features', async () => {
      // Test access denial to admin collections
    })
  })
})
```

**Checklist:**

- [ ] Write integration tests for each role
- [ ] Test cross-tenant access prevention
- [ ] Test hierarchical permissions
- [ ] Test field-level access control

---

### Phase 5: Documentation & Migration (Week 3)

#### Task 5.1: Update Seed Data

**File:** `src/seed/index.ts`

```typescript
import type { Payload } from 'payload'

export const seed = async (payload: Payload): Promise<void> => {
  // Check if already seeded
  const existingUsers = await payload.find({
    collection: 'users',
    limit: 1,
  })

  if (existingUsers.docs.length > 0) {
    payload.logger.info('Database already seeded')
    return
  }

  payload.logger.info('Seeding database...')

  // 1. Create Super Admin
  const superAdmin = await payload.create({
    collection: 'users',
    data: {
      email: 'admin@iwas.vn',
      password: 'admin123',
      role: 'admin',
    },
  })

  // 2. Create Default Tenant
  const defaultTenant = await payload.create({
    collection: 'tenants',
    data: {
      name: 'IWAS Demo',
      slug: 'iwas-demo',
      domains: ['localhost:3000', 'demo.iwas.vn'],
    },
  })

  // 3. Create Org Admin for Default Tenant
  const orgAdmin = await payload.create({
    collection: 'users',
    data: {
      email: 'org@demo.iwas.vn',
      password: 'org123',
      role: 'user',
      tenants: [
        {
          tenant: defaultTenant.id,
          roles: ['org-admin'],
        },
      ],
    },
  })

  // 4. Create Sample Location
  const location = await payload.create({
    collection: 'locations',
    data: {
      name: 'Demo Branch 1',
      slug: 'demo-branch-1',
      tenant: defaultTenant.id,
      networkConfig: {
        wireguardIp: '10.8.0.1',
        radiusSecret: 'demo-secret-123',
        nasId: 'demo-nas-1',
      },
    },
  })

  // 5. Create Location Manager
  const locationManager = await payload.create({
    collection: 'users',
    data: {
      email: 'manager@demo.iwas.vn',
      password: 'manager123',
      role: 'user',
      tenants: [
        {
          tenant: defaultTenant.id,
          roles: ['loc-manager'],
        },
      ],
      assignedLocations: [location.id],
      canDownloadScripts: false, // Disabled by default
    },
  })

  // 6. Create Sample Customer
  const customer = await payload.create({
    collection: 'users',
    data: {
      email: 'customer@demo.iwas.vn',
      password: 'customer123',
      role: 'user',
      tenants: [
        {
          tenant: defaultTenant.id,
          roles: ['customer'],
        },
      ],
    },
  })

  payload.logger.info('✅ Database seeded successfully')
  payload.logger.info('Super Admin: admin@iwas.vn / admin123')
  payload.logger.info('Org Admin: org@demo.iwas.vn / org123')
  payload.logger.info('Location Manager: manager@demo.iwas.vn / manager123')
  payload.logger.info('Customer: customer@demo.iwas.vn / customer123')
}
```

**Checklist:**

- [ ] Create seed data for all roles
- [ ] Test seed function
- [ ] Document default credentials
- [ ] Add seed reset script for development

---

#### Task 5.2: Create Migration Guide

**File:** `docs/migrations/001-rbac-implementation.md`

````markdown
# Migration: RBAC Implementation

**Date:** 2026-02-17  
**Version:** 1.0.0

## Overview

This migration adds comprehensive RBAC support to the IWAS platform.

## Changes

### Schema Changes

1. **Users Collection**
   - Added `tenants.roles` field (multi-select)
   - Added `assignedLocations` relationship
   - Added `canDownloadScripts` permission toggle

2. **All Tenant-Scoped Collections**
   - Applied access control functions
   - Added field-level permissions for sensitive data

### Breaking Changes

- None (additive changes only)

## Migration Steps

### 1. Backup Database

```bash
cp iwas.db iwas.db.backup
```
````

### 2. Update Dependencies

```bash
pnpm install
```

### 3. Generate Types

```bash
pnpm payload generate:types
```

### 4. Run Seed (Development Only)

```bash
# This will create default users with all roles
pnpm payload seed
```

### 5. Verify Access Control

- [ ] Login as Super Admin → Should see all data
- [ ] Login as Org Admin → Should see only tenant data
- [ ] Login as Location Manager → Should see only assigned locations
- [ ] Login as Customer → Should see only own data

## Rollback Plan

If issues occur:

```bash
# Restore backup
cp iwas.db.backup iwas.db

# Restart application
pnpm dev
```

## Testing Checklist

- [ ] All unit tests pass
- [ ] All integration tests pass
- [ ] Manual testing completed for each role
- [ ] No data leakage between tenants
- [ ] Field-level permissions working correctly

```

**Checklist:**
- [ ] Document all schema changes
- [ ] Provide step-by-step migration guide
- [ ] Include rollback plan
- [ ] Add testing checklist

---

## 📈 Success Metrics

### Performance Metrics
- [ ] Access control checks add <10ms to query time
- [ ] No N+1 query issues with tenant filtering
- [ ] Database indexes optimized for tenant queries

### Security Metrics
- [ ] Zero data leakage in security audit
- [ ] All sensitive fields properly protected
- [ ] Audit logs capture all permission changes

### User Experience Metrics
- [ ] Admin UI shows only relevant data per role
- [ ] Clear error messages for permission denials
- [ ] Role assignment workflow is intuitive

---

## 🚀 Future Enhancements (Phase 2)

### Custom Role Builder
- [ ] Permission atoms system
- [ ] Custom role creation UI
- [ ] Role templates
- [ ] Permission inheritance

### Advanced Features
- [ ] Time-based permissions (temporary access)
- [ ] IP-based access restrictions
- [ ] Multi-factor authentication for admin roles
- [ ] Audit log viewer in Admin UI

---

## 📚 References

### Documentation
- [RBAC Feature Definition](./05-features/authentication/rbac.md)
- [RBAC Implementation Pattern](./04-architecture/rbac-implementation.md)
- [Multi-Tenancy Architecture](./04-architecture/multi-tenancy.md)
- [User Data Model](./06-data-model/users.md)

### External Resources
- [Payload CMS Access Control](https://payloadcms.com/docs/access-control/overview)
- [Multi-Tenant Plugin Docs](https://github.com/payloadcms/payload/tree/main/packages/plugin-multi-tenant)
- [Better Auth Integration](https://www.better-auth.com/)

---

## 🎯 Implementation Timeline

| Week | Tasks | Deliverables |
|------|-------|--------------|
| **Week 1** | Phase 1-2 | Access utilities + Collection access control |
| **Week 2** | Phase 3-4 | Field-level permissions + Testing |
| **Week 3** | Phase 5 | Documentation + Migration + Deployment |

**Total Estimated Time:** 3 weeks (1 developer)

---

## ✅ Definition of Done

- [ ] All 4 roles implemented and tested
- [ ] Access control applied to all collections
- [ ] Field-level permissions for sensitive data
- [ ] Unit tests >80% coverage
- [ ] Integration tests passing
- [ ] Documentation complete
- [ ] Seed data created
- [ ] Migration guide written
- [ ] Code review completed
- [ ] Security audit passed
- [ ] Deployed to staging environment
- [ ] User acceptance testing completed

---

**Last Updated:** 2026-02-17
**Next Review:** After Phase 1 completion
```

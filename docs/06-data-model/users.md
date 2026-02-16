# Users Collection

**Collection ID:** `users`  
**Description:** Centralized user management for admins, managers, and customers.

---

## 📄 Schema Definition

| Field                | Type            | Required | Description                                      |
| -------------------- | --------------- | -------- | ------------------------------------------------ |
| `email`              | `email`         | ✅       | Primary login identifier.                        |
| `name`               | `string`        | ✅       | Full display name.                               |
| `roles`              | `select (mult)` | ✅       | Global roles (`super-admin`).                    |
| `tenants`            | `array`         | ❌       | Managed by Multi-Tenant plugin.                  |
| `tenants.tenant`     | `relationship`  | ✅       | Link to `organizations`.                         |
| `tenants.roles`      | `select (mult)` | ✅       | `org-admin`, `loc-manager`, `customer`.          |
| `assignedLocations`  | `relationship`  | ❌       | List of 0-N branches (for Managers).             |
| **PC Identity**      | **group**       | ❌       | For iCafe integration.                           |
| `pc.userId`          | `string`        | ❌       | UUID from the local PC Management system.        |
| `pc.balance`         | `number`        | ❌       | Cached or real-time balance indicator.           |
| **Permissions**      | **group**       | ✅       | Access overrides.                                |
| `canDownloadScripts` | `boolean`       | ✅       | Toggle for Location Managers (Default: `false`). |

---

## 💻 TypeScript Type (POJO)

```typescript
export type User = {
  id: string
  email: string
  name: string
  roles: 'super-admin'[] // Global roles
  tenants?: {
    tenant: string | Organization
    roles: ('org-admin' | 'loc-manager' | 'customer')[]
  }[]
  assignedLocations?: (string | Location)[]
  pc?: {
    userId?: string
    balance?: number
  }
  canDownloadScripts: boolean
  createdAt: string
  updatedAt: string
}
```

---

## 🔐 Access Control

- **Read:**
  - `super-admin`: Everything.
  - `org-admin`: Users assigned to the same tenant.
  - `loc-manager`: Themselves & Customers at their branches.
  - `customer`: Themselves ONLY.
- **Auto-Filtering:** The Multi-Tenant plugin automatically applies `tenant` filters based on the user's `tenants` array.
- **Update:** Hierarchical (Admin can edit Manager, Manager cannot edit Admin).

---

[← Back to Data Model](./README.md)

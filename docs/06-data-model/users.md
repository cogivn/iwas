# Users Collection

**Collection ID:** `users`  
**Description:** Centralized user management for admins, managers, and customers.

---

## 📄 Schema Definition

| Field                | Type            | Required | Description                                            |
| -------------------- | --------------- | -------- | ------------------------------------------------------ |
| `email`              | `email`         | ✅       | Primary login identifier.                              |
| `name`               | `string`        | ✅       | Full display name.                                     |
| `roles`              | `select (mult)` | ✅       | `super-admin`, `org-admin`, `loc-manager`, `customer`. |
| `organization`       | `relationship`  | ❌       | Link to `organizations` (Null for Super Admin).        |
| `assignedLocations`  | `relationship`  | ❌       | List of 0-N branches (for Managers).                   |
| **PC Identity**      | **group**       | ❌       | For iCafe integration.                                 |
| `pc.userId`          | `string`        | ❌       | UUID from the local PC Management system.              |
| `pc.balance`         | `number`        | ❌       | Cached or real-time balance indicator.                 |
| **Permissions**      | **group**       | ✅       | Access overrides.                                      |
| `canDownloadScripts` | `boolean`       | ✅       | Toggle for Location Managers (Default: `false`).       |

---

## 💻 TypeScript Type (POJO)

```typescript
export type User = {
  id: string;
  email: string;
  name: string;
  roles: ("super-admin" | "org-admin" | "loc-manager" | "customer")[];
  organization?: string | Organization;
  assignedLocations?: (string | Location)[];
  pc?: {
    userId?: string;
    balance?: number;
  };
  canDownloadScripts: boolean;
  createdAt: string;
  updatedAt: string;
};
```

---

## 🔐 Access Control

- **Read:**
  - `super-admin`: Everything.
  - `org-admin`: Users in their Org.
  - `loc-manager`: Themselves & Customers at their branches.
  - `customer`: Themselves ONLY.
- **Update:** Hierarchical (Admin can edit Manager, Manager cannot edit Admin).

---

[← Back to Data Model](./README.md)

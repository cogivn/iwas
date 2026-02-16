# RBAC Implementation Pattern (Payload CMS)

**Section ID:** 04-06  
**Status:** ✅ Technical Blueprint  
**Last Updated:** February 16, 2026

---

## 🏛️ Implementation Strategy

We implement RBAC using a combination of **User Roles** (stored in SQLite), the **`@payloadcms/plugin-multi-tenant`** access control logic, and **`payload-auth` (Better Auth)** for identity management. This ensures that multi-tenancy is enforced natively and automatically at the database query level, while identity is abstracted into a secure, unified library.

---

## 🔧 Core Access Utilities

We define reusable access functions in `src/access/`.

### 1. The `superAdmin` Check

```typescript
export const isSuperAdmin = ({ req: { user } }) => {
  return Boolean(user?.roles?.includes('super-admin'))
}
```

### 2. Tenant Scoping (Built-in)

The Multi-Tenant plugin automatically generates access control logic based on the `tenants` array in the `users` collection.

Manual scoping overrides are still used for complex cross-tenant queries:

```typescript
export const manualTenantScope = ({ req: { user } }) => {
  // Super Admin sees everything
  if (user?.roles?.includes('super-admin')) return true

  // Filter by user's active tenant(s)
  if (user?.tenants?.length > 0) {
    return {
      tenant: {
        in: user.tenants.map((t) => (typeof t.tenant === 'object' ? t.tenant.id : t.tenant)),
      },
    }
  }

  return false // No access if no tenant assigned
}
```

---

## 📑 Application to Collections

### User Collection

- **Read:** `tenantScope` (Managers see branch users, Org Admins see all org users).
- **Create:** `isSuperAdmin` OR `isOrgAdmin`.

### Locations & Packages

- **Read:** `true` (Publicly visible for portal).
- **Update:** `isAdminOrOrgOwner`.

### Transactions & Sessions

- **Read:** `tenantScope` (Strict isolation).
- **Update:** `false` (System-only via server-side hooks).

---

## 🔒 Field-Level Permissions

We use field-level access to hide sensitive infrastructure data even from lower-level admins.

```typescript
// Example: RADIUS Secret in Locations Collection
{
  name: 'radiusSecret',
  type: 'text',
  access: {
    read: isSuperAdmin, // Only Super Admin can see the secret
    update: isSuperAdmin,
  },
}
```

---

## 📁 Related Documents

- [RBAC Feature Definition](../../05-features/authentication/rbac.md)
- [System Architecture](../system-architecture.md)
- [Multi-Tenancy Strategy](../multi-tenancy.md)

---

[← Back to Architecture](./README.md)

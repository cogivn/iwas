# RBAC Implementation Pattern (Payload CMS)

**Section ID:** 04-06  
**Status:** ✅ Technical Blueprint  
**Last Updated:** February 16, 2026

---

## 🏛️ Implementation Strategy

We implement RBAC using a combination of **User Roles** (stored in MongoDB) and **Access Control Functions** (executed in Node.js). This ensures that multi-tenancy is enforced at the database query level.

---

## 🔧 Core Access Utilities

We define reusable access functions in `src/access/`.

### 1. The `superAdmin` Check

```typescript
export const isSuperAdmin = ({ req: { user } }) => {
  return Boolean(user?.roles?.includes("super-admin"));
};
```

### 2. The `tenantScope` Filter (Multi-tenancy)

This is the most critical function for IWAS. It ensures users only see data belonging to their Organization.

```typescript
export const tenantScope = ({ req: { user } }) => {
  // Super Admin sees everything
  if (user?.roles?.includes("super-admin")) return true;

  // Org Admin / Manager / Customer see only their Org data
  if (user?.organization) {
    const orgId =
      typeof user.organization === "object"
        ? user.organization.id
        : user.organization;
    return {
      organization: {
        equals: orgId,
      },
    };
  }

  return false; // No access if no org assigned
};
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

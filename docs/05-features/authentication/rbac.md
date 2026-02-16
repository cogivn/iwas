# Role-Based Access Control (RBAC)

**Feature ID:** FR-04  
**Priority:** P0 (Critical)  
**Status:** ✅ Detailed  
**Last Updated:** February 16, 2026

---

## 🏛️ Multi-Tier Hierarchy

To support the Enterprise model, IWAS implements a strictly scoped permission system using **Payload CMS Access Control**.

| Role                     | Scope                | Key Permissions                                                                  |
| ------------------------ | -------------------- | -------------------------------------------------------------------------------- |
| **Platform Super Admin** | Global (All Tenants) | **Provision Tenants**, Set Branch Quotas, Scale Infrastructure.                  |
| **Organization Admin**   | Tenant-wide          | **Add Locations**, Manage Branding/Packages, Monitor All Branches.               |
| **Location Manager**     | Branch-scoped        | **Manage Branch Settings**, Download Router Scripts, Monitor/Force-logout users. |
| **Customer**             | Self-only            | Manage personal devices, purchase/renew packages.                                |

---

## 🔐 Implementation (Payload CMS)

We use custom access control functions to ensure data isolation between Enterprises.

```typescript
// src/access/isTenantAdmin.ts
export const isTenantAdmin = ({ req: { user } }) => {
  // 1. Super Admin sees everything
  if (user.roles.includes("super-admin")) return true;

  // 2. Tenant Admin only sees their own organization's data
  if (user.roles.includes("tenant-admin") && user.organization) {
    return {
      organization: {
        equals: user.organization.id,
      },
    };
  }

  return false;
};
```

---

## 🔐 Strict Data Isolation (The "Tenant Wall")

In a Multi-tenant environment, the RBAC system must ensure that data from **Enterprise A** is never visible to **Enterprise B**. We implement this at the core database query level.

### 1. The Scoping Mechanism

Every request to the API/CMS is intercepted by an Access Control layer that injects an `organization` filter:

```typescript
// Example: Package access control
export const canAccessPackage = ({ req: { user } }) => {
  // 1. Super Admin is the only one who can bypass the wall
  if (user.roles.includes("super-admin")) return true;

  // 2. Organization users can only see their own brand's packages
  return {
    organization: {
      equals: user.organization.id,
    },
  };
};
```

### 2. Organization-Scoped Roles

Roles are not just global strings; they are bound to an `OrganizationID`.

- **Platform Admin (Global):** Organization field is `NULL`. They govern the infrastructure.
- **Org Admin (Scoped):** Bound to `Org_123`. They manage everything where `org_id == Org_123`.
- **Location Admin (Scoped):** Bound to `Org_123` AND `Location_ABC`. They can only manage sessions/settings for `Location_ABC`.

---

## 📋 Permission Matrix

| Action                | Platform Admin |     Org Admin     |   Loc Manager   |
| --------------------- | :------------: | :---------------: | :-------------: |
| **Tenant Management** |                |                   |                 |
| Create New Tenant     |       ✅       |        ❌         |       ❌        |
| Set Branch Quota      |       ✅       |        ❌         |       ❌        |
| **Infrastructure**    |                |                   |                 |
| Add New Location      |       ✅       | ✅ (Within Quota) |       ❌        |
| Edit Branch Config    |       ✅       |        ✅         | ✅ (Own Branch) |
| Get Router Script     |       ✅       |        ✅         | ✅ (Own Branch) |
| **Business Logic**    |                |                   |                 |
| Create Package        |       ✅       |        ✅         |       ❌        |
| Set Prices            |       ✅       |        ✅         |       ❌        |
| **Operations**        |                |                   |                 |
| Monitor Online Users  |       ✅       |        ✅         |       ✅        |
| Force Disconnect      |       ✅       |        ✅         |       ✅        |
| View Financials       |    ✅ (All)    |   ✅ (Own Org)    |       ❌        |

---

---

## 🏛️ Strategic Design Choice: Decentralized Setup

We have specifically empowered the **Location Manager** role with router setup capabilities to maximize **System Scalability**.

### Why "Location-Led" Setup?

- **Zero-Touch for Super Admins:** The platform owner doesn't need to be involved in physical deployments.
- **Speed to Market:** Branches can go live as soon as hardware arrives, even at midnight.
- **Client Empowerment:** Enterprise tenants can manage their own deployments without waiting for support tickets.

---

---

## ⚙️ Optional Delegation (Permission Toggles)

To provide maximum flexibility, the setup capabilities for **Location Managers** are **Optional** and **Disabled by Default**. Each Enterprise (Tenant) can decide their own management style.

### 1. The "Setup Script" Toggle

Within the User Management screen, an **Organization Admin** can see a toggle for each Location Manager:

- `Allow Branch Setup (Download Scripts)`: [ OFF ] (Default)

### 2. Management Styles

- **Closed Model (Strict):** Org Admin handles all setups. Managers only see live users.
- **Open Model (Scalable):** Org Admin enables the toggle for trusted managers/technicians at specific branches.

### 3. Verification Logic

The Backend checks two conditions before allowing a Script Download:

1. Does the user have the `Location Manager` role?
2. Is the `allow_setup_script` flag set to `true` on their specific user profile?

---

## 📋 Permission Matrix (Revised)

| Action                | Platform Admin | Org Admin |   Loc Manager   |
| --------------------- | :------------: | :-------: | :-------------: |
| **Tenant Management** |                |           |                 |
| Create New Tenant     |       ✅       |    ❌     |       ❌        |
| Set Branch Quota      |       ✅       |    ❌     |       ❌        |
| **Infrastructure**    |                |           |                 |
| Add New Location      |       ✅       |    ✅     |       ❌        |
| Edit Branch Config    |       ✅       |    ✅     | ✅ (Own Branch) |
| Get Router Script     |       ✅       |    ✅     | **⚠️ Optional** |

> **Note on ⚠️ Optional:** This action is hidden for Location Managers unless explicitly enabled by their Organization Admin.

---

---

## 🚀 Phase 2 Roadmap: Custom Role Builder (Granular Permissions)

**Status:** Planned for Future Release  
**Note:** This feature is NOT part of the MVP. The initial launch will focus on the 4 pre-defined roles listed above.

To provide ultimate flexibility for Enterprise clients in later stages, IWAS will support a **Permission-based** model rather than just a fixed Role-based model. This allows Org Admins to define their own roles based on their internal business structure.

### 1. Permission Atoms (The Building Blocks)

The platform defines "Atoms" across different domains. These are immutable and defined by the Platform Super Admin.

| Domain      | Permission Atom     | Description                                 |
| ----------- | ------------------- | ------------------------------------------- |
| **WiFi**    | `wifi:session:read` | View active sessions.                       |
|             | `wifi:session:kill` | Force disconnect a user.                    |
| **Network** | `net:router:script` | Access and download setup scripts.          |
|             | `net:router:config` | Modify local network settings (IPs, VLANs). |
| **Finance** | `fin:revenue:read`  | View sales reports and analytics.           |
| **Admin**   | `iam:user:manage`   | Create and gán permissions to other staff.  |

### 2. Creating Custom Roles

An **Organization Admin** can bundle these atoms into a unique "Role Object" within their tenant:

- **Example Role: "Junior Field Tech"**
  - Includes: `wifi:session:read`, `net:router:script`.
  - Excludes: `fin:revenue:read`, `iam:user:manage`.

### 3. Data Model for Custom Roles

```typescript
interface CustomRole {
  id: string; // UUID
  organization: string; // Relationship to Tenant
  name: string; // "Shift Supervisor"
  permissions: string[]; // List of atoms: ["wifi:session:kill", "fin:revenue:read"]
  created_at: Date;
}
```

---

## 🛡️ Risk Mitigation Safeguards

To counter the risks of granting infrastructure access to lower-level managers, we implement the following "Safety Valves":

### 1. Platform-Level Enforcement

Even if an Org Admin creates a custom role with `net:router:script`, the backend still enforces **Tenant Isolation**. A user can NEVER download a script for a location they are not assigned to, regardless of their permissions.

### 2. Immutable Permissions

Org Admins cannot create NEW permission atoms (e.g., they can't invent a `db:delete` permission). They can only aggregate the atoms provided by the IWAS Platform.

### 3. Read-Only Script Generation

While a user might have the `net:router:script` permission, they **cannot modify** the variables (VPN IP, RADIUS Secret) on the Dashboard.

---

## 📁 Related Documents

- [Multi-Tenancy Architecture](../../04-architecture/multi-tenancy.md)
- [Location Management](../admin/location-management.md)
- [Google OAuth Login](./google-oauth.md)

---

[← Back to Features](../README.md)

# Role-Based Access Control (RBAC)

**Product:** IWAS – iCafe WiFi Access Service  
**Feature ID:** FR-04  
**Priority:** P0 (Critical)  
**Last Updated:** February 16, 2026

---

## Overview

IWAS implements a comprehensive Role-Based Access Control (RBAC) system to manage permissions across different user types. This ensures that users have appropriate access levels based on their roles and responsibilities.

---

## Roles

### 1. Super Admin

**Description:** Full system administrator with complete access

**Scope:** All locations, all features

**Typical Users:**

- System administrators
- DevOps engineers
- CTO/Technical leadership

**Permissions:**

✅ **Locations**

- Create, read, update, delete all locations
- Configure location settings
- Assign location managers

✅ **Users**

- Create, read, update, delete all user accounts
- Assign roles and permissions
- View all user activity
- Manage admin accounts

✅ **Packages**

- Create, read, update, delete packages for any location
- Set pricing and configurations
- Manage package templates

✅ **Sessions**

- View all sessions across all locations
- Force disconnect any session
- View detailed session logs

✅ **Reports**

- Access all reports and analytics
- Export data
- View financial reports

✅ **System**

- Configure system settings
- Manage integrations
- View system logs
- Access admin tools

**Restrictions:**

- None (full access)

---

### 2. Location Manager

**Description:** Manager responsible for one or more specific locations

**Scope:** Assigned location(s) only

**Typical Users:**

- iCafe owners
- Location managers
- Franchise operators

**Permissions:**

✅ **Locations (Own)**

- Read and update assigned location(s)
- Configure location-specific settings
- Cannot create or delete locations

✅ **Users (Location)**

- View users at assigned location(s)
- Cannot create admin accounts
- Cannot modify user roles

✅ **Packages (Own Location)**

- Create, read, update, delete packages for assigned location(s)
- Set pricing and configurations
- Manage promotions

✅ **Sessions (Own Location)**

- View sessions at assigned location(s)
- Force disconnect sessions at assigned location(s)
- View session details

✅ **Reports (Own Location)**

- Access reports for assigned location(s)
- View revenue and analytics
- Export location-specific data

✅ **System**

- View system status
- Cannot modify system settings

**Restrictions:**

- ❌ Cannot access other locations
- ❌ Cannot create/delete locations
- ❌ Cannot manage admin users
- ❌ Cannot access system settings

---

### 3. Operator

**Description:** Staff member with view-only access and limited actions

**Scope:** Assigned location(s) only

**Typical Users:**

- iCafe staff
- Customer support
- Shift supervisors

**Permissions:**

✅ **Locations (Own)**

- Read assigned location(s)
- Cannot modify settings

✅ **Users (Location)**

- View users at assigned location(s)
- Cannot modify users

✅ **Packages (Own Location)**

- View packages at assigned location(s)
- Cannot create or modify packages

✅ **Sessions (Own Location)**

- View active sessions at assigned location(s)
- Force disconnect sessions (limited)
- View basic session details

✅ **Reports (Own Location)**

- View basic reports for assigned location(s)
- Cannot export data

**Restrictions:**

- ❌ Cannot access other locations
- ❌ Cannot create or modify packages
- ❌ Cannot modify location settings
- ❌ Cannot access financial reports
- ❌ Cannot manage users

---

### 4. Customer (PC User)

**Description:** Regular customer with PC account

**Scope:** Own account only

**Typical Users:**

- PC gamers
- Regular iCafe customers

**Permissions:**

✅ **WiFi**

- Purchase WiFi packages
- View available packages
- Activate WiFi sessions

✅ **Account**

- View own profile
- View transaction history
- Manage payment methods
- View active sessions

✅ **Devices**

- View linked devices
- Manage device bindings

**Restrictions:**

- ❌ Cannot access admin features
- ❌ Cannot view other users' data
- ❌ Cannot modify packages or pricing
- ❌ Cannot access reports

---

### 5. Guest User

**Description:** Guest customer without PC account (Google OAuth)

**Scope:** Own account only

**Typical Users:**

- Remote workers
- Students
- Freelancers

**Permissions:**

✅ **WiFi**

- Purchase WiFi packages
- View available packages
- Activate WiFi sessions

✅ **Account**

- View own profile
- View transaction history
- Manage payment methods (e-wallet, bank QR only)
- View active sessions

✅ **Devices**

- View linked devices
- Manage device bindings

**Restrictions:**

- ❌ Cannot access admin features
- ❌ Cannot view other users' data
- ❌ Cannot modify packages or pricing
- ❌ Cannot access reports
- ❌ Cannot link PC account (unless upgraded)

---

## Permissions Matrix

### Admin Features

| Feature                | Super Admin | Location Manager | Operator     | Customer | Guest |
| ---------------------- | ----------- | ---------------- | ------------ | -------- | ----- |
| **Locations**          |
| View all locations     | ✅          | ❌               | ❌           | ❌       | ❌    |
| View own location(s)   | ✅          | ✅               | ✅           | ❌       | ❌    |
| Create location        | ✅          | ❌               | ❌           | ❌       | ❌    |
| Edit location          | ✅          | ✅ (own)         | ❌           | ❌       | ❌    |
| Delete location        | ✅          | ❌               | ❌           | ❌       | ❌    |
| **Packages**           |
| View all packages      | ✅          | ❌               | ❌           | ❌       | ❌    |
| View location packages | ✅          | ✅ (own)         | ✅ (own)     | ✅       | ✅    |
| Create package         | ✅          | ✅ (own)         | ❌           | ❌       | ❌    |
| Edit package           | ✅          | ✅ (own)         | ❌           | ❌       | ❌    |
| Delete package         | ✅          | ✅ (own)         | ❌           | ❌       | ❌    |
| **Sessions**           |
| View all sessions      | ✅          | ❌               | ❌           | ❌       | ❌    |
| View location sessions | ✅          | ✅ (own)         | ✅ (own)     | ❌       | ❌    |
| View own sessions      | ✅          | ✅               | ✅           | ✅       | ✅    |
| Force disconnect       | ✅          | ✅ (own loc)     | ✅ (own loc) | ❌       | ❌    |
| **Reports**            |
| View all reports       | ✅          | ❌               | ❌           | ❌       | ❌    |
| View location reports  | ✅          | ✅ (own)         | ✅ (basic)   | ❌       | ❌    |
| View own history       | ✅          | ✅               | ✅           | ✅       | ✅    |
| Export data            | ✅          | ✅ (own)         | ❌           | ❌       | ❌    |
| **Users**              |
| View all users         | ✅          | ❌               | ❌           | ❌       | ❌    |
| View location users    | ✅          | ✅ (own)         | ✅ (own)     | ❌       | ❌    |
| Create admin user      | ✅          | ❌               | ❌           | ❌       | ❌    |
| Assign roles           | ✅          | ❌               | ❌           | ❌       | ❌    |
| **System**             |
| System settings        | ✅          | ❌               | ❌           | ❌       | ❌    |
| View system logs       | ✅          | ❌               | ❌           | ❌       | ❌    |
| Manage integrations    | ✅          | ❌               | ❌           | ❌       | ❌    |

### Customer Features

| Feature                  | Super Admin | Location Manager | Operator | Customer | Guest |
| ------------------------ | ----------- | ---------------- | -------- | -------- | ----- |
| Purchase WiFi            | ✅          | ✅               | ✅       | ✅       | ✅    |
| View packages            | ✅          | ✅               | ✅       | ✅       | ✅    |
| Manage payment methods   | ✅          | ✅               | ✅       | ✅       | ✅    |
| View transaction history | ✅          | ✅               | ✅       | ✅       | ✅    |
| Manage devices           | ✅          | ✅               | ✅       | ✅       | ✅    |
| Link PC account          | ✅          | ✅               | ✅       | ✅       | ❌    |

---

## Implementation

### Data Model

```typescript
// Role Definition
interface Role {
  id: string;
  name: "super_admin" | "location_manager" | "operator" | "customer" | "guest";
  display_name: string;
  description: string;
  permissions: Permission[];
  created_at: Date;
  updated_at: Date;
}

// Permission Definition
interface Permission {
  id: string;
  resource: string; // 'locations', 'packages', 'sessions', 'users', 'reports', 'system'
  actions: Action[]; // ['create', 'read', 'update', 'delete', 'manage']
  scope: "all" | "own" | "location"; // Scope of access
  conditions?: Condition[]; // Optional conditions
}

// Action Types
type Action =
  | "create"
  | "read"
  | "update"
  | "delete"
  | "manage"
  | "export"
  | "force_disconnect";

// Scope Conditions
interface Condition {
  field: string;
  operator: "equals" | "in" | "not_in";
  value: any;
}

// User Role Assignment
interface UserRole {
  id: string;
  user_id: string;
  role_id: string;
  location_id?: string; // For location-scoped roles
  assigned_by: string; // User ID of assigner
  assigned_at: Date;
  expires_at?: Date; // Optional expiration
}
```

### Permission Checking

```typescript
// Permission Check Middleware
async function checkPermission(
  userId: string,
  resource: string,
  action: Action,
  resourceId?: string,
): Promise<boolean> {
  // 1. Get user's roles
  const userRoles = await getUserRoles(userId);

  // 2. Get permissions for all roles
  const permissions = await getPermissionsForRoles(userRoles);

  // 3. Check if any permission matches
  for (const permission of permissions) {
    if (permission.resource !== resource) continue;
    if (!permission.actions.includes(action)) continue;

    // 4. Check scope
    if (permission.scope === "all") {
      return true;
    }

    if (permission.scope === "own") {
      // Check if resource belongs to user
      const isOwner = await checkOwnership(userId, resource, resourceId);
      if (isOwner) return true;
    }

    if (permission.scope === "location") {
      // Check if resource belongs to user's location
      const userLocations = await getUserLocations(userId);
      const resourceLocation = await getResourceLocation(resource, resourceId);
      if (userLocations.includes(resourceLocation)) return true;
    }

    // 5. Check conditions
    if (permission.conditions) {
      const conditionsMet = await checkConditions(
        permission.conditions,
        resourceId,
      );
      if (conditionsMet) return true;
    }
  }

  return false;
}

// Express Middleware
function requirePermission(resource: string, action: Action) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user.id;
    const resourceId = req.params.id;

    const hasPermission = await checkPermission(
      userId,
      resource,
      action,
      resourceId,
    );

    if (!hasPermission) {
      return res.status(403).json({
        success: false,
        error: {
          code: "FORBIDDEN",
          message: "You do not have permission to perform this action",
        },
      });
    }

    next();
  };
}

// Usage Example
app.get(
  "/api/packages/:id",
  authenticate,
  requirePermission("packages", "read"),
  async (req, res) => {
    // Handler code
  },
);

app.post(
  "/api/packages",
  authenticate,
  requirePermission("packages", "create"),
  async (req, res) => {
    // Handler code
  },
);
```

### Role Assignment

```typescript
// Assign Role to User
async function assignRole(
  userId: string,
  roleName: string,
  locationId?: string,
  assignedBy?: string,
): Promise<UserRole> {
  // 1. Validate role exists
  const role = await getRoleByName(roleName);
  if (!role) throw new Error("Role not found");

  // 2. Check if assigner has permission
  if (assignedBy) {
    const canAssign = await checkPermission(assignedBy, "users", "manage");
    if (!canAssign) throw new Error("Insufficient permissions");
  }

  // 3. Validate location for location-scoped roles
  if (roleName === "location_manager" || roleName === "operator") {
    if (!locationId) throw new Error("Location ID required for this role");
  }

  // 4. Create user role assignment
  const userRole = await db.userRoles.create({
    user_id: userId,
    role_id: role.id,
    location_id: locationId,
    assigned_by: assignedBy,
    assigned_at: new Date(),
  });

  // 5. Audit log
  await auditLog({
    action: "ROLE_ASSIGNED",
    user_id: userId,
    role_id: role.id,
    location_id: locationId,
    assigned_by: assignedBy,
  });

  return userRole;
}
```

---

## Security Considerations

### 1. Principle of Least Privilege

**Rule:** Users should have the minimum permissions necessary to perform their job

**Implementation:**

- Default to most restrictive role
- Explicitly grant permissions
- Regular permission audits

### 2. Separation of Duties

**Rule:** Critical actions require multiple roles

**Examples:**

- Creating admin users: Super Admin only
- Financial reports: Super Admin or Location Manager
- Force disconnect: Admin roles only

### 3. Audit Logging

**Rule:** All permission-sensitive actions must be logged

**Logged Actions:**

- Role assignments/removals
- Permission changes
- Admin actions (force disconnect, etc.)
- Access to sensitive data

```typescript
interface AuditLog {
  id: string;
  action: string;
  user_id: string;
  resource: string;
  resource_id?: string;
  changes?: any;
  ip_address: string;
  user_agent: string;
  timestamp: Date;
}
```

### 4. Session Management

**Rule:** Admin sessions have shorter timeouts

**Timeouts:**

- Super Admin: 1 hour
- Location Manager: 2 hours
- Operator: 4 hours
- Customer/Guest: 24 hours

### 5. Multi-Factor Authentication (MFA)

**Rule:** Admin roles require MFA

**Requirements:**

- Super Admin: MFA required
- Location Manager: MFA required
- Operator: MFA optional
- Customer/Guest: MFA optional

---

## Role Transitions

### Customer → Location Manager

**Scenario:** Customer becomes iCafe owner

**Process:**

1. Super Admin creates Location Manager role
2. Assigns to user's account
3. User now has both Customer and Location Manager roles
4. Can switch between roles in UI

### Guest → Customer

**Scenario:** Guest user links PC account

**Process:**

1. Guest user links PC account in Payment Wallet
2. System automatically upgrades role to Customer
3. Guest role removed
4. Gains access to PC balance payment

---

## Testing

### Permission Tests

```typescript
describe("RBAC Permissions", () => {
  describe("Super Admin", () => {
    it("should access all locations", async () => {
      const hasPermission = await checkPermission(
        superAdminId,
        "locations",
        "read",
      );
      expect(hasPermission).toBe(true);
    });

    it("should create admin users", async () => {
      const hasPermission = await checkPermission(
        superAdminId,
        "users",
        "manage",
      );
      expect(hasPermission).toBe(true);
    });
  });

  describe("Location Manager", () => {
    it("should access own location", async () => {
      const hasPermission = await checkPermission(
        locationManagerId,
        "locations",
        "read",
        ownLocationId,
      );
      expect(hasPermission).toBe(true);
    });

    it("should NOT access other locations", async () => {
      const hasPermission = await checkPermission(
        locationManagerId,
        "locations",
        "read",
        otherLocationId,
      );
      expect(hasPermission).toBe(false);
    });
  });

  describe("Customer", () => {
    it("should purchase WiFi", async () => {
      const hasPermission = await checkPermission(
        customerId,
        "packages",
        "read",
      );
      expect(hasPermission).toBe(true);
    });

    it("should NOT access admin features", async () => {
      const hasPermission = await checkPermission(
        customerId,
        "locations",
        "manage",
      );
      expect(hasPermission).toBe(false);
    });
  });
});
```

---

## Related Documents

- [User Personas](./personas.md)
- [User Journeys](./user-journeys.md)
- [Authentication Features](../05-features/authentication/)
- [Admin Features](../05-features/admin/)
- [Security Architecture](../04-architecture/security-architecture.md)

---

[← Back to Users](./README.md) | [← Back to Hub](../README.md)

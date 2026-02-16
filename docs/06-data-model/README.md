# Section 06: Data Model

This section defines the database schema and TypeScript types for the IWAS platform. We follow a **Multi-tenant** architecture where almost every record is scoped to an `Organization`.

## 🏛️ Entity Relationship Overview

The data model is hierarchical:

1. **Organization (Tenant):** The brand/company (e.g., "Kingdom Gaming").
2. **Location (Branch):** A physical site belonging to an organization.
3. **Users:** Assigned to an organization and optionally a location.
4. **Packages:** Defined per organization, available at specific locations.
5. **Sessions:** Linked to a User, a Location, and a Package.

## 📑 Core Collections

1.  **[Organizations](./organizations.md):** Tenant configuration & Branding.
2.  **[Locations](./locations.md):** Branch settings & VPN metadata.
3.  **[Users/Roles](./users.md):** IAM and Access Control.
4.  **[Packages](./packages.md):** Pricing, Speed limits, and Duration.
5.  **[Transactions](./transactions.md):** Payment logs & Ledger.
6.  **[Sessions](./sessions.md):** Active WiFi sessions & Heartbeats.
7.  **[System Settings](./system-settings.md):** Global platform configuration (WireGuard/RADIUS).

---

## 🛠️ Global Field Patterns

Every collection (where applicable) includes these metadata fields:

```typescript
type MetadataFields = {
  organization: string | Organization; // Relationship
  createdAt: Date;
  updatedAt: Date;
  createdBy?: string | User;
};
```

[← Back to Documentation Hub](../README.md)

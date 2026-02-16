# Multi-Tenancy & White-Labeling (Enterprise)

**Section ID:** 04-04  
**Status:** 📝 Documented  
**Last Updated:** February 16, 2026

---

## Overview

IWAS is designed as a **Multi-tenant Platform**, allowing it to host multiple independent iCafe brands (Enterprises) on a single infrastructure. Each Enterprise enjoys a fully branded experience, separate data, and custom logic.

---

## 🏗️ Architecture for Enterprises

### 1. Unified Tenancy Management

We leverage the official **`@payloadcms/plugin-multi-tenant`** to handle complex enterprise requirements.

- **Tenants Collection:** Previously mapped as `organizations`, this collection is the root of the tenancy tree. It stores:
  - Branding assets (Logo, Favicon).
  - Custom CSS tokens (colors, border-radius).
  - Domain / Subdomain mappings.
- **Automatic Scoping:** The plugin automatically injects a `tenant` field into all scoped collections (`Locations`, `Packages`, `Users`, `Sessions`).
- **Data Isolation:** All database queries are automatically filtered to the active tenant based on the request's domain or the logged-in user's relationship.
- **Cross-Tenant Access:** Super-admins can access all data, while Organization admins are restricted to their assigned tenant(s).

### 2. Branding & Custom Domain Support

The system uses domain-based tenant detection to serve the correct branding and data isolation for each request.

| Strategy             | Mechanism                                                                                               |
| -------------------- | ------------------------------------------------------------------------------------------------------- |
| **Domain Detection** | Managed by `@payloadcms/plugin-multi-tenant` using the `useDomains: true` configuration.                |
| **Mapping**          | The system matches the incoming `Host` header to the `domains` array in the `organizations` collection. |
| **Subdomains**       | Supports wildcard or specific subdomains (e.g., `tenant1.iwas.vn`, `portal.chain-a.com`).               |
| **Asset Injection**  | Logo and theme tokens are fetched based on the detected tenant and injected into the portal.            |

#### How Domain Resolution Works

1.  **Incoming Request:** A user hits `wifi.brand-a.com`.
2.  **Plugin Middleware:** Payload checks the `Host` header against the `organizations` collection's `domains` field.
3.  **Tenant Context:** Once a match is found, the plugin sets the `req.tenant` context.
4.  **Automatic Filtering:** All subsequent database operations (e.g., fetching WiFi packages) are automatically scoped to that Tenant ID.
5.  **Branding:** The Next.js frontend reads the tenant's branding configuration to render the custom UI.

---

## 📡 RADIUS Scoping

To handle multiple enterprises on a single RADIUS cluster:

- **Scoping by NAS-ID:** When a packet arrives, the system resolving logic filters the request:
  `Packet -> NAS-ID -> Location -> Organization`.
- **Payment Gateway per Tenant:** Each organization can link its own business API keys for Momo, VNPay, or Bank QR so the money goes directly to their accounts.

---

## 🛠️ Super Admin (Platform) vs. Organization Admin

The system has two tiers of administrative access:

1. **Platform Super Admin (You):**
   - Can create new Organizations.
   - Can monitor overall system health across all tenants.
   - Can set global defaults and maintenance windows.

2. **Organization Admin (The iCafe Brand):**
   - Can manage their own branches (Locations).
   - Can create and price their own WiFi Packages.
   - Can view the data only for their customers.

---

## ✅ Benefits of this Model

- **Scalability:** Add a new 20-branch chain in minutes through the UI.
- **Cost Efficiency:** Multiple brands share the same expensive infrastructure (RADIUS, Database) while feeling like they have their own custom software.
- **Future-Proof:** Easily pivot from a "Chain Management System" to a "SaaS WiFi Provider".

---

## Related Documents

- [System Architecture](./system-architecture.md)
- [Location Management](../../05-features/admin/location-management.md)
- [Tech Stack](./tech-stack.md)

---

[← Back to Architecture](./README.md)

# Multi-Tenancy & White-Labeling (Enterprise)

**Section ID:** 04-04  
**Status:** 📝 Documented  
**Last Updated:** February 16, 2026

---

## Overview

IWAS is designed as a **Multi-tenant Platform**, allowing it to host multiple independent iCafe brands (Enterprises) on a single infrastructure. Each Enterprise enjoys a fully branded experience, separate data, and custom logic.

---

## 🏗️ Architecture for Enterprises

### 1. Data Segregation

We use a **Shared Database, Isolated Data** model.

- **Organizations Collection:** Stores Branding assets (Logo, Favicon), Custom CSS tokens (colors, border-radius), and Domain settings.
- **Ownership:** Every `Location`, `Package`, `User`, and `Session` has an `organization` field (Relationship) to ensure data strictly belongs to one tenant.

### 2. Branding & Custom Domain Support

The Frontend (Next.js) uses a **Theme Provider** that loads configuration dynamically based on the request metadata.

| Strategy             | Mechanism                                                                                      |
| -------------------- | ---------------------------------------------------------------------------------------------- |
| **Subdomain/Domain** | `wifi.brand-a.com` vs `wifi.brand-b.vn`. The system maps the hostname to the `OrganizationID`. |
| **Asset Injection**  | Logo and font-family are injected into the Captive Portal head at runtime from Payload CMS.    |
| **White-labeling**   | Ability to hide "Powered by IWAS" for Enterprise tier customers.                               |

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

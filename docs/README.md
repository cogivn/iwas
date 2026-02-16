# IWAS – iCafe WiFi Access Service

## Documentation Hub

**Version:** 1.0  
**Last Updated:** February 16, 2026  
**Status:** Active Development

---

## 📚 Documentation Structure

This documentation is organized into 12 main sections for easy navigation and maintenance.

### [01. Overview](./01-overview/)

High-level product information and vision

- [Executive Summary](./01-overview/executive-summary.md)
- [Product Vision](./01-overview/product-vision.md)
- [Target Market](./01-overview/target-market.md)
- [Success Metrics](./01-overview/success-metrics.md)

### [02. Business](./02-business/)

Business objectives, revenue model, and risk analysis

- [Business Objectives](./02-business/objectives.md)
- [Revenue Model](./02-business/revenue-model.md)
- [Risks & Mitigation](./02-business/risks-mitigation.md)

### [03. Users](./03-users/)

User personas, journeys, and access control

- [User Personas](./03-users/personas.md)
- [User Journeys](./03-users/user-journeys.md)
- [RBAC (Roles & Permissions)](./03-users/rbac.md)

### [04. Architecture](./04-architecture/)

Technical architecture and system design

- [Technology Stack](./04-architecture/tech-stack.md)
- [System Architecture](./04-architecture/system-architecture.md)
- [Data Flows](./04-architecture/data-flows.md)
- [Network Design](./04-architecture/network-design.md)
- [Security Architecture](./04-architecture/security-architecture.md)

### [05. Features](./05-features/)

Detailed functional requirements organized by domain

#### Authentication

- [PC Account Login](./05-features/authentication/pc-account-login.md) (FR-01)
- [QR Code Login](./05-features/authentication/qr-code-login.md) (FR-02)
- [Google OAuth](./05-features/authentication/google-oauth.md) (FR-03)
- [RBAC Implementation](./05-features/authentication/rbac.md) (FR-04)

#### Payments

- [Multi-Payment Gateway](./05-features/payments/multi-payment-gateway.md) (FR-05)
- [PC Balance Payment](./05-features/payments/pc-balance-payment.md) (FR-06)
- [E-Wallet Payment](./05-features/payments/ewallet-payment.md) (FR-07)
- [Bank QR Payment](./05-features/payments/bank-qr-payment.md) (FR-08)
- [Transaction Management](./05-features/payments/transaction-management.md) (FR-09)
- [Payment Wallet](./05-features/payments/payment-wallet.md) (FR-10)

#### Packages

- [Package Management](./05-features/packages/package-management.md)
- [Package Selection](./05-features/packages/package-selection.md)

#### Sessions

- [Device Binding](./05-features/sessions/device-binding.md)
- [Session Lifecycle](./05-features/sessions/session-lifecycle.md)
- [PC Logout Sync](./05-features/sessions/pc-logout-sync.md)
- [Concurrent Sessions](./05-features/sessions/concurrent-sessions.md)

#### Network

- [VLAN Isolation](./05-features/network/vlan-isolation.md)
- [Bandwidth Management](./05-features/network/bandwidth-management.md)
- [Anti-Abuse](./05-features/network/anti-abuse.md)

#### Admin

- [Location Management](./05-features/admin/location-management.md)
- [Package Administration](./05-features/admin/package-admin.md)
- [Session Monitoring](./05-features/admin/session-monitoring.md)
- [Reports & Analytics](./05-features/admin/reports-analytics.md)
- [System Health](./05-features/admin/system-health.md)

### [06. Data Model](./06-data-model/)

Database schemas and entity relationships

- [Entity Relationship Diagram](./06-data-model/erd.md)
- [User Schemas](./06-data-model/schemas/users.md)
- [Payment Schemas](./06-data-model/schemas/payments.md)
- [Session Schemas](./06-data-model/schemas/sessions.md)
- [Package Schemas](./06-data-model/schemas/packages.md)
- [Location Schemas](./06-data-model/schemas/locations.md)
- [Migration Strategy](./06-data-model/migrations/)

### [07. API](./07-api/)

API endpoints and contracts

- [Authentication API](./07-api/authentication.md)
- [Payment API](./07-api/payments.md)
- [Wallet API](./07-api/wallet.md)
- [Package API](./07-api/packages.md)
- [Session API](./07-api/sessions.md)
- [Admin API](./07-api/admin.md)
- [Webhooks](./07-api/webhooks.md)

### [08. Integrations](./08-integrations/)

Third-party integrations and external APIs

- [PC System API](./08-integrations/pc-system-api.md)
- [Google OAuth](./08-integrations/google-oauth.md)
- [Momo](./08-integrations/momo.md)
- [ZaloPay](./08-integrations/zalopay.md)
- [VNPay](./08-integrations/vnpay.md)
- [VietQR](./08-integrations/vietqr.md)
- [RADIUS](./08-integrations/radius.md)

### [09. Non-Functional Requirements](./09-non-functional/)

Performance, security, and operational requirements

- [Performance](./09-non-functional/performance.md)
- [Availability & SLA](./09-non-functional/availability.md)
- [Security](./09-non-functional/security.md)
- [Scalability](./09-non-functional/scalability.md)
- [Maintainability](./09-non-functional/maintainability.md)

### [10. Roadmap](./10-roadmap/)

Product roadmap and release planning

- [MVP - Phase 1](./10-roadmap/mvp-phase1.md)
- [Phase 2](./10-roadmap/phase2.md)
- [Phase 3](./10-roadmap/phase3.md)
- [Backlog](./10-roadmap/backlog.md)

### [11. UI/UX](./11-ui-ux/)

User interface and experience design

- [Design System](./11-ui-ux/design-system.md)
- [Captive Portal](./11-ui-ux/captive-portal.md)
- [Payment Wallet UI](./11-ui-ux/payment-wallet-ui.md)
- [Admin Dashboard](./11-ui-ux/admin-dashboard.md)

### [12. Appendix](./12-appendix/)

Additional resources and references

- [Glossary](./12-appendix/glossary.md)
- [References](./12-appendix/references.md)
- [Changelog](./12-appendix/changelog.md)
- [Templates](./12-appendix/templates/)

---

## 🚀 Quick Start

### For Product Managers

1. Start with [Executive Summary](./01-overview/executive-summary.md)
2. Review [Business Objectives](./02-business/objectives.md)
3. Check [Roadmap](./10-roadmap/)

### For Developers

1. Review [Tech Stack](./04-architecture/tech-stack.md)
2. Study [System Architecture](./04-architecture/system-architecture.md)
3. Explore [Features](./05-features/) by domain
4. Reference [API Documentation](./07-api/)
5. Check [Data Model](./06-data-model/)

### For Designers

1. Review [User Personas](./03-users/personas.md)
2. Study [User Journeys](./03-users/user-journeys.md)
3. Check [UI/UX Guidelines](./11-ui-ux/)

### For QA/Testing

1. Review [Features](./05-features/) for acceptance criteria
2. Check [Non-Functional Requirements](./09-non-functional/)
3. Study [User Journeys](./03-users/user-journeys.md)

---

## 📝 Documentation Guidelines

### Adding New Features

1. Use the [Feature Template](./12-appendix/templates/feature-template.md)
2. Add to appropriate section in `05-features/`
3. Update this README with links
4. Update [Changelog](./12-appendix/changelog.md)

### Adding New APIs

1. Use the [API Template](./12-appendix/templates/api-template.md)
2. Add to `07-api/`
3. Update API index
4. Link from related feature docs

### Cross-Referencing

Use relative links to reference other documents:

```markdown
See [Payment Wallet](../05-features/payments/payment-wallet.md) for details.
```

---

## 🔍 Search & Navigation Tips

### By Feature

All features are in `05-features/` organized by domain:

- Authentication
- Payments
- Packages
- Sessions
- Network
- Admin

### By Role

- **Super Admin**: See [RBAC](./03-users/rbac.md)
- **Location Manager**: See [Admin Features](./05-features/admin/)
- **Customer**: See [User Journeys](./03-users/user-journeys.md)

### By Phase

- **MVP**: See [Phase 1](./10-roadmap/mvp-phase1.md)
- **Future**: See [Phase 2](./10-roadmap/phase2.md) and [Phase 3](./10-roadmap/phase3.md)

---

## 📊 Document Status

| Section        | Status         | Last Updated | Owner        |
| -------------- | -------------- | ------------ | ------------ |
| Overview       | ✅ Complete    | 2026-02-16   | Product Team |
| Business       | ✅ Complete    | 2026-02-16   | Product Team |
| Users          | ✅ Complete    | 2026-02-16   | Product Team |
| Architecture   | ✅ Complete    | 2026-02-16   | Engineering  |
| Features       | ✅ Complete    | 2026-02-16   | Product Team |
| Data Model     | 🚧 In Progress | 2026-02-16   | Engineering  |
| API            | 🚧 In Progress | 2026-02-16   | Engineering  |
| Integrations   | 🚧 In Progress | 2026-02-16   | Engineering  |
| Non-Functional | ✅ Complete    | 2026-02-16   | Engineering  |
| Roadmap        | ✅ Complete    | 2026-02-16   | Product Team |
| UI/UX          | 📝 Planned     | -            | Design Team  |
| Appendix       | ✅ Complete    | 2026-02-16   | Product Team |

---

## 🤝 Contributing

When updating documentation:

1. Keep documents focused and single-purpose
2. Use clear, descriptive headings
3. Include code examples where applicable
4. Add cross-references to related docs
5. Update the changelog
6. Keep the main README in sync

---

## 📞 Contact

For questions about this documentation:

- **Product Team**: [Contact Info]
- **Engineering Team**: [Contact Info]
- **Design Team**: [Contact Info]

---

**Archive:** The original monolithic PRD is available at [prd-archive.md](./prd-archive.md)

# Documentation Changelog

All notable changes to the IWAS documentation will be recorded in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

---

## [1.0.0] - 2026-02-16

### Added

#### Documentation Structure

- Created modular documentation structure with 12 main sections
- Added comprehensive navigation via main README.md
- Created section-specific README files for easy navigation
- Added templates for features and API documentation
- Created glossary of terms and acronyms

#### Overview Section (01-overview/)

- Executive Summary with product overview and value propositions
- Product Vision (placeholder)
- Target Market analysis (placeholder)
- Success Metrics and KPIs (placeholder)

#### Business Section (02-business/)

- Business Objectives
- Revenue Model
- Risks & Mitigation

#### Users Section (03-users/)

- User Personas (PC Customer, iCafe Owner/Manager)
- User Journeys (First Time and Returning users)
- RBAC documentation with 5 roles and permissions matrix

#### Architecture Section (04-architecture/)

- Technology Stack
- System Architecture diagrams
- Data Flow documentation
- Network Design with VLAN isolation
- Security Architecture

#### Features Section (05-features/)

- **Authentication Features:**
  - FR-01: PC Account Login
  - FR-02: QR Code Login
  - FR-03: Google OAuth
  - FR-04: RBAC Implementation

- **Payment Features:**
  - FR-05: Multi-Payment Gateway Support
  - FR-06: PC Balance Payment
  - FR-07: E-Wallet Payment (Momo, ZaloPay, VNPay)
  - FR-08: Bank QR Payment (VietQR)
  - FR-09: Transaction Management
  - FR-10: Payment Wallet Management

- **Package Features:**
  - Package Management
  - Package Selection

- **Session Features:**
  - Device Binding
  - Session Lifecycle
  - PC Logout Sync
  - Concurrent Sessions

- **Network Features:**
  - VLAN Isolation
  - Bandwidth Management
  - Anti-Abuse

- **Admin Features:**
  - Location Management
  - Package Administration
  - Session Monitoring
  - Reports & Analytics
  - System Health

#### Data Model Section (06-data-model/)

- ERD documentation (placeholder)
- Schema documentation for Users, Payments, Sessions, Packages, Locations
- Migration strategy (placeholder)

#### API Section (07-api/)

- Authentication API
- Payment API
- Wallet API
- Package API
- Session API
- Admin API
- Webhooks

#### Integrations Section (08-integrations/)

- PC System API
- Google OAuth
- Momo, ZaloPay, VNPay
- VietQR
- RADIUS

#### Non-Functional Requirements (09-non-functional/)

- Performance requirements
- Availability & SLA
- Security requirements
- Scalability requirements
- Maintainability requirements

#### Roadmap Section (10-roadmap/)

- MVP - Phase 1 (Month 1-2)
- Phase 2 (Month 3-4)
- Phase 3 (Month 5-6)
- Backlog

#### UI/UX Section (11-ui-ux/)

- Design System (placeholder)
- Captive Portal UI (placeholder)
- Payment Wallet UI (placeholder)
- Admin Dashboard UI (placeholder)

#### Appendix Section (12-appendix/)

- Comprehensive Glossary
- References (placeholder)
- This Changelog
- Feature Template
- API Template

### Changed

- Restructured monolithic PRD into modular documentation
- Archived original PRD as `prd-archive.md`
- Updated user journeys to reflect Google OAuth + Payment Wallet workflow
- Enhanced payment features with Payment Wallet module

### Technical Details

- Created 12 main documentation sections
- Generated 50+ documentation files
- Established cross-referencing system
- Implemented consistent navigation structure

---

## [0.1.0] - 2026-02-16 (Pre-restructure)

### Initial PRD Content

- Monolithic PRD document with all sections in single file
- Basic authentication with PC account
- Payment via PC balance only
- Standard WiFi package management
- Basic admin dashboard

---

## Future Versions

### Planned for 1.1.0

- [ ] Complete all placeholder documents
- [ ] Add sequence diagrams for critical flows
- [ ] Add UI/UX wireframes and mockups
- [ ] Complete API documentation for all endpoints
- [ ] Add integration guides with code examples
- [ ] Add deployment documentation
- [ ] Add troubleshooting guides

### Planned for 1.2.0

- [ ] Add mobile app documentation
- [ ] Add advanced analytics features
- [ ] Add machine learning fraud detection docs
- [ ] Add third-party API integration guides

---

## How to Contribute

When updating documentation:

1. **Make Changes**
   - Update relevant documentation files
   - Follow existing templates and structure
   - Add cross-references where appropriate

2. **Update Changelog**
   - Add entry under "Unreleased" section
   - Use categories: Added, Changed, Deprecated, Removed, Fixed, Security
   - Include date and version when releasing

3. **Update README**
   - Update main README.md if adding new sections
   - Update section README.md if adding new documents
   - Ensure all links are working

4. **Version Format**
   - Use Semantic Versioning: MAJOR.MINOR.PATCH
   - MAJOR: Incompatible changes
   - MINOR: New features (backward compatible)
   - PATCH: Bug fixes and minor updates

---

## Contact

For questions about documentation changes:

- **Product Team**: [Contact Info]
- **Documentation Owner**: [Contact Info]

---

[← Back to Appendix](./README.md) | [← Back to Hub](../README.md)

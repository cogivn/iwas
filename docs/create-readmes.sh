#!/bin/bash

# Script to create all README.md files for documentation structure

BASE_DIR="/Users/norashing/Desktop/makingsite/time-link/docs"

# Create README files for each section

# 02-business
cat > "$BASE_DIR/02-business/README.md" << 'EOF'
# Business

Business objectives, revenue model, and risk analysis.

## Documents

- **[Business Objectives](./objectives.md)** - Strategic business goals
- **[Revenue Model](./revenue-model.md)** - Revenue goals and pricing strategy
- **[Risks & Mitigation](./risks-mitigation.md)** - Risk analysis and mitigation strategies

[← Back to Documentation Hub](../README.md)
EOF

# 03-users
cat > "$BASE_DIR/03-users/README.md" << 'EOF'
# Users

User personas, journeys, and access control.

## Documents

- **[User Personas](./personas.md)** - Detailed user personas
- **[User Journeys](./user-journeys.md)** - User flows and journeys
- **[RBAC](./rbac.md)** - Role-based access control

[← Back to Documentation Hub](../README.md)
EOF

# 04-architecture
cat > "$BASE_DIR/04-architecture/README.md" << 'EOF'
# Architecture

Technical architecture and system design.

## Documents

- **[Technology Stack](./tech-stack.md)** - Technologies and frameworks
- **[System Architecture](./system-architecture.md)** - High-level system design
- **[Data Flows](./data-flows.md)** - Data flow diagrams
- **[Network Design](./network-design.md)** - Network topology and VLAN design
- **[Security Architecture](./security-architecture.md)** - Security design and controls

[← Back to Documentation Hub](../README.md)
EOF

# 05-features
cat > "$BASE_DIR/05-features/README.md" << 'EOF'
# Features

Detailed functional requirements organized by domain.

## Domains

- **[Authentication](./authentication/)** - Login and access control
- **[Payments](./payments/)** - Payment processing and wallet
- **[Packages](./packages/)** - WiFi package management
- **[Sessions](./sessions/)** - Session lifecycle and device management
- **[Network](./network/)** - Network controls and anti-abuse
- **[Admin](./admin/)** - Administrative features

[← Back to Documentation Hub](../README.md)
EOF

# 05-features/authentication
cat > "$BASE_DIR/05-features/authentication/README.md" << 'EOF'
# Authentication Features

User authentication and authorization features.

## Features

- **[PC Account Login](./pc-account-login.md)** (FR-01) - Login with PC credentials
- **[QR Code Login](./qr-code-login.md)** (FR-02) - Quick login via QR code
- **[Google OAuth](./google-oauth.md)** (FR-03) - Google account integration
- **[RBAC](./rbac.md)** (FR-04) - Role-based access control

[← Back to Features](../README.md) | [← Back to Hub](../../README.md)
EOF

# 05-features/payments
cat > "$BASE_DIR/05-features/payments/README.md" << 'EOF'
# Payment Features

Payment processing, gateways, and wallet management.

## Features

- **[Multi-Payment Gateway](./multi-payment-gateway.md)** (FR-05) - Payment method selection
- **[PC Balance Payment](./pc-balance-payment.md)** (FR-06) - Pay with PC account
- **[E-Wallet Payment](./ewallet-payment.md)** (FR-07) - Momo, ZaloPay, VNPay
- **[Bank QR Payment](./bank-qr-payment.md)** (FR-08) - VietQR payments
- **[Transaction Management](./transaction-management.md)** (FR-09) - Transaction tracking
- **[Payment Wallet](./payment-wallet.md)** (FR-10) - Centralized payment management

[← Back to Features](../README.md) | [← Back to Hub](../../README.md)
EOF

# 06-data-model
cat > "$BASE_DIR/06-data-model/README.md" << 'EOF'
# Data Model

Database schemas and entity relationships.

## Documents

- **[Entity Relationship Diagram](./erd.md)** - ERD and relationships
- **[User Schemas](./schemas/users.md)** - User-related tables
- **[Payment Schemas](./schemas/payments.md)** - Payment-related tables
- **[Session Schemas](./schemas/sessions.md)** - Session-related tables
- **[Package Schemas](./schemas/packages.md)** - Package-related tables
- **[Location Schemas](./schemas/locations.md)** - Location-related tables
- **[Migrations](./migrations/)** - Database migration strategy

[← Back to Documentation Hub](../README.md)
EOF

# 07-api
cat > "$BASE_DIR/07-api/README.md" << 'EOF'
# API Documentation

RESTful API endpoints and contracts.

## API Groups

- **[Authentication API](./authentication.md)** - Auth endpoints
- **[Payment API](./payments.md)** - Payment processing
- **[Wallet API](./wallet.md)** - Payment wallet management
- **[Package API](./packages.md)** - Package CRUD
- **[Session API](./sessions.md)** - Session management
- **[Admin API](./admin.md)** - Admin operations
- **[Webhooks](./webhooks.md)** - Webhook endpoints

[← Back to Documentation Hub](../README.md)
EOF

# 08-integrations
cat > "$BASE_DIR/08-integrations/README.md" << 'EOF'
# Integrations

Third-party integrations and external APIs.

## Integrations

- **[PC System API](./pc-system-api.md)** - iCafe PC management system
- **[Google OAuth](./google-oauth.md)** - Google authentication
- **[Momo](./momo.md)** - Momo e-wallet
- **[ZaloPay](./zalopay.md)** - ZaloPay e-wallet
- **[VNPay](./vnpay.md)** - VNPay gateway
- **[VietQR](./vietqr.md)** - VietQR standard
- **[RADIUS](./radius.md)** - FreeRADIUS integration

[← Back to Documentation Hub](../README.md)
EOF

# 09-non-functional
cat > "$BASE_DIR/09-non-functional/README.md" << 'EOF'
# Non-Functional Requirements

Performance, security, and operational requirements.

## Documents

- **[Performance](./performance.md)** - Performance targets and benchmarks
- **[Availability & SLA](./availability.md)** - Uptime and SLA requirements
- **[Security](./security.md)** - Security requirements and controls
- **[Scalability](./scalability.md)** - Scaling strategy and capacity planning
- **[Maintainability](./maintainability.md)** - Code quality and maintenance

[← Back to Documentation Hub](../README.md)
EOF

# 10-roadmap
cat > "$BASE_DIR/10-roadmap/README.md" << 'EOF'
# Product Roadmap

Release planning and feature timeline.

## Phases

- **[MVP - Phase 1](./mvp-phase1.md)** - Initial release (Month 1-2)
- **[Phase 2](./phase2.md)** - Enhanced features (Month 3-4)
- **[Phase 3](./phase3.md)** - Advanced features (Month 5-6)
- **[Backlog](./backlog.md)** - Future ideas and enhancements

[← Back to Documentation Hub](../README.md)
EOF

# 11-ui-ux
cat > "$BASE_DIR/11-ui-ux/README.md" << 'EOF'
# UI/UX Design

User interface and experience design guidelines.

## Documents

- **[Design System](./design-system.md)** - Design tokens, colors, typography
- **[Captive Portal](./captive-portal.md)** - WiFi login interface
- **[Payment Wallet UI](./payment-wallet-ui.md)** - Payment management interface
- **[Admin Dashboard](./admin-dashboard.md)** - Admin interface design

[← Back to Documentation Hub](../README.md)
EOF

# 12-appendix
cat > "$BASE_DIR/12-appendix/README.md" << 'EOF'
# Appendix

Additional resources and references.

## Documents

- **[Glossary](./glossary.md)** - Terms and definitions
- **[References](./references.md)** - External references and standards
- **[Changelog](./changelog.md)** - Documentation change history
- **[Templates](./templates/)** - Document templates

[← Back to Documentation Hub](../README.md)
EOF

echo "✅ All README files created successfully!"

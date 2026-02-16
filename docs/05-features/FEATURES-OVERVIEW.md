# Features Overview

**Product:** IWAS – iCafe WiFi Access Service  
**Last Updated:** February 16, 2026

---

## Overview

This section contains all functional requirements (FRs) for IWAS, organized by domain. Each feature is documented with user stories, acceptance criteria, API contracts, and implementation details.

---

## Feature Domains

### 1. Authentication (4 Features)

**Purpose:** User authentication and authorization

| ID    | Feature                          | Priority      | Status        |
| ----- | -------------------------------- | ------------- | ------------- |
| FR-01 | PC Account Login                 | P0 (Critical) | 📝 Documented |
| FR-02 | QR Code Quick Login              | P2 (Phase 2)  | 📝 Documented |
| FR-03 | Google OAuth Login               | P0 (Critical) | 📝 Documented |
| FR-04 | Role-Based Access Control (RBAC) | P0 (Critical) | 📝 Documented |

**Key Capabilities:**

- Multiple authentication methods
- Seamless cross-location login
- Secure OAuth 2.0 integration
- Flexible permission system

---

### 2. Payments (6 Features)

**Purpose:** Payment processing and wallet management

| ID    | Feature                                 | Priority      | Status        |
| ----- | --------------------------------------- | ------------- | ------------- |
| FR-05 | Multi-Payment Gateway Support           | P0 (Critical) | 📝 Documented |
| FR-06 | PC Balance Payment                      | P0 (Critical) | 📝 Documented |
| FR-07 | E-Wallet Payment (Momo, ZaloPay, VNPay) | P0 (Critical) | 📝 Documented |
| FR-08 | Bank QR Payment (VietQR)                | P0 (Critical) | 📝 Documented |
| FR-09 | Transaction Management                  | P0 (Critical) | 📝 Documented |
| FR-10 | Payment Wallet Management               | P0 (Critical) | 📝 Documented |

**Key Capabilities:**

- Multiple payment methods
- Saved payment methods (wallet)
- One-click purchase
- Secure transaction processing
- Idempotency protection

---

### 3. Packages (2 Features)

**Purpose:** WiFi package management

| ID    | Feature                      | Priority      | Status        |
| ----- | ---------------------------- | ------------- | ------------- |
| FR-11 | Package Management           | P0 (Critical) | 📝 Documented |
| FR-12 | Package Selection & Purchase | P0 (Critical) | 📝 Documented |

**Key Capabilities:**

- Time-based packages
- Location-specific pricing
- Dynamic pricing (future)
- Package bundles (future)

---

### 4. Sessions (4 Features)

**Purpose:** WiFi session lifecycle management

| ID    | Feature                      | Priority      | Status        |
| ----- | ---------------------------- | ------------- | ------------- |
| FR-13 | Device Binding               | P0 (Critical) | 📝 Documented |
| FR-14 | Session Lifecycle Management | P0 (Critical) | 📝 Documented |
| FR-15 | PC Logout Synchronization    | P1 (High)     | 📝 Documented |
| FR-16 | Concurrent Session Limits    | P1 (High)     | 📝 Documented |

**Key Capabilities:**

- MAC address binding
- Automatic session termination
- PC logout sync via webhooks
- Anti-abuse controls

---

### 5. Network (3 Features)

**Purpose:** Network isolation and bandwidth management

| ID    | Feature                          | Priority      | Status        |
| ----- | -------------------------------- | ------------- | ------------- |
| FR-17 | VLAN Isolation                   | P0 (Critical) | 📝 Documented |
| FR-18 | Bandwidth Management & QoS       | P0 (Critical) | 📝 Documented |
| FR-19 | Anti-Abuse & Tethering Detection | P1 (High)     | 📝 Documented |

**Key Capabilities:**

- PC/WiFi traffic isolation
- Per-user bandwidth limits
- QoS policies
- Hotspot/tethering detection

---

### 6. Admin (5 Features)

**Purpose:** Administrative tools and monitoring

| ID    | Feature                  | Priority      | Status        |
| ----- | ------------------------ | ------------- | ------------- |
| FR-20 | Location Management      | P0 (Critical) | 📝 Documented |
| FR-21 | Package Administration   | P0 (Critical) | 📝 Documented |
| FR-22 | Session Monitoring       | P0 (Critical) | 📝 Documented |
| FR-23 | Reports & Analytics      | P1 (High)     | 📝 Documented |
| FR-24 | System Health Monitoring | P1 (High)     | 📝 Documented |

**Key Capabilities:**

- Multi-location management
- Real-time session monitoring
- Revenue analytics
- System health dashboards

---

## Feature Summary

### By Priority

| Priority          | Count | Features                   |
| ----------------- | ----- | -------------------------- |
| **P0 (Critical)** | 20    | Core MVP features          |
| **P1 (High)**     | 4     | Important but not blocking |
| **P2 (Medium)**   | 1     | Phase 2 features           |

### By Status

| Status             | Count | Description                 |
| ------------------ | ----- | --------------------------- |
| 📝 **Documented**  | 25    | Requirements documented     |
| 🚧 **In Progress** | 0     | Currently being implemented |
| ✅ **Complete**    | 0     | Implemented and tested      |

### By Phase

**Phase 1 (MVP) - Month 1-2:**

- All P0 features (20 features)
- Authentication: FR-01, FR-03, FR-04
- Payments: FR-05 through FR-10
- Packages: FR-11, FR-12
- Sessions: FR-13, FR-14
- Network: FR-17, FR-18
- Admin: FR-20, FR-21, FR-22

**Phase 2 - Month 3-4:**

- All P1 features (4 features)
- Authentication: FR-02 (QR Code)
- Sessions: FR-15, FR-16
- Network: FR-19
- Admin: FR-23, FR-24

**Phase 3 - Month 5-6:**

- Advanced features
- Mobile app
- ML fraud detection
- API for third-party integrations

---

## Feature Dependencies

### Critical Path

```
Authentication (FR-01, FR-03, FR-04)
    ↓
Payment Wallet (FR-10)
    ↓
Payment Methods (FR-06, FR-07, FR-08)
    ↓
Packages (FR-11, FR-12)
    ↓
Sessions (FR-13, FR-14)
    ↓
Network (FR-17, FR-18)
```

### Supporting Features

```
Admin Features (FR-20, FR-21, FR-22)
    ↓
Reports & Analytics (FR-23)
    ↓
System Health (FR-24)
```

---

## Implementation Order

### Week 1-2: Foundation

1. FR-04: RBAC
2. FR-01: PC Account Login
3. FR-03: Google OAuth
4. FR-17: VLAN Isolation

### Week 3-4: Payments

5. FR-10: Payment Wallet
6. FR-06: PC Balance Payment
7. FR-07: E-Wallet Payment
8. FR-08: Bank QR Payment
9. FR-09: Transaction Management

### Week 5-6: Core Features

10. FR-11: Package Management
11. FR-12: Package Selection
12. FR-13: Device Binding
13. FR-14: Session Lifecycle
14. FR-18: Bandwidth Management

### Week 7-8: Admin & Polish

15. FR-20: Location Management
16. FR-21: Package Administration
17. FR-22: Session Monitoring
18. Testing & bug fixes
19. Documentation
20. Deployment preparation

---

## Testing Strategy

### Unit Tests

- All business logic functions
- Permission checks (RBAC)
- Payment processing
- Session management

### Integration Tests

- Authentication flows
- Payment gateway integrations
- PC API integration
- RADIUS integration

### E2E Tests

- Complete user journeys
- First-time user flow
- Returning user flow
- Admin workflows

### Performance Tests

- Concurrent users (100+)
- Payment processing throughput
- Session activation time
- Database query performance

---

## Documentation Structure

Each feature is documented with:

1. **Overview**
   - Feature ID
   - Priority
   - User story
   - Business value

2. **Requirements**
   - Acceptance criteria
   - User flows
   - Edge cases

3. **Technical Specification**
   - API contracts
   - Data models
   - Integration points

4. **Implementation**
   - Code examples
   - Configuration
   - Deployment notes

5. **Testing**
   - Test cases
   - Validation criteria
   - Performance benchmarks

6. **Security**
   - Security considerations
   - Compliance requirements
   - Audit requirements

---

## Related Documents

### By Domain

**Authentication:**

- [PC Account Login](./authentication/pc-account-login.md)
- [QR Code Login](./authentication/qr-code-login.md)
- [Google OAuth](./authentication/google-oauth.md)
- [RBAC](./authentication/rbac.md)

**Payments:**

- [Multi-Payment Gateway](./payments/multi-payment-gateway.md)
- [PC Balance Payment](./payments/pc-balance-payment.md)
- [E-Wallet Payment](./payments/ewallet-payment.md)
- [Bank QR Payment](./payments/bank-qr-payment.md)
- [Transaction Management](./payments/transaction-management.md)
- [Payment Wallet](./payments/payment-wallet.md)

**Packages:**

- [Package Management](./packages/package-management.md)
- [Package Selection](./packages/package-selection.md)

**Sessions:**

- [Device Binding](./sessions/device-binding.md)
- [Session Lifecycle](./sessions/session-lifecycle.md)
- [PC Logout Sync](./sessions/pc-logout-sync.md)
- [Concurrent Sessions](./sessions/concurrent-sessions.md)

**Network:**

- [VLAN Isolation](./network/vlan-isolation.md)
- [Bandwidth Management](./network/bandwidth-management.md)
- [Anti-Abuse](./network/anti-abuse.md)

**Admin:**

- [Location Management](./admin/location-management.md)
- [Package Administration](./admin/package-administration.md)
- [Session Monitoring](./admin/session-monitoring.md)
- [Reports & Analytics](./admin/reports-analytics.md)
- [System Health](./admin/system-health.md)

### Cross-References

- [User Personas](../03-users/personas.md)
- [User Journeys](../03-users/user-journeys.md)
- [API Documentation](../07-api/)
- [Data Model](../06-data-model/)
- [Architecture](../04-architecture/)

---

[← Back to Documentation Hub](../README.md)

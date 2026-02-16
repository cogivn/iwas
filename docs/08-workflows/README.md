# Workflows & Sequence Diagrams

**Section:** 08 - Workflows  
**Purpose:** Visual documentation of system workflows and user interactions  
**Last Updated:** February 16, 2026

---

## Overview

This section contains sequence diagrams and workflow documentation for all major user journeys and system processes in IWAS. These diagrams help developers and stakeholders understand:

- **User interactions** - How users interact with the system
- **System flows** - How components communicate
- **Data flow** - How data moves through the system
- **Integration points** - External API calls and dependencies
- **Error handling** - What happens when things go wrong

---

## Workflow Categories

### 1. User Journeys

Core user-facing workflows:

- [Package Purchase Flow](./package-purchase-flow.md) - Complete purchase to activation
- [Authentication Flow](./authentication-flow.md) - Login and session creation
- [Payment Processing](./payment-processing.md) - Payment method handling
- [Session Lifecycle](./session-lifecycle.md) - From activation to expiration

### 2. System Processes

Backend system workflows:

- [RADIUS Integration](./radius-integration.md) - Network authentication
- [Payment Gateway Integration](./payment-gateway-integration.md) - External payment APIs
- [PC System Integration](./pc-system-integration.md) - PC account sync
- [Session Monitoring](./session-monitoring.md) - Real-time monitoring

### 3. Admin Workflows

Administrative processes:

- [Location Setup](./location-setup.md) - New location onboarding
- [Package Management](./package-management-workflow.md) - Package CRUD operations
- [User Management](./user-management.md) - User administration

---

## How to Read Sequence Diagrams

### Notation Guide

```
┌─────────┐     ┌─────────┐     ┌─────────┐
│ Actor A │     │ System B│     │ System C│
└────┬────┘     └────┬────┘     └────┬────┘
     │               │               │
     │──Request──────>│               │
     │               │──API Call────>│
     │               │<──Response────│
     │<──Response────│               │
     │               │               │
```

**Symbols:**

- `──>` Request/Call
- `<──` Response/Return
- `─X─>` Failed request
- `...>` Async/Background process
- `[condition]` Conditional logic
- `loop` Repeated process

---

## Workflow Index

### By Priority

**P0 (Critical) - MVP:**

1. [Package Purchase Flow](./package-purchase-flow.md) ⭐
2. [Authentication Flow](./authentication-flow.md) ⭐
3. [Payment Processing](./payment-processing.md) ⭐
4. [Session Lifecycle](./session-lifecycle.md) ⭐

**P1 (High) - Phase 2:** 5. [PC Logout Sync](./pc-logout-sync.md) 6. [Session Monitoring](./session-monitoring.md)

**P2 (Medium) - Phase 3:** 7. [QR Code Login](./qr-code-login-flow.md) 8. [Dynamic Pricing](./dynamic-pricing.md)

### By Domain

**Authentication:**

- PC Account Login
- Google OAuth Login
- QR Code Login (Phase 2)

**Payments:**

- PC Balance Payment
- E-Wallet Payment
- Bank QR Payment
- Payment Wallet Management

**Sessions:**

- Session Creation
- Session Activation
- Session Expiration
- Session Termination

**Network:**

- RADIUS Authentication
- Bandwidth Management
- VLAN Isolation

---

## Quick Reference

### Critical Timings

| Workflow           | Target Time | Max Acceptable |
| ------------------ | ----------- | -------------- |
| Package Purchase   | 1 second    | 2 seconds      |
| Authentication     | 500ms       | 1 second       |
| Payment Processing | 300ms       | 1 second       |
| RADIUS Activation  | 200ms       | 500ms          |
| Session Expiration | Immediate   | 5 seconds      |

### Integration Points

| System            | Protocol     | Timeout | Retry |
| ----------------- | ------------ | ------- | ----- |
| PC System API     | REST/HTTP    | 5s      | 3x    |
| RADIUS Server     | RADIUS/UDP   | 2s      | 2x    |
| Payment Gateways  | REST/HTTP    | 10s     | 1x    |
| MikroTik RouterOS | RouterOS API | 3s      | 2x    |

---

## Related Documents

- [Features Overview](../05-features/FEATURES-OVERVIEW.md)
- [User Journeys](../03-users/user-journeys.md)
- [Architecture](../04-architecture/)
- [API Documentation](../07-api/)

---

[← Back to Documentation Hub](../README.md)

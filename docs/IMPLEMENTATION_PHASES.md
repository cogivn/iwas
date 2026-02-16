# IWAS Detailed Implementation Phases

This document provides a granular, step-by-step plan for developing the IWAS platform. Development will proceed in sequential phases, with each task being completed and verified before moving to the next.

---

## 🏗 Phase 1: Foundation & Core Models

**Objective**: Establish the basic data structure and administrative interface.

### 1.1 Basic Collection Setup

- [ ] Define **Locations** collection:
  - Fields: `name`, `slug`, `isActive`, `address`.
  - Group: `networkConfig` (`wireguardIp`, `radiusSecret`, `nasId`).
- [ ] Define **Packages** collection:
  - Fields: `name`, `price` (VND), `duration` (minutes), `description`, `isPublic`.
  - Group: `bandwidth` (`downloadLimit`, `uploadLimit`).
  - Relation: `locations` (Multi-select).

### 1.2 User Model Extension

- [ ] Update **Users** collection:
  - Add `role`: ('super-admin', 'branch-manager', 'customer').
  - Add `totalSpent`: number.
  - Add `googleId`: string (for OAuth).
  - Add `avatarURL`: string.

### 1.3 Validation & Types

- [ ] Run `payload generate:types`.
- [ ] Verify Admin UI reflects new collections and fields.

---

## 🔐 Phase 2: Authentication & Security (Guest Flow)

**Objective**: Implement secure guest login via Google OAuth and establish RBAC.

### 2.1 Google OAuth Integration

- [ ] Configure `PAYLOAD_PUBLIC_GOOGLE_CLIENT_ID` and secrets.
- [ ] Implement custom login button/endpoint for Google Auth.
- [ ] Create `afterLogin` hook to handle first-time guest registration.

### 2.2 Role-Based Access Control (RBAC)

- [ ] Implement `isAdmin` and `isBranchManager` utilities.
- [ ] Restrict `Locations` and `Packages` editing to Super Admins.
- [ ] Implement "Location Isolation": Branch Managers only see data relevant to their assigned location.

---

## 💳 Phase 3: Payment Infrastructure (VietQR)

**Objective**: Build the framework for processing payments without 3rd party account balance.

### 3.1 Payment Collection

- [ ] Define **Payments** collection:
  - Fields: `amount`, `status` ('pending', 'completed', 'failed'), `provider` ('vietqr', 'manual'), `externalId`.
  - Relations: `user`, `package`, `location`.
- [ ] Implement `beforeChange` hook to ensure amount matches package price.

### 3.2 VietQR Service Implementation

- [ ] Create utility to generate VietQR dynamic QR codes (using Napas247 standard).
- [ ] Create a "Payment Status" endpoint to allow client polling.

---

## ⏱ Phase 4: Session & RADIUS Logic

**Objective**: Bridge the gap between payment and network access.

### 4.1 Session Collection

- [ ] Define **Sessions** collection:
  - Fields: `macAddress`, `status` ('active', 'expired'), `startTime`, `endTime`, `dataUsed`.
  - Relations: `user`, `package`, `location`, `payment`.

### 4.2 Lifecycle Management

- [ ] Implement background job (or serverless cron) to mark sessions as 'expired' when time is up.
- [ ] Create internal API for FreeRADIUS `Access-Request` validation.

---

## 🌐 Phase 5: Client Portal (Landing & Experience)

**Objective**: Deliver a premium, mobile-first captive portal.

### 5.1 Landing Page

- [ ] Auto-detect `location_id` from URL parameters (e.g., `?base_url=...&nas_id=...`).
- [ ] Premium design: Glassmorphism, smooth transitions, and brand consistency.

### 5.2 Purchase Workflow

- [ ] Implementation of the Package Selection screen.
- [ ] Real-time QR display and payment success animation.

---

## 📊 Phase 6: Admin Analytics & Operations

**Objective**: Provide visibility and control to iCafe owners.

### 6.1 Dashboard Components

- [ ] "Active Users" real-time counter.
- [ ] "Revenue Overview" chart (Daily/Weekly).

### 6.2 Operational Tools

- [ ] "Manual Session Activation" for admins.
- [ ] "Force Disconnect" (CoA trigger) implementation.

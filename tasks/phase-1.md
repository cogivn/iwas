# Phase 1: Foundation & Core MVP

## 🏗 Phase 1A: Foundation (Data Models)

_Goal: Definining the core schema for the entire system._

- [x] **Task 1.1: Refine `Users` Collection**
  - [x] Add `role` field (enum: `admin`, `manager`, `customer`).
  - [x] Add `totalSpent` (number, default: 0).
  - [x] Add `currentSession` (relationship to `sessions`).
  - [x] Add `googleId` (text, unique).
  - [x] Add `location` (relationship to `locations` for managers).
- [x] **Task 1.2: Refine `Locations` Collection**
  - [x] Verify `networkConfig` fields (WireGuard IP, Secret).
  - [x] Add `branding` group (Logo, Primary Color) for white-labeling.
- [x] **Task 1.3: Refine `Packages` Collection**
  - [x] Verify price, duration, and bandwidth limits.
  - [x] Ensure `locations` relationship is working correctly.
- [x] **Task 1.4: Create `Payments` Collection**
  - [x] Fields: `amount`, `status` (`pending`, `completed`, `failed`), `provider` (`vietqr`, `momo`, etc.), `user`, `location`, `externalId`.
  - [ ] Add `beforeChange` hook to handle status updates (Pending Implement).
- [x] **Task 1.5: Create `Sessions` Collection**
  - [x] Fields: `macAddress`, `package`, `expiry`, `status` (`active`, `expired`, `terminated`), `user`, `location`.
  - [x] Add `index` on `macAddress` and `status`.

## 🔐 Phase 1B: Authentication & Access Control

_Goal: Implementing secure access for all users._

- [x] **Task 2.1: Implement RBAC**
  - [x] Create `src/access` utility folder.
  - [x] Implement `isAdmin`, `isManager`, `isCustomer` access functions.
  - [x] Apply location isolation for Managers.
- [ ] **Task 2.2: Google OAuth Integration**
  - [ ] Configure Payload Auth for Google.
  - [ ] Implement guest user creation hook if no account exists.

## ⚙️ Phase 1C: Business Logic & Hooks

_Goal: Automating workflows and data integrity._

- [x] **Task 3.1: Session Management Hooks**
  - [x] Implement `afterChange` on `Payments` to trigger `Session` creation.
  - [x] Create utility for calculating session expiry based on `Package` duration.
- [x] **Task 3.2: VietQR Utility**
  - [x] Implement VietQR payload generator (QuickLink or specific library).

## 📱 Phase 1D: Client Portal (UI Foundations)

_Goal: The mobile-first entry point for guests._

- [x] **Task 4.1: UI Components**
  - [x] Implement Design System tokens in `index.css`.
  - [x] Create reusable components: Button, Card, PlanSelector.
- [x] **Task 4.2: Landing Page & Location Detection**
  - [x] Implement location lookup via slug (URL param).
  - [x] Design high-impact hero for the captive portal.

## 📡 Phase 1E: RADIUS Bridge (API)

_Goal: Connecting the Brain to the Enforcer._

- [x] **Task 5.1: RADIUS Auth Endpoint**
  - [x] `GET /api/radius/check?mac=...` (Internal API for FreeRADIUS).
- [x] **Task 5.2: CoA (Change of Authorization) Utility**
  - [x] Implement UDP packet sender for disconnecting users.

---

## ✅ Completed Tasks

- [x] Initial documentation analysis.
- [x] Task breakdown and phase planning.

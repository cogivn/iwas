# IWAS Phase 1 Implementation Plan

This document outlines the coding steps for the initial development phase of the IWAS (iCafe WiFi Access Service) system, focusing on the core MVP: Google OAuth, VietQR payments, and Session management with SQLite.

## 🛠 Tech Stack Recap

- **Framework**: Payload CMS 3.0 (Next.js 15)
- **Database**: SQLite (via `@payloadcms/db-sqlite`)
- **Language**: TypeScript
- **Auth**: Built-in Payload Auth + Google OAuth
- **CSS**: Vanilla CSS / Tailwind (Targeting premium feel)

---

## 📅 Roadmap & Tasks

### Milestone 1: Core Data Models (Foundation)

**Goal**: Define the schema for all business entities.

- [ ] **Locations Collection**: Store branch information (Name, Slug, WireGuard IP, Secret key).
- [ ] **Packages Collection**: Define WiFi plans (Price, Duration, Speed Limit, Data Cap, Location relation).
- [ ] **Payments Collection**: Record all transactions (Amount, Status, Provider: VietQR/E-wallet, User relation).
- [ ] **Sessions Collection**: Track active WiFi sessions (MAC Address, Package Link, Expiry, Status).
- [ ] **Users Enhancement**: Add fields for `total_spent`, `current_session`, and `google_id`.

### Milestone 2: Authentication & RBAC

**Goal**: Secure the system and implement guest access.

- [ ] **Google OAuth Setup**: Configure the auth provider in Payload.
- [ ] **Global Hooks**: Implement `beforeLogin` and `afterLogin` to handle guest user creation.
- [ ] **Access Control**: Define roles (SuperAdmin, LocationManager, Customer) and apply to collections.
- [ ] **Location Isolation**: Ensure Location Managers only see their own branch's data.

### Milestone 3: The Captive Portal (Client UI)

**Goal**: Develop the user-facing web interface.

- [ ] **Landing Page**: Design a premium mobile-first landing page with location auto-detection.
- [ ] **Package Selection**: Dynamic list of packages based on the current location.
- [ ] **Payment Integration (VietQR)**:
  - Generate VietQR dynamic codes for specific amounts and descriptions.
  - Implement a "Waiting for payment" UI with real-time status updates (polling or websocket).
- [ ] **Session Activation**: Call internal API to create a `Session` record and prepare RADIUS data.

### Milestone 4: RADIUS Bridge & Networking

**Goal**: Connect the "Brain" to the "Enforcer".

- [ ] **REST API for RADIUS**:
  - `POST /api/radius/auth`: Verify if a MAC address has an active session.
  - `POST /api/radius/acct`: Update session usage data (bytes in/out).
- [ ] **CoA Service**: A utility function to send UDP packets to FreeRADIUS to disconnect users when their session expires or is manually terminated.

### Milestone 5: Admin Dashboard Customization

**Goal**: Make the system manageable for iCafe owners.

- [ ] **Live Monitoring View**: Custom Payload view or component to see current active sessions at a glance.
- [ ] **Revenue Reports**: Simple dashboard showing daily/weekly revenue by location.

---

## 🏗 Initial Coding Steps (Starting Now)

1. **Step 1**: Initialize the `Locations` and `Packages` collections to allow data entry in the Admin panel.
2. **Step 2**: Implement the `Payments` and `Sessions` collections with initial hooks for status management.
3. **Step 3**: Build the basic API endpoint for Location lookup.

---

## 📝 Guidelines

- Use **PascalCase** for collections and **camelCase** for fields/functions.
- Prefer **Functional hooks** and reusable field groups.
- Ensure all sensitive configurations are in `.env`.
- Maintain technical documentation in `/docs` as code evolves.

# Technology Stack

**Section ID:** 04-01  
**Status:** ✅ Finalized  
**Last Updated:** February 16, 2026

---

## 🏗️ Core Infrastructure (The Foundation)

We utilize a modern, containerized architecture to ensure scalability, security, and ease of deployment.

### 1. Delivery & Environment

- **Containerization:** **Docker & Docker Compose**. Every component (App, RADIUS, DB) runs as an isolated service.
- **Operating System:** Ubuntu 22.04+ (LTS) or any Linux distribution supporting Docker.
- **CI/CD:** GitHub Actions (recommended) for automated builds and deployment to Docker Hub.

---

## 🧠 The "Brain": Payload CMS (v3.0)

Payload CMS acts as the central intelligence of IWAS, handling business logic, administrative UI, and data persistence.

- **Framework:** **Next.js 15 (App Router)**.
- **Language:** **TypeScript**.
- **Database:** **SQLite** (Current Stage). Easy for local development and initial deployment.
- **Plugins:**
  - **@payloadcms/plugin-multi-tenant**: Powers the enterprise tenancy model, ensuring strict data isolation and domain-based routing.
  - **payload-auth (Better Auth)**: Provides unified authentication for Google OAuth and session management.
- **Core Responsibilities:**
  - Multi-tenant Access Control (RBAC).
  - Package & Pricing Management.
  - Transaction & Wallet Logging.
  - White-label UI Customization (Dynamic Branding).
  - API Endpoints for Payment Webhooks & PC Sync.

---

## 📡 The "Enforcer": FreeRADIUS (v3.x)

A dedicated RADIUS service handles the low-level networking protocols and enforces the rules dictated by the Brain.

- **Service:** **FreeRADIUS 3.0**.
- **Integration:** **MongoDB Driver** for direct data access or **RLM_REST** for API-driven authorization.
- **Core Responsibilities:**
  - `Access-Request`: Authenticating users at the WiFi gate.
  - `Accounting`: Tracking bandwidth and time usage.
  - `CoA (Change of Authorization)`: Facilitating "Force Disconnect" requests from the Admin Panel.

---

## 🛡️ Networking & Connectivity

- **VPN Tunneling:** **WireGuard**.
  - Creates a secure virtual LAN (vLAN) across the internet.
  - Encapsulates RADIUS UDP traffic.
  - Allows the Cloud Server to reach local MikroTik routers behind NAT/CGNAT.

---

## 💻 Frontend (Client & Admin)

- **Admin Dashboard:** Built-in **Payload Admin UI** (React-based).
- **Captive Portal:** **Next.js Server Components**.
  - Optimized for mobile performance.
  - Dynamic styling based on the branch's branding configuration.

---

## 📁 Summary Matrix

| Component       | Technology                | Role                      |
| --------------- | ------------------------- | ------------------------- |
| **Core App**    | Payload CMS v3            | Business Logic & Admin UI |
| **Tenancy**     | **Payload Multi-Tenant**  | Enterprise Data Isolation |
| **Auth**        | **Payload Auth (Better)** | Unified Identity & OAuth  |
| **Auth Engine** | FreeRADIUS                | Hardware Communication    |
| **Database**    | **SQLite**                | Data Persistence          |
| **Network**     | WireGuard                 | Secure Tunneling          |
| **Deployment**  | Docker                    | Infrastructure Delivery   |
| **Language**    | TypeScript                | Type Integrity            |

---

[← Back to Architecture](./README.md)

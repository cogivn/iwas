# IWAS – iCafe WiFi Access Service

IWAS is a specialized solution designed to provide seamless WiFi access for iCafe users. It allows users to purchase dedicated WiFi packages via various payment gateways and access high-speed internet on their personal devices.

## 🚀 Overview

The system provides a cloud-based authentication and payment solution for iCafes:

- **Easy Authentication**: Login via Google OAuth for quick access.
- **Multi-tenant Management**: Manage multiple physical locations from a single dashboard.
- **Flexible Payments**: Support for Momo, ZaloPay, VNPay, and VietQR.
- **Session Control**: Real-time monitoring and bandwidth enforcement via FreeRADIUS.
- **iCafe Integration (Future)**: Planned integration with existing PC account systems.

## 🏗️ Technology Stack

- **Backend/Admin**: [Payload CMS v3](https://payloadcms.com/) (Next.js 15, TypeScript)
- **Authentication**: [FreeRADIUS 3.x](https://freeradius.org/)
- **Database**: **SQLite** (Current Stage)
- **Networking**: [WireGuard](https://www.wireguard.com/) for secure tunneling to local sites.
- **Infrastructure**: Docker & Docker Compose.

## 📂 Project Structure

- `src/`: Core Payload CMS application logic.
  - `collections/`: Database schemas (Users, Payments, Sessions, etc.).
  - `fields/`: Reusable field definitions.
  - `hooks/`: Business logic triggers.
- `docs/`: Comprehensive technical and product documentation.
- `skills/`: Custom agent skills for development assistance.
- `.agents/`: Internal agent configurations and reference materials.

## 📚 Documentation

Detailed documentation is available in the [docs/](./docs/) directory:

- [**Documentation Hub**](./docs/README.md) - Start here for a complete overview.
- [Executive Summary](./docs/01-overview/executive-summary.md)
- [System Architecture](./docs/04-architecture/system-architecture.md)
- [Feature Specifications](./docs/05-features/)
- [API Contracts](./docs/07-api/)
- [Integration Guides](./docs/08-integrations/)

## 🛠️ Development

### Prerequisites

- Node.js 18+ or 20+
- pnpm 9+
- Docker & Docker Compose (for MongoDB and local testing)

### Local Setup

1. **Clone the repository**
2. **Install dependencies**:
   ```bash
   pnpm install
   ```
3. **Configure Environment**:
   ```bash
   cp .env.example .env
   # Update MONGODB_URL and other secrets
   ```
4. **Start Development Server**:
   ```bash
   pnpm dev
   ```
5. **Admin Access**: Open `http://localhost:3000/admin` to create your first admin user.

## 🧪 Testing

- **Unit/Integration**: `pnpm run test:int` (Vitest)
- **E2E**: `pnpm run test:e2e` (Playwright)

## 🤝 Contributing

Please refer to the [Documentation Guide](./docs/DOCUMENTATION-GUIDE.md) for standards and workflows.

---

© 2026 IWAS Team. All rights reserved.

# iwas

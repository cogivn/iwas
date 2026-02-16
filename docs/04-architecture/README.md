# Section 04: Architecture

This section describes the technical foundation, system structure, and deployment strategies for the IWAS platform.

## 📑 Documents

1.  **[Tech Stack](./tech-stack.md)**: Finalized technology choices (Payload CMS, FreeRADIUS, Docker).
2.  **[System Architecture](./system-architecture.md)**: High-level overview of component interactions and data flow.
3.  **[Network Topology](./network-topology.md)**: Details on WireGuard VPN and secure router communication.
4.  **[Router Management](./router-management.md)**: Mechanisms for remote control and provisioning.
5.  **[Multi-Tenancy](./multi-tenancy.md)**: Scalable architecture for Enterprise white-labeling.
6.  **[Deployment Guide](./deployment-guide.md)**: Instructions for Dockerized deployment and scaling.
7.  **[RBAC Implementation](./rbac-implementation.md)**: Technical logic for scoping access control.

---

## 🏗️ Architecture Philosophy

IWAS is built on a **Brain & Muscle** architecture:

- **The Brain (Payload CMS):** Processes business rules and manages data.
- **The Muscle (FreeRADIUS):** Enforces network policies and talks to hardware.

This separation ensures the system remains stable even under high network load and allows for independent scaling of each component.

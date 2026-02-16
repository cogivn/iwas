# Section 09: Integrations

This section deals with the external systems and hardware that IWAS interacts with to provide a seamless WiFi/Gaming experience.

## 📑 Documents

1.  **[MikroTik RouterOS](./mikrotik-routeros.md)**: Hardware communication and scripting.
2.  **[FreeRADIUS Server](./radius-server.md)**: Network authentication and accounting.
3.  **[WireGuard Service](./wireguard-service.md)**: Secure VPN tunneling across branches.
4.  **[Payment Gateways](./payment-gateways.md)**: MoMo, VNPay, and VietQR implementation.
5.  **[PC System API](./pc-system-api.md)**: iCafe management software synchronization (Sync/Logout).

---

## 🏗️ Architecture Role

Integrations are the "connectors" of the platform. While the Core (Payload CMS) handles the logic, the Integrations handle the real-world execution.

- **Finance:** Handled by [Payment Gateways](./payment-gateways.md).
- **Physical Control:** Handled by [MikroTik](./mikrotik-routeros.md) via [RADIUS](./radius-server.md).
- **Security:** Handled by [WireGuard](./wireguard-service.md).

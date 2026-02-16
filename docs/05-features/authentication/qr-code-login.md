# QR Code Quick Login

**Feature ID:** FR-02  
**Priority:** P1 (High)  
**Status:** ✅ Detailed  
**Last Updated:** February 16, 2026

---

## ⚡ Overview

**User Story:** As a customer, I want to scan a QR code at my table to instantly access the login portal without typing any URLs, so that I can buy internet access quickly.

**Seamless Experience:** The QR code contains a dynamic payload that tells the system exactly which branch the user is at, allowing us to show the correct branding (Logo, Colors) immediately.

---

## 🛠️ How it Works

1. **Generation:** Admins generate a unique QR code for each **Location** from the Dashboard.
2. **Payload:** The URL is structured as `https://wifi.icafe.com/portal?loc={LocationID}`.
3. **Detection:** When scanned:
   - The Frontend detects the `LocationID`.
   - It fetches the **Enterprise Branding** (Organization) associated with that location.
   - The User sees: "Welcome to [Brand Name] - [Branch Name]".
4. **Auto-Fill:** If the user has a saved cookie/wallet, the system shows a **"One-Click Reconnect"** button.

---

## 🎨 UI Mockup (Seamless Flow)

```
┌──────────────────────────────────────────┐
│             [ BRIGHT LOGO ]              │
│         Welcome to Kingdom Gaming        │
│                District 7                │
├──────────────────────────────────────────┤
│                                          │
│   [ ⚡ Quick Connect (Last Used) ]       │
│      Gói 3 Tiếng - Còn 45,000đ           │
│                                          │
│   ----------  OR  ----------             │
│                                          │
│   [ G ] Login with Google                │
│   [ 🖥️ ] Login with PC Account           │
│                                          │
└──────────────────────────────────────────┘
```

---

## 📝 Technical Specification

### Dynamic QR Generation

- **Format:** SVG/PNG for printing.
- **Security:** The `loc` parameter is a short, non-sequential hash to prevent malicious users from "guessing" other branch IDs.

### URL Mapping

The system uses a middleware to handle different domains:

- If domain is `wifi.kingdom.com` -> Fetch Kingdom Logo.
- If domain is `mang.netcopro.vn` -> Fetch Net Cỏ Pro Logo.

---

## 📁 Related Documents

- [Location Management](../admin/location-management.md)
- [Multi-Tenancy Architecture](../../04-architecture/multi-tenancy.md)
- [Session Lifecycle](../sessions/session-lifecycle.md)

---

[← Back to Features](../README.md)

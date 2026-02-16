# UI/UX & Design Philosophy

**Section ID:** 12-01  
**Status:** ✅ Detailed  
**Last Updated:** February 16, 2026

---

## 🎨 Design System

IWAS uses a **Dynamic Design System** that adapts to each Tenant's brand identity.

### 1. The "Default Premium" Theme

- **Background:** Dark Mode (Glassmorphism).
- **Primary Color:** Neon Green/Cyan (Representing high speed).
- **Typography:** **Inter / Outfit** (Clean, modern sans-serif).
- **Animations:** Subtle transitions for button clicks and QR code generation (~200ms).

### 2. Branding Overrides (Tenant Config)

- **Logos:** Dynamically pulled from Payload CMS `organizations` collection.
- **Colors:** Primary and Secondary buttons adjust based on Tenant's `primaryColor` field.

---

## 📱 Captive Portal Flow

1.  **Welcome Screen:** Logo + Branch Name + "Connect Now" button.
2.  **Package Selection:** Clear pricing cards (Time, Speed, Price).
3.  **Payment Selection:** MoMo, VNPay, or PC Balance.
4.  **Transaction Status:** Progress bar (Payment -> Activating -> Success).
5.  **Success Page:** Dashboard showing "Time Remaining" and "Data Used".

---

## 🖥️ Management Dashboard (Payload Admin)

The Admin UI focuses on **Data Visibility** and **Rapid Action**:

- **Heatmap:** Which branches are busiest?
- **Active Sessions:** Real-time list with "Kill Session" button.
- **Financials:** Chart showing revenue per branch/per day.

---

[← Back to Documentation Hub](../README.md)

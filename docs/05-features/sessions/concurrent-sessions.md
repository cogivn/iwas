# Concurrent Session Limits

**Feature ID:** FR-16  
**Priority:** P1 (High)  
**Status:** ✅ Detailed  
**Last Updated:** February 16, 2026

---

## 🛡️ Overview

**User Story:** As an owner, I want to limit the number of devices that can use a single WiFi package simultaneously, to prevent users from sharing one account with multiple friends.

**Business Value:** Protects revenue and prevents network congestion from excessive "ghost" devices.

---

## ⚙️ Configuration Levels

Admins can set limits at the **Package Level**:

- **Package A (Basic):** 1 Device only.
- **Package B (Premium):** 2 Devices.
- **Package C (Family/Group):** 5 Devices.

---

## 🧠 Enforcement Logic

When a user tries to log in on a new device while having active sessions:

1. **Check:** Backend queries MongoDB/Redis for active sessions with `user_id`.
2. **Compare:** Count active devices vs. `device_limit` of the current package.
3. **Action:**
   - **If under limit:** Allow login, create new session.
   - **If at limit:** Prompt user:
     > ⚠️ **Device Limit Reached:** You are already using 2 devices. To connect this one, please disconnect one of your other devices.
4. **Self-Service Kick:** User is shown a list of their active devices with a **[Disconnect]** button to free up a slot.

---

## 📁 Related Documents

- [Session Lifecycle Management](./session-lifecycle.md)
- [Device Binding](./device-binding.md)
- [Package Management](../packages/package-management.md)

---

[← Back to Features](../README.md)

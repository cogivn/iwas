# Device Binding (MAC Address)

**Feature ID:** FR-13  
**Priority:** P0 (Critical)  
**Status:** 📝 Documented  
**Last Updated:** February 16, 2026

---

## Overview

**User Story:** As a system, I need to bind WiFi sessions to specific devices (MAC addresses) to prevent package sharing and enforce device limits.

**Business Value:**

- **Prevent abuse** - Stop users from sharing packages
- **Enforce limits** - Single vs multi-device packages
- **Revenue protection** - Each device = separate purchase
- **Fair usage** - Prevent one user hogging bandwidth

---

## How It Works

```
┌─────────────────────────────────────────────────────────────┐
│                    DEVICE BINDING FLOW                       │
└─────────────────────────────────────────────────────────────┘

User connects to WiFi
    ↓
MikroTik captures MAC address
    ↓
RADIUS Access-Request with MAC
    ↓
Backend checks:
  - Is this MAC already bound?
  - Package allows multiple devices?
    ↓
┌───────────────┴───────────────┐
│                               │
Single Device                Multi-Device
Package                      Package
│                               │
▼                               ▼
Terminate old session      Check device count
Bind new MAC               ├─ < Limit: Allow
                          └─ >= Limit: Reject
```

---

## Data Model

```typescript
interface Device {
  id: string;

  // Device Info
  mac_address: string; // Unique identifier
  device_name?: string; // e.g., "iPhone 13"
  device_type?: "mobile" | "laptop" | "tablet" | "other";

  // User Association
  user_id: string;
  session_id: string; // Current active session

  // Tracking
  first_seen: Date;
  last_seen: Date;
  total_sessions: number;

  // Status
  is_active: boolean;
  is_blocked: boolean; // Admin can block devices

  // Metadata
  user_agent?: string;
  ip_address?: string;
  location_id: string;

  created_at: Date;
  updated_at: Date;
}

interface Session {
  id: string;
  user_id: string;
  package_id: string;

  // Device Binding
  devices: DeviceBinding[];
  max_devices: number; // From package

  // ... other fields
}

interface DeviceBinding {
  device_id: string;
  mac_address: string;
  bound_at: Date;
  ip_address: string;
  status: "ACTIVE" | "DISCONNECTED";
}
```

---

## Single-Device Package

### Flow

```typescript
async function handleSingleDevicePackage(
  session: Session,
  newMacAddress: string,
): Promise<AuthResponse> {
  // Check if MAC already bound to this session
  const existingBinding = session.devices.find(
    (d) => d.mac_address === newMacAddress,
  );

  if (existingBinding) {
    // Same device reconnecting - allow
    return {
      success: true,
      message: "Welcome back!",
    };
  }

  // Different device - terminate old session
  if (session.devices.length > 0) {
    const oldDevice = session.devices[0];

    // Send disconnect to old device
    await radiusService.disconnect({
      mac_address: oldDevice.mac_address,
      reason: "New device detected",
    });

    // Show warning to user
    await notificationService.send({
      user_id: session.user_id,
      type: "DEVICE_SWITCHED",
      message: "New device detected. Previous session has been disconnected.",
    });
  }

  // Bind new device
  await sessionService.bindDevice(session.id, {
    mac_address: newMacAddress,
    bound_at: new Date(),
    status: "ACTIVE",
  });

  return {
    success: true,
    message: "Device bound successfully",
  };
}
```

### UI Warning

```
┌─────────────────────────────────────────────────────────┐
│ ⚠️  New Device Detected                                 │
├─────────────────────────────────────────────────────────┤
│                                                         │
│ You're connecting from a different device.              │
│                                                         │
│ Previous device: iPhone 13 (****ab:cd)                  │
│ New device: MacBook Pro (****12:34)                     │
│                                                         │
│ Your previous session will be disconnected.             │
│                                                         │
│ [Cancel]  [Continue]                                    │
└─────────────────────────────────────────────────────────┘
```

---

## Multi-Device Package

### Flow

```typescript
async function handleMultiDevicePackage(
  session: Session,
  newMacAddress: string,
): Promise<AuthResponse> {
  // Check if MAC already bound
  const existingBinding = session.devices.find(
    (d) => d.mac_address === newMacAddress && d.status === "ACTIVE",
  );

  if (existingBinding) {
    // Same device reconnecting
    return {
      success: true,
      message: "Welcome back!",
    };
  }

  // Count active devices
  const activeDevices = session.devices.filter((d) => d.status === "ACTIVE");

  if (activeDevices.length >= session.max_devices) {
    // Limit reached
    return {
      success: false,
      error_code: "MAX_DEVICES_REACHED",
      message: `Maximum ${session.max_devices} devices allowed. Please disconnect a device first.`,
      active_devices: activeDevices.map((d) => ({
        mac: d.mac_address.slice(-8),
        connected_at: d.bound_at,
      })),
    };
  }

  // Bind new device
  await sessionService.bindDevice(session.id, {
    mac_address: newMacAddress,
    bound_at: new Date(),
    status: "ACTIVE",
  });

  return {
    success: true,
    message: `Device ${activeDevices.length + 1}/${session.max_devices} connected`,
  };
}
```

### UI - Device Management

```
┌─────────────────────────────────────────────────────────┐
│ Connected Devices (2/3)                                 │
├─────────────────────────────────────────────────────────┤
│                                                         │
│ ┌─────────────────────────────────────────────────┐   │
│ │ 📱 iPhone 13                                    │   │
│ │ MAC: ****ab:cd                                  │   │
│ │ Connected: 15 minutes ago                       │   │
│ │ [Disconnect]                                    │   │
│ └─────────────────────────────────────────────────┘   │
│                                                         │
│ ┌─────────────────────────────────────────────────┐   │
│ │ 💻 MacBook Pro                                  │   │
│ │ MAC: ****12:34                                  │   │
│ │ Connected: 5 minutes ago                        │   │
│ │ [Disconnect]                                    │   │
│ └─────────────────────────────────────────────────┘   │
│                                                         │
│ You can connect 1 more device                          │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## RADIUS Integration

### Access-Request with MAC

```
# MikroTik sends
Access-Request
  User-Name = "user@iwas.com"
  Calling-Station-Id = "AA:BB:CC:DD:EE:FF" # MAC address
  NAS-IP-Address = "192.168.1.1"
  NAS-Port = 1
```

### Backend Processing

```typescript
@Controller("radius")
export class RadiusController {
  @Post("authorize")
  async authorize(@Body() request: RadiusAccessRequest) {
    const { username, mac_address } = request;

    // Find active session
    const session = await sessionService.findActiveByUser(username);

    if (!session) {
      return {
        success: false,
        reply_message: "No active session. Please purchase a package.",
      };
    }

    // Check device binding
    const package = await packageService.findById(session.package_id);

    let authResult;
    if (package.max_devices === 1) {
      authResult = await this.handleSingleDevicePackage(session, mac_address);
    } else {
      authResult = await this.handleMultiDevicePackage(session, mac_address);
    }

    if (!authResult.success) {
      return {
        success: false,
        reply_message: authResult.message,
      };
    }

    // Return RADIUS attributes
    return {
      success: true,
      attributes: {
        "Session-Timeout": session.remaining_seconds,
        "Mikrotik-Rate-Limit": package.bandwidth_limit,
        "Simultaneous-Use": package.max_devices,
      },
    };
  }
}
```

---

## API Contracts

### Get Connected Devices

```typescript
GET /api/sessions/{session_id}/devices
Authorization: Bearer {session_token}

// Response
{
  "success": true,
  "session_id": "sess_abc123",
  "max_devices": 3,
  "devices": [
    {
      "id": "dev_123",
      "mac_address": "AA:BB:CC:DD:EE:FF",
      "mac_display": "****EE:FF",
      "device_name": "iPhone 13",
      "device_type": "mobile",
      "bound_at": "2026-02-16T17:00:00Z",
      "status": "ACTIVE",
      "ip_address": "192.168.20.45"
    },
    {
      "id": "dev_456",
      "mac_address": "11:22:33:44:55:66",
      "mac_display": "****55:66",
      "device_name": "MacBook Pro",
      "device_type": "laptop",
      "bound_at": "2026-02-16T17:05:00Z",
      "status": "ACTIVE",
      "ip_address": "192.168.20.46"
    }
  ]
}
```

### Disconnect Device

```typescript
POST /api/sessions/{session_id}/devices/{device_id}/disconnect
Authorization: Bearer {session_token}

// Response
{
  "success": true,
  "message": "Device disconnected successfully"
}
```

---

## Security

### MAC Spoofing Prevention

```typescript
class MACSecurityService {
  async validateMAC(mac: string, session: Session): Promise<boolean> {
    // 1. Check MAC format
    if (!this.isValidMACFormat(mac)) {
      return false;
    }

    // 2. Check if MAC is blacklisted
    const isBlacklisted = await this.isBlacklisted(mac);
    if (isBlacklisted) {
      await this.alertService.warning({
        title: "Blacklisted MAC Detected",
        mac: mac,
        session_id: session.id,
      });
      return false;
    }

    // 3. Check rapid MAC changes (spoofing indicator)
    const recentChanges = await this.getRecentMACChanges(session.id);
    if (recentChanges.length > 3) {
      await this.alertService.warning({
        title: "Possible MAC Spoofing",
        session_id: session.id,
        changes: recentChanges,
      });
      // Still allow but flag for review
    }

    return true;
  }

  private isValidMACFormat(mac: string): boolean {
    return /^([0-9A-F]{2}:){5}[0-9A-F]{2}$/i.test(mac);
  }
}
```

---

## Testing

```typescript
describe("Device Binding", () => {
  describe("Single Device Package", () => {
    it("should allow same device to reconnect", async () => {
      const session = await createSession({ max_devices: 1 });
      const mac = "AA:BB:CC:DD:EE:FF";

      // First connection
      await deviceService.bind(session.id, mac);

      // Reconnect
      const result = await deviceService.bind(session.id, mac);
      expect(result.success).toBe(true);
    });

    it("should disconnect old device when new device connects", async () => {
      const session = await createSession({ max_devices: 1 });
      const oldMAC = "AA:BB:CC:DD:EE:FF";
      const newMAC = "11:22:33:44:55:66";

      // Bind old device
      await deviceService.bind(session.id, oldMAC);

      // Bind new device
      await deviceService.bind(session.id, newMAC);

      // Old device should be disconnected
      const devices = await deviceService.getActive(session.id);
      expect(devices.length).toBe(1);
      expect(devices[0].mac_address).toBe(newMAC);
    });
  });

  describe("Multi Device Package", () => {
    it("should allow up to max devices", async () => {
      const session = await createSession({ max_devices: 3 });

      await deviceService.bind(session.id, "AA:BB:CC:DD:EE:FF");
      await deviceService.bind(session.id, "11:22:33:44:55:66");
      await deviceService.bind(session.id, "AA:AA:AA:AA:AA:AA");

      const devices = await deviceService.getActive(session.id);
      expect(devices.length).toBe(3);
    });

    it("should reject when max devices reached", async () => {
      const session = await createSession({ max_devices: 2 });

      await deviceService.bind(session.id, "AA:BB:CC:DD:EE:FF");
      await deviceService.bind(session.id, "11:22:33:44:55:66");

      // Try to bind 3rd device
      await expect(
        deviceService.bind(session.id, "AA:AA:AA:AA:AA:AA"),
      ).rejects.toThrow("MAX_DEVICES_REACHED");
    });
  });
});
```

---

## Performance

**MAC Lookup:** < 50ms (indexed)  
**Device Binding:** < 100ms  
**RADIUS Response:** < 200ms total

**Indexes:**

```sql
CREATE INDEX idx_devices_mac ON devices(mac_address);
CREATE INDEX idx_devices_session ON devices(session_id, status);
CREATE INDEX idx_devices_user ON devices(user_id, is_active);
```

---

## Related Documents

- [Session Lifecycle](./session-lifecycle.md)
- [PC Logout Sync](./pc-logout-sync.md)
- [Concurrent Sessions](./concurrent-sessions.md)
- [RADIUS Integration](../../09-integrations/radius-server.md)

---

[← Back to Sessions](./README.md) | [← Back to Features](../README.md)

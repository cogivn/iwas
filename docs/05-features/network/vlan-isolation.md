# VLAN Isolation

**Feature ID:** FR-17  
**Priority:** P0 (Critical)  
**Status:** 📝 Documented  
**Last Updated:** February 16, 2026

---

## Overview

**User Story:** As an iCafe owner, I need WiFi traffic completely separated from PC gaming traffic to prevent performance degradation and ensure optimal gaming experience.

**Business Value:**

- **Gaming performance** - Zero impact on PC latency
- **Customer satisfaction** - Gamers get guaranteed bandwidth
- **Network security** - Isolated networks prevent cross-contamination
- **Resource management** - Separate bandwidth pools

---

## Network Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    NETWORK TOPOLOGY                          │
└─────────────────────────────────────────────────────────────┘

                    Internet
                       │
                       ▼
                 [Router/Firewall]
                       │
                       ▼
                 [Core Switch]
                       │
        ┌──────────────┴──────────────┐
        │                             │
        ▼                             ▼
   VLAN 10 (PC)                  VLAN 20 (WiFi)
   192.168.10.0/24               192.168.20.0/24
        │                             │
   ┌────┴────┐                   ┌────┴────┐
   │         │                   │         │
  PC1      PC2                  AP1      AP2
 Gaming   Gaming               WiFi     WiFi
```

---

## VLAN Configuration

### VLAN 10: PC Gaming Network

```
VLAN ID: 10
Name: PC_GAMING
Subnet: 192.168.10.0/24
Gateway: 192.168.10.1
DHCP Pool: 192.168.10.100 - 192.168.10.200

QoS Priority: HIGH
Bandwidth: Guaranteed (no sharing with WiFi)
Latency: < 5ms (prioritized)

Allowed Services:
- Gaming traffic (all ports)
- Steam, Epic, etc.
- Voice chat (Discord, TeamSpeak)
- PC management system
```

### VLAN 20: Guest WiFi Network

```
VLAN ID: 20
Name: GUEST_WIFI
Subnet: 192.168.20.0/24
Gateway: 192.168.20.1
DHCP Pool: 192.168.20.100 - 192.168.20.254

QoS Priority: NORMAL
Bandwidth: Shared pool (fair queuing)
Latency: Best effort

Allowed Services:
- HTTP/HTTPS (web browsing)
- Social media
- Video streaming (limited)
- Email
```

---

## MikroTik Configuration

### Create VLANs

```routeros
# Create VLAN interfaces
/interface vlan
add interface=ether1 name=vlan10-pc vlan-id=10
add interface=ether1 name=vlan20-wifi vlan-id=20

# Assign IP addresses
/ip address
add address=192.168.10.1/24 interface=vlan10-pc
add address=192.168.20.1/24 interface=vlan20-wifi

# DHCP Server for PC VLAN
/ip pool
add name=pc-pool ranges=192.168.10.100-192.168.10.200

/ip dhcp-server
add address-pool=pc-pool interface=vlan10-pc name=dhcp-pc

/ip dhcp-server network
add address=192.168.10.0/24 gateway=192.168.10.1 dns-server=8.8.8.8,8.8.4.4

# DHCP Server for WiFi VLAN
/ip pool
add name=wifi-pool ranges=192.168.20.100-192.168.20.254

/ip dhcp-server
add address-pool=wifi-pool interface=vlan20-wifi name=dhcp-wifi

/ip dhcp-server network
add address=192.168.20.0/24 gateway=192.168.20.1 dns-server=8.8.8.8,8.8.4.4
```

### Firewall Rules (Inter-VLAN Blocking)

```routeros
# Block WiFi → PC traffic
/ip firewall filter
add chain=forward src-address=192.168.20.0/24 dst-address=192.168.10.0/24 \
    action=drop comment="Block WiFi to PC"

# Block PC → WiFi traffic (optional, usually not needed)
add chain=forward src-address=192.168.10.0/24 dst-address=192.168.20.0/24 \
    action=drop comment="Block PC to WiFi"

# Allow WiFi to Internet
add chain=forward src-address=192.168.20.0/24 out-interface=ether1-wan \
    action=accept comment="Allow WiFi to Internet"

# Allow PC to Internet
add chain=forward src-address=192.168.10.0/24 out-interface=ether1-wan \
    action=accept comment="Allow PC to Internet"
```

### QoS Configuration

```routeros
# Queue tree for PC VLAN (guaranteed bandwidth)
/queue tree
add name=pc-parent parent=vlan10-pc max-limit=1000M priority=1

# Queue tree for WiFi VLAN (shared bandwidth)
/queue tree
add name=wifi-parent parent=vlan20-wifi max-limit=500M priority=5

# Per-session queues (set via RADIUS)
# Mikrotik-Rate-Limit attribute handles individual limits
```

---

## Access Point Configuration

### WiFi AP VLAN Tagging

```
# Unifi Controller / AP Configuration
SSID: iCafe-WiFi
VLAN: 20 (tagged)
Security: WPA2-Enterprise (RADIUS)
RADIUS Server: 192.168.10.5:1812
RADIUS Secret: <secret>

Network:
- Native VLAN: None
- Tagged VLAN: 20
- Management VLAN: 10 (for AP management)
```

---

## Security Benefits

### 1. Network Isolation

```typescript
// WiFi users CANNOT:
- Access PC gaming machines
- See PC network traffic
- Interfere with gaming latency
- Access PC management system

// PC users CANNOT:
- Access WiFi user devices
- See WiFi network traffic
```

### 2. Attack Surface Reduction

```
If WiFi network compromised:
✅ PC network remains secure
✅ Gaming continues unaffected
✅ Isolated breach containment
```

### 3. Bandwidth Protection

```
WiFi traffic spike:
✅ PC bandwidth unaffected
✅ Gaming latency unchanged
✅ Separate QoS policies
```

---

## Monitoring

### Network Health Dashboard

```typescript
interface VLANHealthMetrics {
  vlan_id: number;
  name: string;

  // Traffic
  bytes_in: number;
  bytes_out: number;
  packets_in: number;
  packets_out: number;

  // Performance
  avg_latency: number; // ms
  packet_loss: number; // %
  bandwidth_usage: number; // %

  // Devices
  active_devices: number;
  dhcp_leases: number;

  // Health
  status: "HEALTHY" | "WARNING" | "CRITICAL";
  last_updated: Date;
}
```

### MikroTik Monitoring Script

```routeros
# Monitor VLAN traffic
/interface monitor-traffic vlan10-pc,vlan20-wifi once do={
  :put ("PC VLAN: " . [get vlan10-pc rx-bits-per-second] . " / " . [get vlan10-pc tx-bits-per-second])
  :put ("WiFi VLAN: " . [get vlan20-wifi rx-bits-per-second] . " / " . [get vlan20-wifi tx-bits-per-second])
}
```

---

## Testing & Validation

### Connectivity Tests

```bash
# From WiFi device (192.168.20.x)
ping 8.8.8.8                    # Should work (Internet)
ping 192.168.10.1               # Should FAIL (PC gateway)
ping 192.168.10.100             # Should FAIL (PC device)

# From PC device (192.168.10.x)
ping 8.8.8.8                    # Should work (Internet)
ping 192.168.20.1               # Should FAIL (WiFi gateway)
ping 192.168.20.100             # Should FAIL (WiFi device)
```

### Performance Tests

```typescript
describe("VLAN Isolation", () => {
  it("should prevent WiFi to PC communication", async () => {
    const wifiDevice = "192.168.20.100";
    const pcDevice = "192.168.10.100";

    const result = await ping(wifiDevice, pcDevice);
    expect(result.success).toBe(false);
    expect(result.error).toContain("Destination unreachable");
  });

  it("should maintain PC latency under WiFi load", async () => {
    // Generate heavy WiFi traffic
    await generateTraffic("192.168.20.0/24", "1Gbps");

    // Measure PC latency
    const latency = await measureLatency("192.168.10.100");
    expect(latency).toBeLessThan(5); // < 5ms
  });
});
```

---

## Troubleshooting

### Common Issues

**1. WiFi users can't access Internet**

```
Check:
- VLAN 20 gateway configured?
- DHCP server running?
- Firewall rules allow WiFi → WAN?
- NAT configured for VLAN 20?
```

**2. Inter-VLAN communication still possible**

```
Check:
- Firewall rules in correct order?
- Switch ports configured for VLAN tagging?
- AP VLAN configuration correct?
```

**3. PC gaming latency high**

```
Check:
- QoS priority for VLAN 10?
- WiFi traffic not leaking to PC VLAN?
- Bandwidth limits configured?
```

---

## Migration Plan

### From Flat Network to VLAN

```
Phase 1: Preparation
- Document current network topology
- Plan IP addressing scheme
- Configure VLANs on switch
- Test with single AP

Phase 2: WiFi Migration
- Configure APs for VLAN 20
- Migrate WiFi users gradually
- Monitor for issues

Phase 3: Validation
- Test inter-VLAN blocking
- Verify PC gaming performance
- Monitor for 24 hours

Phase 4: Cleanup
- Remove old flat network config
- Update documentation
- Train staff
```

---

## Performance Impact

**Before VLAN Isolation:**

- PC latency: 5-50ms (variable)
- WiFi affects gaming
- Security concerns

**After VLAN Isolation:**

- PC latency: < 5ms (consistent)
- WiFi isolated
- Improved security

---

## Related Documents

- [Bandwidth Management](./bandwidth-management.md)
- [Anti-Abuse](./anti-abuse.md)
- [MikroTik Configuration](../../09-integrations/mikrotik-routeros.md)
- [System Architecture](../../04-architecture/system-architecture.md)

---

[← Back to Network](./README.md) | [← Back to Features](../README.md)

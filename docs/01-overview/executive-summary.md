# Executive Summary

**Product:** IWAS – iCafe WiFi Access Service  
**Version:** 1.0  
**Date:** February 16, 2026

---

## Overview

The **IWAS (iCafe WiFi Access Service)** is a revenue-generating WiFi service that integrates seamlessly with existing iCafe PC rental systems. It enables customers to purchase WiFi access for their personal devices using multiple payment methods including PC account balance, e-wallets, and bank transfers.

## Key Value Propositions

### For Customers

- **Seamless Authentication:** Login once with Google, use everywhere
- **Flexible Payments:** Link payment methods once, use forever with 1-click purchase
- **Convenient Access:** WiFi for personal devices during PC sessions
- **Cross-Location:** Works across all iCafe locations

### For Business

- **Additional Revenue:** New revenue stream leveraging existing infrastructure
- **Minimal Investment:** Utilizes current network capacity
- **Automated Billing:** Integrated payment processing
- **Scalable:** Centralized management across multiple locations

### For Operations

- **Easy Management:** Centralized dashboard for all locations
- **Real-time Monitoring:** Live session and revenue tracking
- **Automated Processes:** Minimal manual intervention required
- **Fraud Prevention:** Built-in anti-abuse mechanisms

## Core Capabilities

1. **Multi-Authentication**
   - Google OAuth for guest users
   - PC account integration for existing customers
   - QR code quick login (Phase 2)

2. **Payment Wallet System**
   - Link multiple payment methods (PC balance, e-wallets, bank accounts)
   - Set default payment for one-click purchases
   - Secure credential storage with encryption
   - Cross-location payment support

3. **Flexible Payment Options**
   - PC Account Balance (with balance verification)
   - E-Wallets (Momo, ZaloPay, VNPay)
   - Bank QR Code (VietQR standard)

4. **Package Management**
   - Multi-tier WiFi packages with bandwidth controls
   - Time-based and data-based options
   - Location-specific pricing

5. **Session Management**
   - Device binding and tracking
   - Automatic session termination
   - PC logout synchronization
   - Concurrent session limits

6. **Admin Dashboard**
   - Role-based access control (RBAC)
   - Real-time monitoring and analytics
   - Revenue reporting
   - System health monitoring

## Target Market

- **Primary:** iCafe locations with 20-100 PC stations
- **Secondary:** Gaming centers and internet cafes in urban areas
- **Geographic Focus:** Vietnam (initial launch)

## Revenue Targets

| Metric                            | Target           | Timeline |
| --------------------------------- | ---------------- | -------- |
| WiFi ARPU per customer            | 5,000-10,000 VND | Month 3  |
| WiFi adoption rate                | 30% of PC users  | Month 6  |
| Monthly WiFi revenue per location | 5-10M VND        | Month 6  |

## Strategic Objectives

1. **Increase ARPU** - Monetize existing network infrastructure
2. **Leverage Infrastructure** - Utilize current capacity with minimal additional hardware
3. **Maintain Quality** - Zero impact on PC gaming traffic
4. **Prevent Abuse** - Device binding and fair usage controls
5. **Enable Scalability** - Multi-location management from single dashboard

## Technology Stack

- **Backend:** NestJS (TypeScript), PostgreSQL, Redis, FreeRADIUS
- **Frontend:** Next.js 14+ (TypeScript, React)
- **Network:** MikroTik RouterOS, VLAN isolation
- **Integrations:** Google OAuth, Momo, ZaloPay, VNPay, VietQR

## Success Metrics

- **Revenue:** WiFi revenue per location
- **Adoption:** % of PC customers purchasing WiFi
- **Retention:** Repeat purchase rate
- **Performance:** Network uptime and latency
- **Satisfaction:** Customer satisfaction score (CSAT)

## Roadmap

### Phase 1 (MVP) - Month 1-2

- Google OAuth + PC account authentication
- Payment Wallet with PC balance, e-wallet, bank QR
- Basic package management
- Session lifecycle management
- Admin dashboard (basic)

### Phase 2 - Month 3-4

- QR code quick login
- Advanced analytics
- Multi-location reporting
- Enhanced anti-abuse features

### Phase 3 - Month 5-6

- Mobile app for customers
- Advanced RBAC features
- API for third-party integrations
- Machine learning for fraud detection

---

## Next Steps

1. Review detailed [Product Vision](./product-vision.md)
2. Study [User Personas](../03-users/personas.md)
3. Explore [Features](../05-features/) by domain
4. Check [Roadmap](../10-roadmap/) for implementation timeline

---

[← Back to Documentation Hub](../README.md)

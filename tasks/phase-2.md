# Phase 2: Advanced Integrations & Optimization

## 🔄 Phase 2A: iCafe Account Integration (iCafe Sync)

_Goal: Connecting with local internet cafe management systems._

- [ ] **Task 2.1: PC System API Client**
  - [ ] Implement utility to call PC System APIs (Authorize, Check Balance).
  - [ ] Handle error states and timeouts for local server connections.
- [ ] **Task 2.2: PC Balance Payment Flow**
  - [ ] Create a custom endpoint `/api/pay-with-pc-balance`.
  - [ ] Implement logic to deduct amount from PC account via API.
  - [ ] Trigger session creation upon successful deduction.

## 💳 Phase 2B: Multi-Wallet Expansion

_Goal: Providing more payment options for users._

- [ ] **Task 2.3: MoMo Integration**
  - [ ] Implement MoMo payment request generator.
  - [ ] Create `/api/payments/webhook/momo` to handle asynchronous notifications.
- [ ] **Task 2.4: ZaloPay / VNPay Integration**
  - [ ] (Similar to MoMo) Implement SDK/API and Webhooks.

## 📊 Phase 2C: Admin UX & Monitoring

_Goal: Empowering managers with data._

- [ ] **Task 2.5: Real-time Session Monitoring**
  - [ ] Create a custom dashboard component in Payload to see active users.
  - [ ] Implement "Force Disconnect" button using the CoA Service.
- [ ] **Task 2.6: Revenue Reporting**
  - [ ] Build aggregation pipelines for daily/weekly revenue by location.
  - [ ] Export reports (CSV/Excel).

## 🛡️ Phase 2D: Network Hardening

_Goal: Security and anti-abuse._

- [ ] **Task 2.7: MAC Randomization Defense**
  - [ ] Implement logic to detect and limit frequent MAC changes.
- [ ] **Task 2.8: Bandwidth Throttling Sync**
  - [ ] Ensure RADIUS attributes correctly pass bandwidth limits to MikroTik.

---

## 🔗 Dependencies

- Phase 1 core data models must be finished.
- VPN Tunnels to local locations must be established for PC System sync.

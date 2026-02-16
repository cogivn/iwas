# Payment Gateway Integration

**Section ID:** 09-02  
**Status:** ✅ Detailed  
**Last Updated:** February 16, 2026

---

## 💳 Supported Gateways

IWAS is designed to support multiple payment providers to ensure maximum coverage in the Vietnamese market.

### 1. MoMo (E-Wallet)

- **Method:** QR Code (Dynamic).
- **Integration:** MoMo Partner API.
- **Key Feature:** Instant confirmation via asynchronous HTTP Post (Webhook).

### 2. VNPay (Banking & QR)

- **Method:** VNPay-QR.
- **Integration:** VNPay Merchant API.
- **Key Feature:** Supports almost all Vietnamese banking apps.

### 3. VietQR (Static/Dynamic QR)

- **Method:** Transfer to a specific bank account with a structured "Description" (e.g., `IWAS_USER123`).
- **Integration:** Auto-detect via banking API or manual verification (for MVP).

---

## 🛠️ Security Pattern (HMAC Verification)

Every payment callback must be verified using a shared secret between IWAS and the Provider.

```typescript
// src/utilities/verifyPayment.ts
import crypto from "crypto";

export const verifyMoMoSignature = (
  payload: any,
  secretKey: string,
): boolean => {
  const { signature, ...data } = payload;
  const rawData = buildRawData(data); // Sorted keys
  const hmac = crypto
    .createHmac("sha256", secretKey)
    .update(rawData)
    .digest("hex");

  return hmac === signature;
};
```

---

## 🔄 Transaction States

1.  **PENDING:** User is shown the payment screen.
2.  **PROCESSING:** User has interacted but gateway hasn't confirmed.
3.  **SUCCESS:** Gateway confirmed; WiFi session activated.
4.  **FAILED:** Gateway reported failure or timeout (15 mins).

---

[← Back to Integrations](./README.md)

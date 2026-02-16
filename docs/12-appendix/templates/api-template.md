# [API Group Name] API

**Version:** 1.0  
**Base URL:** `/api/v1`  
**Authentication:** Required | Optional | None  
**Last Updated:** [Date]

---

## Overview

[Brief description of this API group and its purpose]

## Authentication

[Describe authentication requirements]

```typescript
Headers: {
  "Authorization": "Bearer {token}",
  "Content-Type": "application/json"
}
```

## Rate Limiting

- **Limit:** X requests per minute
- **Headers:**
  - `X-RateLimit-Limit`: Total allowed requests
  - `X-RateLimit-Remaining`: Remaining requests
  - `X-RateLimit-Reset`: Time when limit resets (Unix timestamp)

## Common Response Codes

| Code | Description           |
| ---- | --------------------- |
| 200  | Success               |
| 201  | Created               |
| 400  | Bad Request           |
| 401  | Unauthorized          |
| 403  | Forbidden             |
| 404  | Not Found             |
| 429  | Too Many Requests     |
| 500  | Internal Server Error |

---

## Endpoints

### 1. [Endpoint Name]

**Description:** [What this endpoint does]

**Method:** `GET | POST | PUT | PATCH | DELETE`  
**Path:** `/api/v1/resource`  
**Authentication:** Required | Optional

#### Request

**Headers:**

```
Authorization: Bearer {token}
Content-Type: application/json
```

**Path Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | string | Yes | Resource ID |

**Query Parameters:**
| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| page | number | No | 1 | Page number |
| limit | number | No | 20 | Items per page |

**Body:**

```typescript
{
  "field1": "string",
  "field2": number,
  "field3": boolean
}
```

**TypeScript Interface:**

```typescript
interface RequestBody {
  field1: string;
  field2: number;
  field3: boolean;
}
```

#### Response

**Success (200):**

```typescript
{
  "success": true,
  "data": {
    "id": "string",
    "field1": "string",
    "field2": number
  },
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 100
  }
}
```

**TypeScript Interface:**

```typescript
interface SuccessResponse {
  success: true;
  data: ResourceType;
  meta?: PaginationMeta;
}

interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}
```

**Error (4xx/5xx):**

```typescript
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": {} // Optional additional details
  }
}
```

**TypeScript Interface:**

```typescript
interface ErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: Record<string, any>;
  };
}
```

#### Example

**Request:**

```bash
curl -X POST https://api.example.com/api/v1/resource \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "field1": "value1",
    "field2": 123,
    "field3": true
  }'
```

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "abc123",
    "field1": "value1",
    "field2": 123,
    "created_at": "2026-02-16T15:00:00Z"
  }
}
```

#### Error Codes

| Code               | HTTP Status | Description              | Resolution           |
| ------------------ | ----------- | ------------------------ | -------------------- |
| INVALID_INPUT      | 400         | Invalid request data     | Check request format |
| UNAUTHORIZED       | 401         | Missing or invalid token | Provide valid token  |
| RESOURCE_NOT_FOUND | 404         | Resource doesn't exist   | Check resource ID    |

---

## Webhooks

### [Webhook Name]

**Description:** [When this webhook is triggered]

**Method:** `POST`  
**URL:** [Client-provided URL]

**Headers:**

```
X-Webhook-Signature: {HMAC-SHA256 signature}
Content-Type: application/json
```

**Payload:**

```typescript
{
  "event": "event.name",
  "timestamp": "ISO8601",
  "data": {}
}
```

**Signature Verification:**

```typescript
const crypto = require("crypto");

function verifySignature(payload, signature, secret) {
  const hmac = crypto.createHmac("sha256", secret);
  const digest = hmac.update(JSON.stringify(payload)).digest("hex");
  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(digest));
}
```

---

## SDK Examples

### JavaScript/TypeScript

```typescript
import { ApiClient } from "@iwas/sdk";

const client = new ApiClient({
  apiKey: "your-api-key",
  baseUrl: "https://api.example.com",
});

// Example usage
const result = await client.resource.create({
  field1: "value1",
  field2: 123,
});
```

### cURL

```bash
curl -X GET https://api.example.com/api/v1/resource \
  -H "Authorization: Bearer {token}"
```

---

## Related Documents

- [Feature Documentation](../05-features/category/feature.md)
- [Data Model](../06-data-model/schemas/entity.md)
- [Integration Guide](../08-integrations/service.md)

## Changelog

| Date       | Version | Changes             | Author |
| ---------- | ------- | ------------------- | ------ |
| YYYY-MM-DD | 1.0     | Initial API version | Name   |

---

[← Back to API Documentation](../README.md) | [← Back to Hub](../../README.md)

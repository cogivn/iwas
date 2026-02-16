# Google OAuth Login

**Feature ID:** FR-03  
**Priority:** P0 (Critical)  
**Status:** 📝 Documented  
**Last Updated:** February 16, 2026

---

## Overview

**User Story:** As a guest user without a PC account, I want to log in using my Google account so that I can purchase WiFi access independently.

**Business Value:**

- Enables guest users (30% of target market)
- No PC account required
- Familiar, trusted authentication
- Reduces onboarding friction

---

## Acceptance Criteria

- ✅ User can click "Sign in with Google" on captive portal
- ✅ OAuth 2.0 flow with Google (scopes: `email`, `profile`)
- ✅ Create or retrieve WiFi user linked to Google ID
- ✅ Store user profile (email, name, avatar)
- ✅ Generate JWT session token
- ✅ Redirect to package selection
- ✅ Support account linking (link Google to PC account later)
- ✅ Validate OAuth state parameter (CSRF protection)

---

## User Flow

```
1. User connects to WiFi
2. Redirected to captive portal
3. Clicks "Sign in with Google"
4. Redirected to Google consent screen
5. User grants permissions (email, profile)
6. Google redirects back with authorization code
7. System exchanges code for access token
8. Fetch user profile from Google
9. Create/update WiFi user
10. Generate session token
11. Redirect to package selection
```

---

## 🏗️ Architecture Detail

For a deep dive into how `payload-auth` (Better Auth) is integrated into our Payload CMS instance, see the [Authentication Implementation Architecture](../../04-architecture/rbac-implementation.md).

---

## 🛠️ Implementation Strategy

We use **`payload-auth`** (powered by Better Auth) to handle the entire OAuth lifecycle. This eliminates manual code for state management, token exchange, and session persistence.

### 1. Unified Auth Handler

All authentication requests are handled by a single catch-all route that interfaces with the Better Auth server.

```typescript
// src/app/api/auth/[...all]/route.ts
import { auth } from '@/lib/auth'
import { toNextJsHandler } from 'better-auth/next-js'

export const { POST, GET } = toNextJsHandler(auth)
```

### 2. Client-side Initiation

Clients initiate the flow using the standard Better Auth client, which redirects to the system's auth endpoint.

```typescript
import { authClient } from '@/lib/auth-client'

const signIn = async () => {
  const { data, error } = await authClient.signIn.social({
    provider: 'google',
    callbackURL: '/dashboard',
  })
}
```

---

## 📡 API Contracts

The following endpoints are automatically exposed and managed by `payload-auth`:

| Method | Endpoint                    | Description                        |
| ------ | --------------------------- | ---------------------------------- |
| `GET`  | `/api/auth/signin/google`   | Redirects to Google Consent Screen |
| `GET`  | `/api/auth/callback/google` | Handles OAuth callback & linking   |
| `GET`  | `/api/auth/get-session`     | Retrieves current user session     |
| `POST` | `/api/auth/signout`         | Terminates session                 |

---

## 🔐 Security Built-in

By leveraging **Better Auth**, we get standard security features out of the box:

- ✅ **CSRF Protection**: Automatic state/nonce management.
- ✅ **PKCE Support**: Enhanced security for mobile/one-page apps.
- ✅ **Session Management**: Secure, database-backed user sessions.
- ✅ **Cross-Subdomain Auth**: Support for multi-tenant white-labeling.

---

## Data Model

```typescript
interface WiFiUser {
  id: string
  google_id?: string
  pc_user_id?: string
  email: string
  name: string
  avatar_url?: string
  auth_provider: 'google' | 'pc_account'
  google_refresh_token?: string // Encrypted
  created_at: Date
  updated_at: Date
}
```

---

## Security Considerations

- ✅ Validate OAuth state parameter (CSRF protection)
- ✅ Store Google refresh token encrypted
- ✅ Implement token rotation
- ✅ Rate limit OAuth attempts
- ✅ Use HTTPS only
- ✅ Validate redirect URI

---

## Testing

```typescript
describe('Google OAuth Login', () => {
  it('should complete OAuth flow successfully', async () => {
    // Mock Google OAuth responses
    mockGoogleOAuth.getTokens.mockResolvedValue({
      access_token: 'access_token_123',
      refresh_token: 'refresh_token_456',
    })

    mockGoogleOAuth.getUserProfile.mockResolvedValue({
      id: 'google_user_123',
      email: 'user@gmail.com',
      name: 'Test User',
      picture: 'https://avatar.url',
    })

    const result = await authController.googleCallback({
      code: 'auth_code_123',
      state: 'valid_state',
      location_id: 'loc_001',
      device_mac: '00:11:22:33:44:55',
    })

    expect(result.success).toBe(true)
    expect(result.user.email).toBe('user@gmail.com')
  })
})
```

---

## Related Documents

- [PC Account Login](./pc-account-login.md)
- [Payment Wallet](../payments/payment-wallet.md)
- [User Journeys](../../03-users/user-journeys.md)

---

[← Back to Authentication](./README.md) | [← Back to Features](../README.md)

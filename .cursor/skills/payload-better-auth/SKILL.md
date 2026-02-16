---
name: payload-better-auth
description: Integration of Better Auth with Payload CMS v3.
---

# Payload Better Auth Integration

This skill provides instructions for integrating [Better Auth](https://www.better-auth.com/) with Payload CMS v3 using the `payload-better-auth` package.

## Installation

```bash
pnpm add payload-better-auth better-auth better-sqlite3
pnpm add -D @types/better-sqlite3
```

## Setup

### 1. Environment Variables

Add the following to your `.env` file:

```env
BETTER_AUTH_SECRET=your_random_secret_here
BETTER_AUTH_URL=http://localhost:3000 # Your application base URL
```

### 2. Shared Auth State (`src/lib/auth-state.ts`)

Since Payload and Better Auth run in the same Next.js process but need to coordinate state, create a shared state file:

```typescript
import { createSqlitePollingEventBus } from 'payload-better-auth/eventBus'
import { createSqliteStorage } from 'payload-better-auth/storage'
import Database from 'better-sqlite3'
import path from 'path'

const GLOBAL_AUTH_STATE_KEY = '__payload_better_auth_state__'

function getAuthState() {
  const g = global as any
  if (!g[GLOBAL_AUTH_STATE_KEY]) {
    const dbPath = path.resolve(process.cwd(), '.auth-state.db')
    const db = new Database(dbPath)
    g[GLOBAL_AUTH_STATE_KEY] = {
      db,
      eventBus: createSqlitePollingEventBus({ db }),
      storage: createSqliteStorage({ db }),
    }
  }
  return g[GLOBAL_AUTH_STATE_KEY]
}

export const { eventBus, storage } = getAuthState()
```

### 3. Better Auth Instance (`src/lib/auth.ts`)

```typescript
import { betterAuth } from 'better-auth'
import { payloadBetterAuthPlugin } from 'payload-better-auth'
import { eventBus, storage } from './auth-state'
import configPromise from '@/payload.config'

export const auth = betterAuth({
  database: {
    type: 'sqlite',
    dbPath: '.auth-server.db',
  },
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: process.env.BETTER_AUTH_URL,
  emailAndPassword: { enabled: true },
  plugins: [
    payloadBetterAuthPlugin({
      payloadConfig: configPromise,
      eventBus,
      storage,
      token: process.env.PAYLOAD_SECRET || 'secret-token',
      mapUserToPayload: (baUser) => ({
        email: baUser.email ?? '',
        name: baUser.name || 'User',
      }),
    }),
  ],
})
```

### 4. Payload Configuration (`src/payload.config.ts`)

```typescript
import { betterAuthPayloadPlugin } from 'payload-better-auth'
import { eventBus, storage } from './lib/auth-state'

export default buildConfig({
  // ...
  plugins: [
    betterAuthPayloadPlugin({
      eventBus,
      storage,
      betterAuthClientOptions: {
        externalBaseURL: process.env.BETTER_AUTH_URL!,
        internalBaseURL: process.env.BETTER_AUTH_URL!,
      },
    }),
  ],
})
```

### 5. API Route Handler (`src/app/api/auth/[...all]/route.ts`)

```typescript
import { auth } from '@/lib/auth'
import { toNextJsHandler } from 'better-auth/next-js'

export const { POST, GET } = toNextJsHandler(auth)
```

## Best Practices

- Use **SQLite WAL mode** (handled automatically by the plugin) for concurrent access.
- Ensure `BETTER_AUTH_URL` is set correctly in both server and client environments.
- Share the **same `eventBus` and `storage`** instances between both plugins.

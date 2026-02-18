/**
 * System Tenant – reserved platform tenant for system-admin role.
 * Only users assigned to this tenant with role system-admin have full platform access.
 */

import type { Payload } from 'payload'

export const SYSTEM_TENANT_SLUG = 'system'

/** Slug of the default tenant for new users (signup / first create). Seed creates it if missing. */
export const DEFAULT_TENANT_SLUG = 'default'

/**
 * System Tenant ID from env. Set SYSTEM_TENANT_ID in .env after seed (seed logs the id).
 * Used for sync checks (e.g. payload.config userHasAccessToAllTenants) where we can't run async getSystemTenantId.
 */
export function getSystemTenantIdSync(): string | null {
  const id = process.env.SYSTEM_TENANT_ID
  return id != null && id !== '' ? id : null
}

/**
 * Resolve System Tenant ID by slug. Used by hasPermission/requirePermission for scope 'system'.
 * When SYSTEM_TENANT_ID env is set, returns immediately (no DB). Otherwise one find() per call.
 */
export async function getSystemTenantId(payload: Payload): Promise<number | string | null> {
  const cached = getSystemTenantIdSync()
  if (cached != null) return cached
  const result = await payload.find({
    collection: 'tenants',
    where: { slug: { equals: SYSTEM_TENANT_SLUG } },
    limit: 1,
    depth: 0,
  })
  const doc = result.docs[0]
  return doc ? doc.id : null
}

/** Key for request-scoped cache to avoid repeated getSystemTenantId in the same request. */
const REQ_SYSTEM_TENANT_ID = Symbol.for('iwas.systemTenantId')

/**
 * Like getSystemTenantId but cached on req for the request lifetime. Use in access callbacks and
 * hooks that have req – avoids N DB calls when SYSTEM_TENANT_ID env is not set.
 * Accepts any object with payload (e.g. PayloadRequest); cache is stored on the same object.
 */
export async function getSystemTenantIdCached(req: { payload: Payload }): Promise<number | string | null> {
  const reqCache = req as Record<symbol, { value: number | string | null } | undefined>
  let cached = reqCache[REQ_SYSTEM_TENANT_ID]
  if (cached === undefined) {
    const value = await getSystemTenantId(req.payload)
    cached = { value }
    reqCache[REQ_SYSTEM_TENANT_ID] = cached
  }
  return cached.value
}

/**
 * Ensure System Tenant exists (for first-user bootstrap). Creates it if missing.
 * Uses overrideAccess so it can run during first-user registration when no admin exists yet.
 */
export async function ensureSystemTenantExists(
  payload: Payload,
  req: { payload: Payload },
): Promise<number | string> {
  const existing = await getSystemTenantId(payload)
  if (existing != null) return existing
  const created = await payload.create({
    collection: 'tenants',
    data: { name: 'Platform', slug: SYSTEM_TENANT_SLUG },
    overrideAccess: true,
    req: req as any,
  })
  process.env.SYSTEM_TENANT_ID = String(created.id)
  return created.id
}

/**
 * Ensure Default Tenant exists (for new user signup). Creates it if missing.
 */
export async function ensureDefaultTenantExists(
  payload: Payload,
  req: { payload: Payload },
): Promise<number | string> {
  const result = await payload.find({
    collection: 'tenants',
    where: { slug: { equals: DEFAULT_TENANT_SLUG } },
    limit: 1,
    depth: 0,
  })
  const existing = result.docs[0]?.id
  if (existing != null) return existing
  const created = await payload.create({
    collection: 'tenants',
    data: { name: 'Default Tenant', slug: DEFAULT_TENANT_SLUG },
    overrideAccess: true,
    req: req as any,
  })
  return created.id
}

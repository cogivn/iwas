/**
 * Permission-based RBAC: hasPermission, getTenantIdsForUser, requirePermission, canAccessAdmin.
 * All access control should use these instead of checking roles directly.
 */

import type { User } from '../payload-types'
import type { Access, Where } from 'payload'
import { extractID } from './auth'
import { PERMISSIONS, type Permission } from './permissions'
import { ROLE_PERMISSIONS, ROLE_SLUG_SYSTEM_ADMIN, type RoleSlug } from './roles'
import { getSystemTenantIdCached } from './systemTenant'

export type PermissionContext = {
  systemTenantId?: number | string | null
}

/**
 * Check if user has the given permission.
 * System-admin = user has role 'system-admin' in System Tenant (or systemTenantId from context).
 */
export function hasPermission(
  user: User | null | undefined,
  permission: Permission,
  context: PermissionContext = {},
): boolean {
  if (!user) return false

  const { systemTenantId } = context
  const systemPerms = ROLE_PERMISSIONS[ROLE_SLUG_SYSTEM_ADMIN]

  // System tenant + system-admin role
  if (systemTenantId != null) {
    const hasSystemTenant = user.tenants?.some((t) => {
      const tid = t?.tenant ? extractID(t.tenant) : null
      if (String(tid) !== String(systemTenantId)) return false
      const roles = t?.roles as string[] | undefined
      return Array.isArray(roles) && roles.includes(ROLE_SLUG_SYSTEM_ADMIN)
    })
    if (hasSystemTenant && systemPerms.includes(permission)) return true
  }

  // Tenant-scoped roles (org-admin, loc-manager, customer)
  const tenantIds = user.tenants ?? []
  for (const row of tenantIds) {
    const roles = row?.roles
    if (!Array.isArray(roles)) continue
    const tid = row.tenant ? extractID(row.tenant) : null
    if (tid != null && systemTenantId != null && String(tid) === String(systemTenantId)) {
      continue
    }
    for (const role of roles) {
      if (role in ROLE_PERMISSIONS && ROLE_PERMISSIONS[role as RoleSlug].includes(permission)) {
        return true
      }
    }
  }

  return false
}

/**
 * Get tenant IDs the user can access (for query scope). System-admin gets 'all'.
 */
export function getTenantIdsForUser(
  user: User | null | undefined,
  context: PermissionContext = {},
): (number | string)[] | 'all' {
  if (!user) return []

  if (hasPermission(user, PERMISSIONS.SYSTEM_MANAGE, context)) {
    return 'all'
  }

  const ids = (user.tenants ?? [])
    .map((t) => (t?.tenant ? extractID(t.tenant) : null))
    .filter((id): id is number | string => id != null)
  return ids
}

/**
 * Can user access admin panel? (has ADMIN_ACCESS permission)
 */
export function canAccessAdmin(
  user: User | null | undefined,
  context: PermissionContext = {},
): boolean {
  return hasPermission(user, PERMISSIONS.ADMIN_ACCESS, context)
}

/**
 * Payload Access that requires the given permission. Use for create/delete or when result is boolean.
 * For read/update that need tenant-scoped Where, use requirePermissionWithTenantScope or build access manually.
 */
export function requirePermission(permission: Permission): Access {
  return async ({ req }) => {
    const systemTenantId = await getSystemTenantIdCached(req)
    return hasPermission(req.user as User, permission, { systemTenantId })
  }
}

/**
 * Read access for collections scoped by tenant: returns true for system-admin, else Where { tenant: { in: tenantIds } }.
 * Use when collection has a `tenant` field (e.g. locations, packages, sessions).
 */
export function requirePermissionWithTenantScope(permission: Permission): Access {
  return async ({ req }) => {
    const systemTenantId = await getSystemTenantIdCached(req)
    const user = req.user as User
    if (!hasPermission(user, permission, { systemTenantId })) return false
    const tenantIds = getTenantIdsForUser(user, { systemTenantId })
    if (tenantIds === 'all') return true
    if (tenantIds.length === 0) return false
    return { tenant: { in: tenantIds } }
  }
}

/**
 * Read access for Users collection. Permission-driven:
 * - USERS_READ: see users in scope (system-admin = all, org-admin = users in their tenant(s))
 * - USERS_READ_SELF: see only own record. Add role with this permission → works without code change.
 */
export function usersReadAccess(): Access {
  return async ({ req }) => {
    const systemTenantId = await getSystemTenantIdCached(req)
    const user = req.user as User

    if (hasPermission(user, PERMISSIONS.USERS_READ, { systemTenantId })) {
      const tenantIds = getTenantIdsForUser(user, { systemTenantId })
      if (tenantIds === 'all') return true
      if (tenantIds.length > 0) return { 'tenants.tenant': { in: tenantIds } } as Where
      return { id: { equals: user.id } } as Where
    }

    if (hasPermission(user, PERMISSIONS.USERS_READ_SELF, { systemTenantId })) {
      return { id: { equals: user.id } } as Where
    }

    return false
  }
}

/**
 * Update/delete access for Users: system-admin all; org-admin tenant-scoped; else false.
 */
export function usersMutateAccess(permission: Permission): Access {
  return async ({ req }) => {
    const systemTenantId = await getSystemTenantIdCached(req)
    const user = req.user as User
    if (!hasPermission(user, permission, { systemTenantId })) return false
    const tenantIds = getTenantIdsForUser(user, { systemTenantId })
    if (tenantIds === 'all') return true
    if (tenantIds.length > 0) return { 'tenants.tenant': { in: tenantIds } } as Where
    return false
  }
}

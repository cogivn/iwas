import type { Access } from 'payload'
import type { User } from '../payload-types'
import { ROLE_SLUG_SYSTEM_ADMIN } from './roles'
import { getSystemTenantIdSync } from './systemTenant'
import { extractID } from './auth'

/**
 * Check if user is System Admin (full platform access).
 * Uses tenants[].roles: user must have role system-admin in the System Tenant.
 * Requires SYSTEM_TENANT_ID in env (set after seed; seed logs the id).
 */
export const isSuperAdmin = (user: User | null | undefined): boolean => {
  if (!user?.tenants?.length) return false
  const systemTenantId = getSystemTenantIdSync()
  if (systemTenantId == null) return false
  return user.tenants.some((t) => {
    const tid = t?.tenant ? extractID(t.tenant) : null
    if (String(tid) !== String(systemTenantId)) return false
    const roles = (t?.roles as string[] | undefined) ?? []
    return roles.includes(ROLE_SLUG_SYSTEM_ADMIN)
  })
}

/**
 * Access control for Super Admins only
 */
export const superAdminAccess: Access = ({ req: { user } }) => isSuperAdmin(user)

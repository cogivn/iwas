import type { User } from '../payload-types'
import type { Access } from 'payload'
import { isSuperAdmin } from './isSuperAdmin'
import { extractID, getUserTenantIDs } from './auth'

/**
 * Check if user is an Organization Admin in any tenant
 * @param user - User object or null
 * @returns true if user has 'org-admin' role in any tenant
 */
export const isOrgAdmin = (user: User | null | undefined): boolean => {
  if (isSuperAdmin(user)) return true

  return (
    user?.tenants?.some((t) => {
      const roles = t?.roles
      return Array.isArray(roles) && roles.includes('org-admin')
    }) || false
  )
}

/**
 * Access control scope for Organization Admins
 * Returns query constraint to filter data by tenant
 */
export const orgAdminScope: Access = ({ req: { user } }) => {
  if (isSuperAdmin(user)) return true

  const tenantIDs = getUserTenantIDs(user)
  if (tenantIDs.length === 0) return false

  return {
    tenant: {
      in: tenantIDs,
    },
  }
}

/**
 * Check if user is an Organization Admin for a specific tenant
 * @param user - User object or null
 * @param tenantID - Tenant ID to check
 * @returns true if user has 'org-admin' role in the specified tenant
 */
export const isOrgAdminForTenant = (
  user: User | null | undefined,
  tenantID: number | string,
): boolean => {
  if (isSuperAdmin(user)) return true

  return (
    user?.tenants?.some((t) => {
      const tID = extractID(t.tenant)
      if (String(tID) !== String(tenantID)) return false
      const roles = t?.roles
      return Array.isArray(roles) && roles.includes('org-admin')
    }) || false
  )
}

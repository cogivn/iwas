import type { User } from '../payload-types'
import type { Access } from 'payload'
import { isSuperAdmin } from './isSuperAdmin'
import { getUserTenantIDs } from './auth'

/**
 * Check if user is an Organization Admin in any tenant
 * @param user - User object or null
 * @returns true if user has 'org-admin' role in any tenant
 */
export const isOrgAdmin = (user: User | null | undefined): boolean => {
  if (isSuperAdmin(user)) return true

  return (
    user?.tenants?.some((t) => {
      const roles = t.roles
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

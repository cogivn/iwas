import type { User, Tenant } from '../payload-types'
import type { CollectionSlug, Payload } from 'payload'

/**
 * Check if user is a Super Admin (global access)
 * Note: This is re-exported from isSuperAdmin.ts for backwards compatibility
 */
export const isSuperAdmin = (user: User | null | undefined): boolean => {
  return user?.role === 'admin'
}

/**
 * Extract ID from object or return ID directly
 * Handles both relationship objects and direct IDs
 */
export const extractID = <T extends { id: any }>(objectOrID: T | any): any => {
  if (objectOrID && typeof objectOrID === 'object') return objectOrID.id
  return objectOrID
}

/**
 * Get all tenant IDs that a user belongs to
 * @param user - User object or null
 * @returns Array of tenant IDs (number or string)
 */
export const getUserTenantIDs = (user: User | null | undefined): (number | string)[] => {
  if (!user) return []
  return user.tenants?.map((t) => (t?.tenant ? extractID(t.tenant) : null)).filter(Boolean) || []
}

/**
 * Check if user has a specific role in any tenant
 * @param user - User object
 * @param role - Role to check for ('org-admin', 'loc-manager', 'customer')
 * @returns true if user has the role in any tenant
 */
export const hasRoleInAnyTenant = (
  user: User | null | undefined,
  role: 'org-admin' | 'loc-manager' | 'customer',
): boolean => {
  if (!user) return false

  return (
    user.tenants?.some((t) => {
      const roles = t?.roles
      return Array.isArray(roles) && roles.includes(role)
    }) || false
  )
}

/**
 * Get collection ID type (number or text)
 * Used for proper type handling in queries
 */
export const getCollectionIDType = ({
  collectionSlug,
  payload,
}: {
  collectionSlug: CollectionSlug
  payload: Payload
}): 'number' | 'text' => {
  return (
    (payload.collections[collectionSlug]?.config as any)?.customIDType ?? payload.db.defaultIDType
  )
}

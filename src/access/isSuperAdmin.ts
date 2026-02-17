import type { User } from '../payload-types'

/**
 * Check if user is a Super Admin (global access to all tenants)
 * @param user - User object or null
 * @returns true if user has 'admin' role
 */
export const isSuperAdmin = (user: User | null | undefined): boolean => {
  return user?.role === 'admin'
}

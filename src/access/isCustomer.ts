import type { User } from '../payload-types'
import type { Access } from 'payload'

/**
 * Check if user is a Customer in any tenant
 * @param user - User object or null
 * @returns true if user has 'customer' role in any tenant
 */
export const isCustomer = (user: User | null | undefined): boolean => {
  return (
    user?.tenants?.some((t) => {
      const roles = t.roles
      return Array.isArray(roles) && roles.includes('customer')
    }) || false
  )
}

/**
 * Access control scope for Customers
 * Returns query constraint to filter data to user's own records only
 */
export const customerScope: Access = ({ req: { user } }) => {
  if (!user) return false

  return {
    user: {
      equals: user.id,
    },
  }
}

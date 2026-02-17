import type { User } from '../payload-types'
import type { Access } from 'payload'
import { isSuperAdmin } from './isSuperAdmin'
import { isOrgAdmin, orgAdminScope } from './isOrgAdmin'
import { extractID } from './auth'

/**
 * Check if user is a Location Manager in any tenant
 * @param user - User object or null
 * @returns true if user has 'loc-manager' role in any tenant
 */
export const isLocationManager = (user: User | null | undefined): boolean => {
  if (isSuperAdmin(user)) return true
  if (isOrgAdmin(user)) return true

  return (
    user?.tenants?.some((t) => {
      const roles = t.roles
      return Array.isArray(roles) && roles.includes('loc-manager')
    }) || false
  )
}

/**
 * Access control scope for Location Managers
 * Returns query constraint to filter data by assigned locations
 */
export const locationManagerScope: Access = ({ req }) => {
  const { user } = req
  if (isSuperAdmin(user)) return true
  if (isOrgAdmin(user)) return orgAdminScope({ req })

  // Get assigned locations for location managers
  const assignedLocationIDs =
    user?.assignedLocations?.map((loc) => extractID(loc)).filter(Boolean) || []

  if (assignedLocationIDs.length === 0) return false

  return {
    id: {
      in: assignedLocationIDs,
    },
  }
}

/**
 * Access control scope for Location-related data (sessions, etc.)
 * Filters by location relationship
 */
export const locationDataScope: Access = ({ req }) => {
  const { user } = req
  if (isSuperAdmin(user)) return true
  if (isOrgAdmin(user)) return orgAdminScope({ req })

  // Location managers see data for their assigned locations
  const assignedLocationIDs =
    user?.assignedLocations?.map((loc) => extractID(loc)).filter(Boolean) || []

  if (assignedLocationIDs.length === 0) return false

  return {
    location: {
      in: assignedLocationIDs,
    },
  }
}

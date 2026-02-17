/**
 * RBAC Access Control Utilities
 *
 * This module provides role-based access control functions for the IWAS platform.
 * It implements a hierarchical permission system with 4 main roles:
 *
 * 1. Super Admin - Global access to all tenants
 * 2. Organization Admin - Tenant-scoped access
 * 3. Location Manager - Location-scoped access
 * 4. Customer - Self-only access
 */

// Core utilities (excluding isSuperAdmin to avoid duplicate export)
export { extractID, getUserTenantIDs, hasRoleInAnyTenant, getCollectionIDType } from './auth'

// Role checks
export * from './isSuperAdmin'
export * from './isOrgAdmin'
export * from './isLocationManager'
export * from './isCustomer'

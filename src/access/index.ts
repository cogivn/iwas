/**
 * RBAC Access Control Utilities
 *
 * Use hasPermission, requirePermission, canAccessAdmin, usersReadAccess, usersMutateAccess for access.
 * isSuperAdmin is kept for payload.config / multi-tenant plugin (sync callback where async hasPermission is not available).
 */

export {
  extractID,
  getUserTenantIDs,
  hasRoleInAnyTenant,
  getCollectionIDType,
  type UserTenantRole,
} from './auth'
export * from './isSuperAdmin'

export { PERMISSIONS, type Permission } from './permissions'
export {
  ROLE_ORDER,
  ROLE_LABELS,
  ROLE_OPTIONS,
  ROLE_SLUG_SYSTEM_ADMIN,
  ROLE_SLUG_ORG_ADMIN,
  ROLE_SLUG_LOC_MANAGER,
  ROLE_SLUG_CUSTOMER,
  ROLES_WITH_LOCATION_MANAGER_FIELDS,
  ROLE_PERMISSIONS,
  getAssignableRoleValues,
  type RoleSlug,
  type RoleHierarchyContext,
} from './roles'
export {
  SYSTEM_TENANT_SLUG,
  DEFAULT_TENANT_SLUG,
  getSystemTenantId,
  getSystemTenantIdCached,
  ensureSystemTenantExists,
  ensureDefaultTenantExists,
} from './systemTenant'
export {
  hasPermission,
  getTenantIdsForUser,
  canAccessAdmin,
  requirePermission,
  requirePermissionWithTenantScope,
  usersReadAccess,
  usersMutateAccess,
  type PermissionContext,
} from './hasPermission'

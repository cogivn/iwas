/**
 * Permission registry – single source of truth for all RBAC permissions.
 * Used by hasPermission() and requirePermission(). Do not create permissions from DB/UI.
 */

export const PERMISSIONS = {
  ADMIN_ACCESS: 'admin:access',
  SYSTEM_MANAGE: 'system:manage',

  TENANTS_READ: 'tenants:read',
  TENANTS_CREATE: 'tenants:create',
  TENANTS_UPDATE: 'tenants:update',
  TENANTS_DELETE: 'tenants:delete',

  /** Read users in scope: system-admin = all, org-admin = users in their tenant(s) */
  USERS_READ: 'users:read',
  /** Read only own user record */
  USERS_READ_SELF: 'users:read-self',
  USERS_CREATE: 'users:create',
  USERS_UPDATE: 'users:update',
  USERS_DELETE: 'users:delete',

  LOCATIONS_READ: 'locations:read',
  LOCATIONS_CREATE: 'locations:create',
  LOCATIONS_UPDATE: 'locations:update',
  LOCATIONS_DELETE: 'locations:delete',

  PACKAGES_READ: 'packages:read',
  PACKAGES_CREATE: 'packages:create',
  PACKAGES_UPDATE: 'packages:update',
  PACKAGES_DELETE: 'packages:delete',

  SESSIONS_READ: 'sessions:read',
  SESSIONS_UPDATE: 'sessions:update',

  MEDIA_READ: 'media:read',
  MEDIA_CREATE: 'media:create',
  MEDIA_UPDATE: 'media:update',
  MEDIA_DELETE: 'media:delete',

  SCRIPTS_DOWNLOAD: 'scripts:download',
} as const

export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS]

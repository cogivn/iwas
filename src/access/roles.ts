/**
 * Role registry – single source of truth for all role slugs, labels, order, and permissions.
 * Each slug is defined once in ROLE_SLUG_*; everywhere else uses the constant so changes stay in one place.
 *
 * When adding a new role:
 * 1. Add ROLE_SLUG_XXX = 'xxx', then add it to ROLE_ORDER (at the correct hierarchy position).
 * 2. Add ROLE_LABELS[ROLE_SLUG_XXX] and ROLE_PERMISSIONS[ROLE_SLUG_XXX].
 * 3. If needed, add to ROLES_WITH_LOCATION_MANAGER_FIELDS (or similar).
 * 4. Run generate:types.
 */

import type { User } from '../payload-types'
import { PERMISSIONS, type Permission } from './permissions'
import { extractID } from './auth'

/** Slug constants: define the string value here only; use the constant name everywhere else. */
export const ROLE_SLUG_SYSTEM_ADMIN = 'system-admin' as const
export const ROLE_SLUG_ORG_ADMIN = 'org-admin' as const
export const ROLE_SLUG_LOC_MANAGER = 'loc-manager' as const
export const ROLE_SLUG_CUSTOMER = 'customer' as const

/** Role hierarchy: first = highest. Built from slug constants. */
export const ROLE_ORDER = [
  ROLE_SLUG_SYSTEM_ADMIN,
  ROLE_SLUG_ORG_ADMIN,
  ROLE_SLUG_LOC_MANAGER,
  ROLE_SLUG_CUSTOMER,
] as const
export type RoleSlug = (typeof ROLE_ORDER)[number]

/** Index of each role in ROLE_ORDER (avoids repeated indexOf in getAssignableRoleValues). */
const ROLE_ORDER_INDEX = new Map<RoleSlug, number>(
  ROLE_ORDER.map((slug, i) => [slug, i]),
)

/** Display labels for admin UI. */
export const ROLE_LABELS: Record<RoleSlug, string> = {
  [ROLE_SLUG_SYSTEM_ADMIN]: 'System Admin',
  [ROLE_SLUG_ORG_ADMIN]: 'Organization Admin',
  [ROLE_SLUG_LOC_MANAGER]: 'Location Manager',
  [ROLE_SLUG_CUSTOMER]: 'Customer',
}

/** Options for Payload select field (Users.tenants[].roles). */
export const ROLE_OPTIONS: { label: string; value: RoleSlug }[] = ROLE_ORDER.map((value) => ({
  label: ROLE_LABELS[value],
  value,
}))

/** Roles that see assignedLocations / canDownloadScripts in Users collection. */
export const ROLES_WITH_LOCATION_MANAGER_FIELDS: RoleSlug[] = [ROLE_SLUG_LOC_MANAGER]

export type RoleHierarchyContext = {
  systemTenantId?: number | string | null
}

/**
 * Roles the current user is allowed to assign. User can only assign roles at or below their own highest role.
 * system-admin counts only when the user has it in the System Tenant.
 */
export function getAssignableRoleValues(
  user: User | null | undefined,
  context: RoleHierarchyContext = {},
): RoleSlug[] {
  if (!user?.tenants?.length) return [ROLE_SLUG_CUSTOMER]
  const { systemTenantId } = context
  const roleIndices: number[] = []
  for (const row of user.tenants) {
    const roles = (row?.roles ?? []) as string[]
    const tenantId = row?.tenant != null ? extractID(row.tenant) : null
    for (const r of roles) {
      if (r === ROLE_SLUG_SYSTEM_ADMIN) {
        if (systemTenantId != null && String(tenantId) === String(systemTenantId)) {
          roleIndices.push(ROLE_ORDER_INDEX.get(ROLE_SLUG_SYSTEM_ADMIN)!)
        }
        continue
      }
      const idx = ROLE_ORDER_INDEX.get(r as RoleSlug)
      if (idx !== undefined) roleIndices.push(idx)
    }
  }
  if (roleIndices.length === 0) return [ROLE_SLUG_CUSTOMER]
  const userLevelIndex = Math.min(...roleIndices)
  return ROLE_ORDER.slice(userLevelIndex) as RoleSlug[]
}

const ALL_TENANT_PERMISSIONS: Permission[] = [
  PERMISSIONS.ADMIN_ACCESS,
  PERMISSIONS.USERS_READ,
  PERMISSIONS.USERS_CREATE,
  PERMISSIONS.USERS_UPDATE,
  PERMISSIONS.USERS_DELETE,
  PERMISSIONS.LOCATIONS_READ,
  PERMISSIONS.LOCATIONS_CREATE,
  PERMISSIONS.LOCATIONS_UPDATE,
  PERMISSIONS.LOCATIONS_DELETE,
  PERMISSIONS.PACKAGES_READ,
  PERMISSIONS.PACKAGES_CREATE,
  PERMISSIONS.PACKAGES_UPDATE,
  PERMISSIONS.PACKAGES_DELETE,
  PERMISSIONS.SESSIONS_READ,
  PERMISSIONS.SESSIONS_UPDATE,
  PERMISSIONS.MEDIA_READ,
  PERMISSIONS.MEDIA_CREATE,
  PERMISSIONS.MEDIA_UPDATE,
  PERMISSIONS.MEDIA_DELETE,
  PERMISSIONS.SCRIPTS_DOWNLOAD,
]

export const ROLE_PERMISSIONS: Record<RoleSlug, Permission[]> = {
  [ROLE_SLUG_SYSTEM_ADMIN]: [
    PERMISSIONS.ADMIN_ACCESS,
    PERMISSIONS.SYSTEM_MANAGE,
    PERMISSIONS.TENANTS_READ,
    PERMISSIONS.TENANTS_CREATE,
    PERMISSIONS.TENANTS_UPDATE,
    PERMISSIONS.TENANTS_DELETE,
    ...ALL_TENANT_PERMISSIONS,
  ],
  [ROLE_SLUG_ORG_ADMIN]: [
    PERMISSIONS.ADMIN_ACCESS,
    PERMISSIONS.USERS_READ,
    PERMISSIONS.USERS_CREATE,
    PERMISSIONS.USERS_UPDATE,
    PERMISSIONS.USERS_DELETE,
    PERMISSIONS.LOCATIONS_READ,
    PERMISSIONS.LOCATIONS_CREATE,
    PERMISSIONS.LOCATIONS_UPDATE,
    PERMISSIONS.LOCATIONS_DELETE,
    PERMISSIONS.PACKAGES_READ,
    PERMISSIONS.PACKAGES_CREATE,
    PERMISSIONS.PACKAGES_UPDATE,
    PERMISSIONS.PACKAGES_DELETE,
    PERMISSIONS.SESSIONS_READ,
    PERMISSIONS.SESSIONS_UPDATE,
    PERMISSIONS.MEDIA_READ,
    PERMISSIONS.MEDIA_CREATE,
    PERMISSIONS.MEDIA_UPDATE,
    PERMISSIONS.MEDIA_DELETE,
    PERMISSIONS.SCRIPTS_DOWNLOAD,
  ],
  [ROLE_SLUG_LOC_MANAGER]: [
    PERMISSIONS.ADMIN_ACCESS,
    PERMISSIONS.USERS_READ,
    PERMISSIONS.LOCATIONS_READ,
    PERMISSIONS.LOCATIONS_UPDATE,
    PERMISSIONS.SESSIONS_READ,
    PERMISSIONS.SESSIONS_UPDATE,
    PERMISSIONS.PACKAGES_READ,
    PERMISSIONS.SCRIPTS_DOWNLOAD,
  ],
  [ROLE_SLUG_CUSTOMER]: [],
}

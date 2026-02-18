import { tenantsArrayField } from '@payloadcms/plugin-multi-tenant/fields'
import type { CollectionConfig, Where } from 'payload'
import type { User } from '../payload-types'
import {
  getSystemTenantIdCached,
  getSystemTenantIdSync,
  ensureSystemTenantExists,
  ensureDefaultTenantExists,
  SYSTEM_TENANT_SLUG,
} from '../access/systemTenant'
import {
  hasPermission,
  getTenantIdsForUser,
  usersReadAccess,
  usersMutateAccess,
  requirePermission,
} from '../access/hasPermission'
import { PERMISSIONS } from '../access/permissions'
import {
  getAssignableRoleValues,
  ROLE_OPTIONS,
  ROLE_SLUG_CUSTOMER,
  ROLE_SLUG_SYSTEM_ADMIN,
  ROLES_WITH_LOCATION_MANAGER_FIELDS,
  type RoleSlug,
} from '../access/roles'
import { extractID } from '../access/auth'

export const Users: CollectionConfig = {
  slug: 'users',
  admin: {
    useAsTitle: 'email',
  },
  hooks: {
    beforeChange: [
      // Strip assignments above current user's level (role hierarchy: cannot assign role above own)
      async ({ data, req }) => {
        const tenants = data?.tenants as Array<{ tenant?: unknown; roles?: string[] }> | undefined
        if (!Array.isArray(tenants) || tenants.length === 0) return data
        const systemTenantId = await getSystemTenantIdCached(req)
        const assignable = getAssignableRoleValues(req.user as User, { systemTenantId: systemTenantId ?? undefined })
        const canAssignSystemTenant = hasPermission(req.user as User, PERMISSIONS.SYSTEM_MANAGE, {
          systemTenantId: systemTenantId ?? undefined,
        })
        data.tenants = tenants
          .filter((t) => {
            const tid = t?.tenant != null ? extractID(t.tenant) : null
            if (systemTenantId != null && String(tid) === String(systemTenantId))
              return canAssignSystemTenant
            return true
          })
          .map((t) => {
            const roles = ((t?.roles ?? []) as string[]).filter((r) => assignable.includes(r as RoleSlug))
            return { ...t, roles }
          })
          .filter((t) => (t?.roles?.length ?? 0) > 0) as typeof data.tenants
        return data
      },
      // On create with no tenants (e.g. signup): first user → system-admin; others → default tenant + customer
      async ({ data, req, operation }) => {
        if (operation !== 'create') return data
        const tenants = data?.tenants as Array<{ tenant?: unknown; roles?: string[] }> | undefined
        if (Array.isArray(tenants) && tenants.length > 0) return data

        const { totalDocs } = await req.payload.find({
          collection: 'users',
          limit: 0,
        })

        if (totalDocs === 0) {
          // First user: system-admin so they can create tenants and manage platform (bootstrap)
          const systemTenantId = await ensureSystemTenantExists(req.payload, req)
          data.tenants = [{ tenant: systemTenantId, roles: [ROLE_SLUG_SYSTEM_ADMIN] }]
        } else {
          // Subsequent users: default tenant + customer
          const defaultTenantId = await ensureDefaultTenantExists(req.payload, req)
          data.tenants = [{ tenant: defaultTenantId, roles: [ROLE_SLUG_CUSTOMER] }]
        }
        return data
      },
      async ({ data, req }) => {
        const tenants = data?.tenants as Array<{ tenant?: unknown; roles?: string[] }> | undefined
        if (!Array.isArray(tenants) || tenants.length <= 1) return data
        const systemTenantId = await getSystemTenantIdCached(req)
        if (systemTenantId == null) return data
        const hasSystemAdmin = tenants.some((t) => {
          const tid = t?.tenant != null ? extractID(t.tenant) : null
          const roles = (t?.roles ?? []) as string[]
          return String(tid) === String(systemTenantId) && roles.includes(ROLE_SLUG_SYSTEM_ADMIN)
        })
        if (hasSystemAdmin) {
          throw new Error(
            `User with System Admin (${SYSTEM_TENANT_SLUG}) must not have other tenant assignments. Remove other tenants or remove system-admin.`,
          )
        }
        return data
      },
    ],
  },
  access: {
    create: requirePermission(PERMISSIONS.USERS_CREATE),
    read: usersReadAccess(),
    update: usersMutateAccess(PERMISSIONS.USERS_UPDATE),
    delete: usersMutateAccess(PERMISSIONS.USERS_DELETE),
  },
  auth: true,
  fields: [
    {
      name: 'tenants',
      type: 'array',
      admin: {
        description: 'System Admin (Platform tenant) cannot be combined with other tenants – one assignment only.',
      },
      access: {
        create: async ({ req }) => {
          const systemTenantId = await getSystemTenantIdCached(req)
          return hasPermission(req.user as User, PERMISSIONS.USERS_UPDATE, { systemTenantId })
        },
        update: async ({ req }) => {
          const systemTenantId = await getSystemTenantIdCached(req)
          return hasPermission(req.user as User, PERMISSIONS.USERS_UPDATE, { systemTenantId })
        },
      },
      fields: [
        {
          name: 'tenant',
          type: 'relationship',
          relationTo: 'tenants',
          required: true,
          access: {
            create: async ({ req }) => {
              const systemTenantId = await getSystemTenantIdCached(req)
              return hasPermission(req.user as User, PERMISSIONS.USERS_UPDATE, { systemTenantId })
            },
            update: async ({ req }) =>
              (await requirePermission(PERMISSIONS.SYSTEM_MANAGE)({ req })) === true,
          },
          filterOptions: async ({ req }): Promise<Where | boolean> => {
            const user = req.user as User
            const systemTenantId = await getSystemTenantIdCached(req)
            const tenantIds = getTenantIdsForUser(user, { systemTenantId })
            const baseFilter: Where = { isActive: { equals: true } }
            if (tenantIds === 'all') return baseFilter
            if (tenantIds.length > 0) return { ...baseFilter, id: { in: tenantIds } }
            return baseFilter
          },
          validate: async (val: unknown, options: { req: { payload: any } }) => {
            if (!val) return true
            const id = typeof val === 'object' && val && 'id' in val ? (val as { id: any }).id : val
            const payload = options.req.payload
            const tenant = await payload.findByID({ collection: 'tenants', id })
            if (tenant && !tenant.isActive) return 'Cannot assign a disabled tenant'
            return true
          },
        },
        {
          name: 'roles',
          type: 'select',
          hasMany: true,
          required: true,
          defaultValue: [ROLE_SLUG_CUSTOMER],
          access: {
            create: async ({ req }) => {
              const systemTenantId = await getSystemTenantIdCached(req)
              return hasPermission(req.user as User, PERMISSIONS.USERS_UPDATE, { systemTenantId })
            },
            update: async ({ req }) => {
              const systemTenantId = await getSystemTenantIdCached(req)
              return hasPermission(req.user as User, PERMISSIONS.USERS_UPDATE, { systemTenantId })
            },
          },
          validate: async (val: unknown, { req, siblingData }: any) => {
            if (!req.user) return true
            const roles = Array.isArray(val) ? val : []
            if (!roles.includes(ROLE_SLUG_SYSTEM_ADMIN)) return true
            const systemTenantId = await getSystemTenantIdCached(req)
            const tenantRef = siblingData?.tenant
            const tenantId = tenantRef != null ? extractID(tenantRef) : null
            if (tenantId == null || String(tenantId) !== String(systemTenantId)) {
              return `Role "System Admin" can only be assigned for the Platform (${SYSTEM_TENANT_SLUG}) tenant`
            }
            return true
          },
          options: ROLE_OPTIONS,
          filterOptions: ({ options, req }) => {
            const systemTenantId = getSystemTenantIdSync()
            const assignable = getAssignableRoleValues(req.user as User, {
              systemTenantId: systemTenantId ?? undefined,
            })
            return options.filter((o) => {
              const v = typeof o === 'string' ? o : o.value
              return assignable.includes(v as RoleSlug)
            })
          },
          admin: {
            description: 'Roles for this user within this tenant',
          },
        },
      ],
    },
    {
      name: 'assignedLocations',
      type: 'relationship',
      relationTo: 'locations',
      hasMany: true,
      admin: {
        description: 'Locations this user can manage (for Location Managers)',
        condition: (data) => {
          return Boolean(
            Array.isArray(data?.tenants) &&
            data.tenants.some((t: any) =>
              (t?.roles ?? []).some((r: string) =>
                ROLES_WITH_LOCATION_MANAGER_FIELDS.includes(r as RoleSlug),
              ),
            ),
          )
        },
      },
    },
    {
      name: 'canDownloadScripts',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        description: 'Allow downloading router setup scripts (disabled by default for security)',
        condition: (data) => {
          return Boolean(
            Array.isArray(data?.tenants) &&
            data.tenants.some((t: any) =>
              (t?.roles ?? []).some((r: string) =>
                ROLES_WITH_LOCATION_MANAGER_FIELDS.includes(r as RoleSlug),
              ),
            ),
          )
        },
      },
    },
  ],
}

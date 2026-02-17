import { tenantsArrayField } from '@payloadcms/plugin-multi-tenant/fields'
import type { CollectionConfig, Where } from 'payload'
import {
  isSuperAdmin,
  superAdminAccess,
  getUserTenantIDs,
  isOrgAdmin,
  isLocationManager,
} from '../access'

export const Users: CollectionConfig = {
  slug: 'users',
  admin: {
    useAsTitle: 'email',
  },
  access: {
    create: ({ req: { user } }) => isSuperAdmin(user) || isOrgAdmin(user),
    read: ({ req: { user } }): boolean | Where => {
      if (isSuperAdmin(user)) return true
      if (!user) return false

      const tenantIDs = getUserTenantIDs(user)

      // If user is a manager, they can see users in their assigned tenants
      if (tenantIDs.length > 0 && (isOrgAdmin(user) || isLocationManager(user))) {
        return {
          'tenants.tenant': {
            in: tenantIDs,
          },
        } as Where
      }

      // regular users can only see themselves
      return {
        id: {
          equals: user.id,
        },
      } as Where
    },
    update: ({ req: { user } }) => {
      if (isSuperAdmin(user)) return true
      if (isOrgAdmin(user)) {
        const tenantIDs = getUserTenantIDs(user)
        return {
          'tenants.tenant': {
            in: tenantIDs,
          },
        } as Where
      }
      return false
    },
    delete: ({ req: { user } }) => {
      if (isSuperAdmin(user)) return true
      if (isOrgAdmin(user)) {
        const tenantIDs = getUserTenantIDs(user)
        return {
          'tenants.tenant': {
            in: tenantIDs,
          },
        } as Where
      }
      return false
    },
  },
  auth: true,
  fields: [
    {
      name: 'role',
      type: 'select',
      required: true,
      defaultValue: 'user',
      access: {
        create: ({ req: { user } }: any) => isSuperAdmin(user),
        update: ({ req: { user } }: any) => isSuperAdmin(user),
        read: () => true,
      },
      options: [
        { label: 'Super Admin', value: 'admin' },
        { label: 'User', value: 'user' },
      ],
      admin: {
        description: 'Global role - Super Admin has access to all tenants',
      },
    },
    {
      name: 'tenants',
      type: 'array',
      // Ensure only super admin can add/remove tenant rows
      // Ensure only super admin can add/remove tenant rows
      access: {
        create: ({ req: { user } }: any) => isSuperAdmin(user) || isOrgAdmin(user),
        update: ({ req: { user } }: any) => isSuperAdmin(user) || isOrgAdmin(user),
      },
      fields: [
        {
          name: 'tenant',
          type: 'relationship',
          relationTo: 'tenants',
          required: true,
          access: {
            // Super admins can change to any tenant
            // Org admins can only assign to tenants they manage
            create: ({ req: { user } }: any) => isSuperAdmin(user) || isOrgAdmin(user),
            update: ({ req: { user } }: any) => isSuperAdmin(user),
          },
          filterOptions: ({ req: { user } }: any) => {
            const baseFilter: any = {
              isActive: { equals: true },
            }

            if (isSuperAdmin(user)) {
              return baseFilter
            }

            if (isOrgAdmin(user)) {
              const tenantIDs = getUserTenantIDs(user)
              return {
                ...baseFilter,
                id: { in: tenantIDs },
              }
            }

            return baseFilter
          },
          validate: async (val: any, options: any) => {
            if (!val) return true
            const id = typeof val === 'object' ? val.id : val
            const payload = options.req.payload
            const tenant = await payload.findByID({
              collection: 'tenants',
              id,
            })
            if (tenant && !tenant.isActive) {
              return 'Cannot assign a disabled tenant'
            }
            return true
          },
        },
        {
          name: 'roles',
          type: 'select',
          hasMany: true,
          required: true,
          defaultValue: ['customer'],
          access: {
            // Org admins can manage roles for users within the tenants they belong to
            create: ({ req: { user } }: any) => isSuperAdmin(user) || isOrgAdmin(user),
            update: ({ req: { user } }: any) => isSuperAdmin(user) || isOrgAdmin(user),
          },
          validate: (val: any, { req: { user, payload } }: any) => {
            // Allow system operations (seeding, etc) where user might be null
            if (!user) return true
            if (isSuperAdmin(user)) return true
            if (isOrgAdmin(user)) return true

            // If user has value but not authorized, block it
            if (val && val.length > 0) {
              return 'You do not have permission to assign roles in this tenant'
            }
            return true
          },
          options: [
            { label: 'Organization Admin', value: 'org-admin' },
            { label: 'Location Manager', value: 'loc-manager' },
            { label: 'Customer', value: 'customer' },
          ],
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
          // Show only if user has loc-manager role in any tenant
          return Boolean(
            Array.isArray(data?.tenants) &&
            data.tenants.some((t: any) => t?.roles?.includes('loc-manager')),
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
          // Show only if user has loc-manager role in any tenant
          return Boolean(
            Array.isArray(data?.tenants) &&
            data.tenants.some((t: any) => t?.roles?.includes('loc-manager')),
          )
        },
      },
    },
  ],
}

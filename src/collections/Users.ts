import { tenantsArrayField } from '@payloadcms/plugin-multi-tenant/fields'
import type { CollectionConfig } from 'payload'

export const Users: CollectionConfig = {
  slug: 'users',
  admin: {
    useAsTitle: 'email',
  },
  auth: true,
  fields: [
    {
      name: 'role',
      type: 'select',
      required: true,
      defaultValue: 'admin',
      options: [
        { label: 'Super Admin', value: 'admin' },
        { label: 'User', value: 'user' },
      ],
      admin: {
        description: 'Global role - Super Admin has access to all tenants',
      },
    },
    tenantsArrayField({
      tenantsArrayFieldName: 'tenants',
      tenantsArrayTenantFieldName: 'tenant',
      tenantsCollectionSlug: 'tenants',
      // Add tenant-specific roles using rowFields
      rowFields: [
        {
          name: 'roles',
          type: 'select',
          hasMany: true,
          required: true,
          defaultValue: ['customer'],
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
    }),
    {
      name: 'assignedLocations',
      type: 'relationship',
      relationTo: 'locations',
      hasMany: true,
      admin: {
        description: 'Locations this user can manage (for Location Managers)',
        condition: (data) => {
          // Show only if user has loc-manager role in any tenant
          return data?.tenants?.some((t: any) => t.roles?.includes('loc-manager'))
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
          return data?.tenants?.some((t: any) => t.roles?.includes('loc-manager'))
        },
      },
    },
  ],
}

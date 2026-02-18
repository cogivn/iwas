import type { CollectionConfig } from 'payload'
import { slugField } from '../fields/slug'
import { requirePermission } from '../access/hasPermission'
import { PERMISSIONS } from '../access/permissions'

export const Tenants: CollectionConfig = {
  slug: 'tenants',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'slug', 'createdAt'],
  },
  access: {
    read: () => true,
    create: requirePermission(PERMISSIONS.TENANTS_CREATE),
    update: requirePermission(PERMISSIONS.TENANTS_UPDATE),
    delete: requirePermission(PERMISSIONS.TENANTS_DELETE),
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
    },
    slugField({
      fieldToUse: 'name',
    }),
    {
      name: 'domain',
      type: 'text',
      admin: {
        description: 'Domain that should point to this tenant (e.g. wifi.chain.com)',
        position: 'sidebar',
      },
    },
    {
      name: 'isActive',
      type: 'checkbox',
      defaultValue: true,
      admin: {
        position: 'sidebar',
      },
    },
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Branding',
          fields: [
            {
              name: 'logo',
              type: 'upload',
              relationTo: 'media',
            },
            {
              name: 'favicon',
              type: 'upload',
              relationTo: 'media',
            },
            {
              name: 'theme',
              type: 'group',
              fields: [
                {
                  name: 'primaryColor',
                  type: 'text',
                  admin: {
                    description: 'Hex color code',
                  },
                },
                {
                  name: 'borderRadius',
                  type: 'number',
                  admin: {
                    description: 'Global border radius in pixels',
                  },
                },
              ],
            },
          ],
        },
      ],
    },
  ],
}

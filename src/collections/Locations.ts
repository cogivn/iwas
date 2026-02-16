import type { CollectionConfig } from 'payload'

export const Locations: CollectionConfig = {
  slug: 'locations',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'slug', 'wireguardIp', 'isActive'],
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      label: 'Location Name',
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      admin: {
        description: 'Used in URLs and API lookups',
      },
    },
    {
      name: 'isActive',
      type: 'checkbox',
      defaultValue: true,
      label: 'Active',
    },
    {
      name: 'address',
      type: 'textarea',
    },
    {
      type: 'group',
      name: 'networkConfig',
      label: 'Network Configuration',
      fields: [
        {
          name: 'wireguardIp',
          type: 'text',
          label: 'WireGuard Internal IP',
          admin: {
            placeholder: '10.0.0.x',
          },
        },
        {
          name: 'radiusSecret',
          type: 'text',
          label: 'RADIUS Shared Secret',
          required: true,
        },
        {
          name: 'nasId',
          type: 'text',
          label: 'NAS Identifier (Optional)',
        },
      ],
    },
  ],
}

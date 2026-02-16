import type { CollectionConfig } from 'payload'

export const Packages: CollectionConfig = {
  slug: 'packages',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'price', 'duration', 'isPublic'],
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      label: 'Package Name',
    },
    {
      name: 'price',
      type: 'number',
      required: true,
      label: 'Price (VND)',
      admin: {
        placeholder: 'e.g. 10000',
      },
    },
    {
      name: 'duration',
      type: 'number',
      required: true,
      label: 'Duration (Minutes)',
      admin: {
        placeholder: 'e.g. 180 for 3 hours',
      },
    },
    {
      name: 'description',
      type: 'textarea',
    },
    {
      type: 'group',
      name: 'bandwidth',
      label: 'Bandwidth Limits',
      fields: [
        {
          name: 'downloadLimit',
          type: 'number',
          label: 'Download Limit (Mbps)',
          admin: {
            placeholder: 'e.g. 10',
          },
        },
        {
          name: 'uploadLimit',
          type: 'number',
          label: 'Upload Limit (Mbps)',
          admin: {
            placeholder: 'e.g. 5',
          },
        },
      ],
    },
    {
      name: 'isPublic',
      type: 'checkbox',
      defaultValue: true,
      label: 'Visible on Client Portal',
    },
    {
      name: 'locations',
      type: 'relationship',
      relationTo: 'locations',
      hasMany: true,
      label: 'Available in Locations',
      admin: {
        description: 'Leave empty to make available in all locations',
      },
    },
  ],
}

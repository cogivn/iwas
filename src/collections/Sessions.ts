import type { CollectionConfig } from 'payload'

export const Sessions: CollectionConfig = {
  slug: 'wifi-sessions',
  admin: {
    useAsTitle: 'id',
    defaultColumns: ['id', 'user', 'location', 'startTime', 'endTime', 'status'],
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'user',
      type: 'relationship',
      relationTo: 'users',
      required: true,
    },
    {
      name: 'location',
      type: 'relationship',
      relationTo: 'locations',
      required: true,
    },
    {
      name: 'package',
      type: 'relationship',
      relationTo: 'packages',
      required: true,
    },
    {
      name: 'startTime',
      type: 'date',
      required: true,
      defaultValue: () => new Date(),
    },
    {
      name: 'endTime',
      type: 'date',
    },
    {
      name: 'status',
      type: 'select',
      defaultValue: 'active',
      options: [
        { label: 'Active', value: 'active' },
        { label: 'Completed', value: 'completed' },
        { label: 'Expired', value: 'expired' },
      ],
    },
    {
      name: 'nasIpAddress',
      type: 'text',
      admin: {
        description: 'IP of the NAS that originated the session',
      },
    },
    {
      name: 'macAddress',
      type: 'text',
    },
  ],
}

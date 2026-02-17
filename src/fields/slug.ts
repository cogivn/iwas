import type { Field } from 'payload'
import { formatSlug } from '../utilities/formatSlug'

type Slug = (options?: { fieldToUse?: string }) => Field

export const slugField: Slug = ({ fieldToUse = 'title' } = {}) => ({
  name: 'slug',
  label: 'Slug',
  type: 'text',
  index: true,
  admin: {
    position: 'sidebar',
    readOnly: true,
  },
  hooks: {
    beforeValidate: [formatSlug(fieldToUse)],
  },
})

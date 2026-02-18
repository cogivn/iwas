import { sqliteAdapter } from '@payloadcms/db-sqlite'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'
import { buildConfig } from 'payload'
import sharp from 'sharp'
import { fileURLToPath } from 'url'

import { multiTenantPlugin } from '@payloadcms/plugin-multi-tenant'
import { getUserTenantIDs, isSuperAdmin } from './access/auth'
import type { User } from './payload-types'
import { Locations } from './collections/Locations'
import { Media } from './collections/Media'
import { Packages } from './collections/Packages'
import { Sessions } from './collections/Sessions'
import { Tenants } from './collections/Tenants'
import { Users } from './collections/Users'
import { seed } from './seed'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },
  collections: [Users, Media, Locations, Packages, Tenants, Sessions],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: sqliteAdapter({
    client: {
      url: process.env.DATABASE_URL || '',
    },
  }),
  sharp,
  plugins: [
    multiTenantPlugin({
      collections: {
        [Locations.slug]: {},
        [Packages.slug]: {},
        [Media.slug]: {},
        [Sessions.slug]: {},
      },
      tenantsSlug: Tenants.slug,
      userHasAccessToAllTenants: (user) => isSuperAdmin(user as User),
      tenantField: {
        access: {
          read: () => true,
          update: ({ req }) => {
            if (isSuperAdmin(req.user as User)) {
              return true
            }
            return getUserTenantIDs(req.user as User).length > 0
          },
        },
      },
      tenantsArrayField: {
        includeDefaultField: false,
      },
    }),
  ],
  async onInit(payload) {
    // disabled seeding for now
    // await seed(payload)
  },
})

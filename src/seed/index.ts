import type { Payload } from 'payload'
import { ROLE_SLUG_SYSTEM_ADMIN } from '../access/roles'
import { DEFAULT_TENANT_SLUG, SYSTEM_TENANT_SLUG } from '../access/systemTenant'

export const seed = async (payload: Payload): Promise<void> => {
  // Ensure System Tenant (Platform) exists for system-admin role
  const systemTenants = await payload.find({
    collection: 'tenants',
    where: { slug: { equals: SYSTEM_TENANT_SLUG } },
    limit: 1,
  })
  let systemTenantId: number | string
  if (systemTenants.docs.length === 0) {
    const systemTenant = await payload.create({
      collection: 'tenants',
      data: {
        name: 'Platform',
        slug: SYSTEM_TENANT_SLUG,
      },
    })
    systemTenantId = systemTenant.id
    payload.logger.info('--- SYSTEM TENANT CREATED (slug: system) ---')
  } else {
    systemTenantId = systemTenants.docs[0].id
  }

  // Default tenant for new users (optional)
  const defaultTenants = await payload.find({
    collection: 'tenants',
    where: { slug: { equals: DEFAULT_TENANT_SLUG } },
    limit: 1,
  })
  if (defaultTenants.docs.length === 0) {
    await payload.create({
      collection: 'tenants',
      data: { name: 'Default Tenant', slug: DEFAULT_TENANT_SLUG },
    })
  }

  payload.logger.info(`--- Set SYSTEM_TENANT_ID=${systemTenantId} in .env for admin full access ---`)

  // First user: system-admin (assigned to System Tenant)
  const users = await payload.find({
    collection: 'users',
    limit: 1,
  })

  if (users.docs.length === 0) {
    await payload.create({
      collection: 'users',
      data: {
        email: 'admin@iwas.com',
        password: 'admin',
        tenants: [
          {
            tenant: systemTenantId,
            roles: [ROLE_SLUG_SYSTEM_ADMIN],
          },
        ],
      },
    })
    payload.logger.info('--- FIRST USER CREATED: admin@iwas.com / admin (system-admin) ---')
  }
}

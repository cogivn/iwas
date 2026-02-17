import type { Payload } from 'payload'

export const seed = async (payload: Payload): Promise<void> => {
  // Tự động tạo Tenant mặc định nếu chưa có
  const tenants = await payload.find({
    collection: 'tenants',
    limit: 1,
  })

  let defaultTenantId
  if (tenants.docs.length === 0) {
    const tenant = await payload.create({
      collection: 'tenants',
      data: {
        name: 'Default Tenant',
        slug: 'default',
      },
    })
    defaultTenantId = tenant.id
  } else {
    defaultTenantId = tenants.docs[0].id
  }

  // Tự động tạo Admin User đầu tiên nếu chưa có
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
        role: 'admin',
        tenants: [
          {
            tenant: defaultTenantId,
            roles: ['org-admin'], // Organization Admin role for the default tenant
          },
        ],
      },
    })
    payload.logger.info('--- FIRST USER CREATED: admin@iwas.com / admin ---')
  }
}

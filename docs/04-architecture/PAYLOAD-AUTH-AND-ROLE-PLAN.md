# Payload-Auth Integration & Unified Role Model – Plan

**Mục tiêu:** (1) Dùng **payload-auth** (Better Auth) thay auth mặc định của Payload cho admin; (2) Thống nhất cơ chế role (bỏ “2 nơi”: global `role` + `tenants[].roles`) thành một mô hình rõ ràng, dễ mở rộng.

---

## 1. Tổng quan payload-auth (Context7)

- **payload-auth**: plugin Payload CMS tích hợp [Better Auth](https://www.better-auth.com), cung cấp:
  - Email/password, social (Google, GitHub, Apple, Discord…), 2FA, passkeys, magic links, session management.
  - Tạo và quản lý collections: users, accounts, sessions, verifications (có thể map vào Payload).
- **Cài đặt:** `npm install payload-auth better-auth`
- **Cấu hình cơ bản (Better Auth Plugin):**
  - `disableDefaultPayloadAuth: true` → tắt auth mặc định của Payload.
  - `hidePluginCollections: true` → ẩn collections do plugin tạo (nếu dùng collection riêng).
  - `users`: slug, `adminRoles`, `defaultRole`, `roles`, `allowedFields`.
  - `betterAuthOptions`: baseURL, emailAndPassword, socialProviders, emailVerification, v.v.

**Lưu ý:** Repo hiện có skill **payload-better-auth** (package khác). Ở đây ta dùng **payload-auth** (package từ Context7) để đồng bộ với yêu cầu “payload-auth cho admin”.

---

## 2. Hiện trạng dự án

### 2.1 Auth & Users

- **Auth:** Payload built-in (`auth: true` trên collection Users).
- **DB:** SQLite (`@payloadcms/db-sqlite`).
- **Multi-tenancy:** `@payloadcms/plugin-multi-tenant` với `tenantsArrayField` tùy chỉnh (`includeDefaultField: false`), scoping theo `userHasAccessToAllTenants: isSuperAdmin(user)`.
- **Role:** Chỉ một nguồn – `tenants[].roles` (system-admin, org-admin, loc-manager, customer). Đã bỏ field global `role`.
- **System Admin:** Xác định bởi user có assignment **System Tenant** (slug `system`) + role `system-admin`. `isSuperAdmin(user)` dùng `SYSTEM_TENANT_ID` (env) cho callback sync của plugin.
- **Role hierarchy:** `ROLE_ORDER` + `getAssignableRoleValues()` – user chỉ thấy và gán được role bằng hoặc thấp hơn role cao nhất của mình; filter options + strip trong beforeChange chặn leo quyền.
- **First-user bootstrap:** User đầu tiên (khi chưa có user trong DB) được gán System Tenant + system-admin; System/Default tenant tự tạo nếu chưa có.

---

## 3. RBAC dựa trên Permissions (Permission-based) – Reuse & an toàn

### 3.1 Vấn đề cách tiếp cận "check role"

- Access logic rải rác: mỗi collection/field gọi tổ hợp role khác nhau, khó reuse.
- Thêm role mới phải sửa nhiều chỗ so sánh role → dễ sót, bug.
- Gán nhầm quyền: nếu role/permission chỉnh từ DB/UI có thể vô tình cho customer quyền system-admin → toang.

### 3.2 Nguyên tắc thiết kế

- **Không check role trong access.** Access chỉ hỏi: "user có **permission** X trong **context** Y không?".
- **Permission = atom cố định** (định nghĩa trong code). VD: `admin:access`, `tenants:create`, `users:read`, `locations:update`, `system:manage`.
- **Role = bundle permissions** (định nghĩa trong code). User chỉ lưu **role slug** trong `tenants[].roles`. Quyền thực tế = tính từ role qua **role registry** trong code → không thể gán nhầm permission nguy hiểm từ UI/DB.
- **Reuse:** toàn bộ collection access dùng chung `requirePermission(permission, context?)` → bên trong `hasPermission(user, permission, context)`.

### 3.3 Permission registry (trong code)

- **Tất cả permission** là constant/enum trong code; không tạo permission mới từ DB/UI.
- VD: `admin:access`, `system:manage`, `tenants:read` / `tenants:create`, `users:read` / `users:create`, `locations:*`, `packages:*`, `sessions:*`, `scripts:download`.
- Thêm permission = thêm vào constant + gán vào role trong role registry + dùng trong access. Không có đường gán trực tiếp permission cho user/customer từ UI.

### 3.4 Role registry (trong code)

- Mỗi role slug (system-admin, org-admin, loc-manager, customer) ánh xạ tới **mảng permission cố định** trong code.
- **Customer** luôn an toàn: không có `system:manage`, `admin:access`, hay quyền admin. Quyền portal (nếu cần) dùng permission riêng.
- **Thêm role mới:** thêm slug + `ROLE_PERMISSIONS[newRole]` với danh sách permission cố định; thêm option vào Users. Không có UI chọn từng permission cho role → không gán nhầm.

### 3.5 Scope trong hasPermission

- **Context:** `{ scope: 'system' }` (chỉ system-admin), `{ scope: 'tenant', tenantId }`, `{ scope: 'location', tenantId, locationId? }` (loc-manager theo assignedLocations).
- Logic: từ `tenants[]` lấy roles → từ role registry lấy permissions → áp dụng scope. Trả về true nếu permission trong tập và khớp context.

### 3.6 Reuse cho collection access

- **Không** gọi `isSystemAdmin`/`isOrgAdmin` trong access. Chỉ dùng `requirePermission(permission, context?)` → trả về Payload `Access` (gọi `hasPermission(req.user, permission, context)`; nếu cần query constraint thì dùng `getTenantIdsForUser(req.user)`).
- VD: Users read = `requirePermission(PERMISSIONS.USERS_READ, { scope: 'tenant' })`; Tenants create = `requirePermission(PERMISSIONS.TENANTS_CREATE, { scope: 'system' })`.
- Một lần implement `hasPermission` + `requirePermission`; mọi collection chỉ khai báo permission → reuse; thêm collection = thêm permission + gán role + `requirePermission`.

### 3.7 System Tenant & dữ liệu user

- **System Tenant** (slug `system`): tenant đặc biệt; chỉ role `system-admin` gắn tenant này (validate khi save). Bỏ field global `role`. Chỉ còn `tenants: [{ tenant, roles[] }]` với options = role slugs từ code.
- `canAccessAdmin(user)` = `hasPermission(user, PERMISSIONS.ADMIN_ACCESS)`.

### 3.8 An toàn khi thêm role / permission

| Hành động | Cách làm | Rủi ro gán nhầm |
|-----------|----------|------------------|
| Thêm permission | Thêm constant, gán vào role trong code, dùng trong access | Không: đều trong code. |
| Thêm role | Thêm slug + `ROLE_PERMISSIONS[newRole]` cố định; thêm option Users | Chỉ sai nếu dev gán nhầm trong code → code review. |
| Gán role cho user (UI) | User chỉ chọn role slug. Không có UI chọn từng permission. | system-admin chỉ khi tenant = System Tenant (validate). |

- **Reserved:** `ROLE_PERMISSIONS.customer` luôn `[]` (hoặc chỉ portal). Không có đường từ UI/DB thêm permission vào customer.

### 3.9 API chính (reuse toàn bộ)

- `hasPermission(user, permission, context?)` → boolean.
- `requirePermission(permission, context?)` → Payload `Access` (collection/field access).
- `getTenantIdsForUser(user)`; `canAccessAdmin(user)` = `hasPermission(user, PERMISSIONS.ADMIN_ACCESS)`.
- (Tuỳ chọn) `getPermissionsForUser(user, context?)` → Permission[].
- **Không** dùng `isSystemAdmin`/`isOrgAdmin`/`isLocationManager` trong access; mọi thứ qua `hasPermission`.


---

## 4. Kế hoạch áp dụng payload-auth cho admin

### 4.1 Hai hướng tích hợp

**Hướng 1: Plugin tạo collections (đơn giản ban đầu)**

- Dùng `betterAuthPlugin` với `disableDefaultPayloadAuth: true`.
- Plugin **tạo** collections users, accounts, sessions, verifications (có thể `hidePluginCollections: true` nếu dùng route Better Auth bên ngoài admin).
- Cần **mở rộng schema user** do plugin tạo: thêm `tenants` (array), `role` (global), `assignedLocations`, `canDownloadScripts` qua config plugin / additionalFields (nếu payload-auth hỗ trợ), hoặc patch collection sau khi generate.
- **Ưu:** Setup nhanh, đúng flow payload-auth. **Nhược:** Phải đảm bảo schema Payload (multi-tenant, RBAC) khớp với Better Auth (password hash, session, v.v.).

**Hướng 2: Giữ collection Users hiện tại, Better Auth dùng Payload DB (manual)**

- **Không** dùng plugin tạo collection; dùng **Payload DB adapter** cho Better Auth (nếu payload-auth có adapter “Better Auth → Payload DB”).
- Users collection hiện tại được **mở rộng** thêm các field Better Auth cần: ví dụ `emailVerified`, `image`, và đảm bảo có `password` (hash) đúng format Better Auth.
- Better Auth config: `user.modelName: 'users'`, database trỏ vào cùng Payload DB (SQLite).
- **Ưu:** Giữ nguyên multi-tenant, tenants, role hiện tại. **Nhược:** Cần kiểm tra adapter, migration schema và tương thích session/account.

**Đề xuất:** Ưu tiên tìm trong docs payload-auth (và repo) **“use existing Payload collection” / “Payload database adapter”**. Nếu có adapter rõ ràng → Hướng 2. Nếu không, bắt đầu Hướng 1 với schema mở rộng (tenants, global role) để không mất multi-tenancy.

### 4.2 Các bước triển khai (áp dụng từ Context7 + AGENTS.md)

1. **Cài đặt**
   - `npm install payload-auth better-auth`
   - Không gỡ multi-tenant plugin.

2. **Environment**
   - Thêm `BETTER_AUTH_SECRET`, `NEXT_PUBLIC_BETTER_AUTH_URL` (hoặc tương đương trong betterAuthOptions).

3. **Payload config**
   - Thêm `betterAuthPlugin({ ... })` vào `plugins`.
   - Set `disableDefaultPayloadAuth: true`.
   - Cấu hình `users`: slug `users`, `adminRoles: ['system-admin', 'org-admin', 'loc-manager']` (ai có một trong các role này mới vào admin), `defaultRole: 'customer'`, `roles` khớp với mô hình: `['system-admin', 'org-admin', 'loc-manager', 'customer']`, `allowedFields` gồm ít nhất `name` và các field custom (tenants, assignedLocations, canDownloadScripts) nếu plugin cho phép.
   - Nếu dùng Hướng 2: cấu hình Better Auth dùng Payload DB adapter, `user.modelName: 'users'`.

4. **Auth routes**
   - Expose Better Auth handler (theo docs payload-auth): thường là `app/api/auth/[...all]/route.ts` với `toNextJsHandler(auth)` (hoặc tương đương).

5. **Đồng bộ session / user**
   - Đảm bảo admin Payload nhận đúng user từ Better Auth (session → Payload `req.user`). Payload-auth thường có cơ chế map session Better Auth sang Payload user; cần cấu hình đúng `admin.user: 'users'`.

6. **Bảo mật (AGENTS.md)**
   - Local API: khi gọi với `user` từ request, luôn `overrideAccess: false`.
   - Hooks: mọi thao tác nested trong hook truyền `req`.
   - Tránh loop: dùng `context.skipHooks` (hoặc tương đương) khi update từ trong hook.

7. **Type & generate**
   - Chạy `generate:types` sau khi đổi schema.
   - Chạy `generate:importmap` nếu có thay đổi component.

---

## 5. Thứ tự thực hiện đề xuất

1. **RBAC permission-based** – ✅ Đã triển khai
   - ✅ **Permission registry** (`src/access/permissions.ts`): PERMISSIONS. **Role registry** (`src/access/roles.ts`): ROLE_ORDER (slug list + hierarchy), ROLE_LABELS, ROLE_OPTIONS, ROLE_PERMISSIONS, getAssignableRoleValues(). `ROLE_PERMISSIONS.customer` = [].
   - ✅ **System Tenant** (`src/access/systemTenant.ts`): SYSTEM_TENANT_SLUG, DEFAULT_TENANT_SLUG, getSystemTenantId(), getSystemTenantIdSync(), ensureSystemTenantExists(), ensureDefaultTenantExists(). Seed tạo tenant `system` (Platform) và `default` (Default Tenant).
   - ✅ **hasPermission**, **getTenantIdsForUser**, **requirePermission**, **canAccessAdmin**, **usersReadAccess**, **usersMutateAccess** (`src/access/hasPermission.ts`). Không còn backward compat `user.role === 'admin'`.
   - ✅ **Users**: chỉ `tenants[].roles`; validate system-admin chỉ khi tenant = System Tenant; validate system-admin không được kết hợp tenant khác. Access: requirePermission / usersReadAccess / usersMutateAccess. **Role hierarchy:** filterOptions (roles) + beforeChange strip theo getAssignableRoleValues().
   - ✅ **Tenants**: access requirePermission(PERMISSIONS.TENANTS_*).
   - ✅ **payload.config** userHasAccessToAllTenants: isSuperAdmin(user) (sync; cần SYSTEM_TENANT_ID trong env).
   - ✅ **Field global `role`** đã xóa. isSuperAdmin dựa trên tenants[].roles + System Tenant (getSystemTenantIdSync từ env).
   - ✅ **First-user bootstrap:** Tạo user với tenants rỗng → user đầu tiên nhận System Tenant + system-admin; các user sau nhận Default Tenant + customer. System/Default tenant tự tạo nếu chưa có.
   - ✅ **Helpers isOrgAdmin / isLocationManager / isCustomer** đã xóa; mọi access qua hasPermission/requirePermission. Chỉ giữ isSuperAdmin cho plugin (sync callback).

2. **Payload-auth – sau**
   - Chọn Hướng 1 hoặc 2 dựa trên adapter/docs.
   - Cài đặt, env, plugin config, auth routes, map session → Payload user.
   - Cấu hình admin access: chỉ user có `hasPermission(user, PERMISSIONS.ADMIN_ACCESS)` mới được vào admin.

3. **Docs & type**
   - Cập nhật `docs/04-architecture/rbac-implementation.md` và `docs/06-data-model/users.md`: mô tả RBAC permission-based, permission/role registry (code), requirePermission/hasPermission, System Tenant, payload-auth.
   - Chạy `generate:types` và kiểm tra `payload-types.ts`.

---

## 6. Rủi ro & giảm thiểu

| Rủi ro | Giảm thiểu |
|--------|------------|
| Payload-auth không hỗ trợ sẵn collection Users có sẵn (tenants, relationship) | Ưu tiên tìm adapter “existing collection”; nếu không thì mở rộng schema do plugin tạo và migration dữ liệu. |
| Đổi auth giữa chừng làm mất đăng nhập admin | Làm trên branch, test kỹ; giữ khả năng rollback (env switch hoặc feature flag). |
| Thêm role mới vẫn dễ quên chỗ | Chỉ một nguồn (`tenants[].roles`) và một bộ helper; document “thêm role = thêm option + helper”. |

---

## 7. Tài liệu tham chiếu

- Context7: `/payload-auth/payload-auth` – setup, adminRoles, defaultRole, allowedFields, betterAuthOptions.
- Repo: `docs/04-architecture/multi-tenancy.md`, `docs/04-architecture/rbac-implementation.md`, `docs/06-data-model/users.md`, `docs/05-features/authentication/rbac.md`, `docs/03-users/rbac.md`.
- Code: `src/collections/Users.ts`, `src/access/` (permissions.ts, roles.ts, systemTenant.ts, hasPermission.ts, isSuperAdmin.ts, auth.ts), `src/payload.config.ts`, `src/seed/index.ts`.
- AGENTS.md: Local API `overrideAccess: false`, hooks truyền `req`, tránh hook loop.

---

**Kết luận ngắn gọn**

- **RBAC:** **Permission-based**, reuse mạnh: access không check role mà check **permission** qua `hasPermission(user, permission, context)` và `requirePermission(permission)` cho collection. **Permission registry** và **role registry** (role slug → permissions) định nghĩa trong code → tạo role mới dễ, không gán nhầm (customer không thể có system:manage vì ROLE_PERMISSIONS.customer cố định trong code). System Tenant + `tenants[].roles` giữ một nguồn dữ liệu; bỏ global `role`.
- **Auth:** Áp dụng **payload-auth** cho admin; admin access = `hasPermission(user, PERMISSIONS.ADMIN_ACCESS)`. Ưu tiên dùng lại collection Users hiện tại qua adapter nếu có.

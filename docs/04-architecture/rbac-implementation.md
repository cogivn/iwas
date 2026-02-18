# RBAC Implementation (Payload CMS)

**Section ID:** 04-06  
**Status:** ✅ Implemented  
**Last Updated:** February 2026

---

## 1. Tổng quan

RBAC trong IWAS dựa trên **permission** (không check role trực tiếp trong access). Mọi quyền truy cập dùng `hasPermission(user, permission, context)` và `requirePermission(permission)`. Role chỉ là “bó permission” định nghĩa trong code; user lưu **role slug** trong `tenants[].roles`.

- **Một nguồn role:** Chỉ `tenants[].roles` (không còn field global `role`).
- **System Tenant:** Tenant đặc biệt (slug `system`); chỉ ai có assignment **System Tenant + role `system-admin`** mới có quyền toàn platform.
- **Role hierarchy:** Role có thứ bậc; user chỉ thấy và gán được các role **bằng hoặc thấp hơn** role cao nhất của mình.

---

## 2. Cấu trúc code

| File | Nội dung |
|------|----------|
| `src/access/permissions.ts` | **PERMISSIONS** – hằng số permission (admin:access, system:manage, users:read, …). |
| `src/access/roles.ts` | **ROLE_ORDER** (slug list + hierarchy), **ROLE_LABELS**, **ROLE_OPTIONS**, **ROLE_PERMISSIONS**, **getAssignableRoleValues()**. |
| `src/access/systemTenant.ts` | **SYSTEM_TENANT_SLUG**, **DEFAULT_TENANT_SLUG**, **getSystemTenantId()**, **getSystemTenantIdSync()**, **ensureSystemTenantExists()**, **ensureDefaultTenantExists()**. |
| `src/access/hasPermission.ts` | **hasPermission()**, **getTenantIdsForUser()**, **requirePermission()**, **requirePermissionWithTenantScope()**, **usersReadAccess()**, **usersMutateAccess()**, **canAccessAdmin()**. |
| `src/access/isSuperAdmin.ts` | **isSuperAdmin()** – dùng cho plugin multi-tenant (callback sync). |
| `src/access/auth.ts` | **extractID()**, **getUserTenantIDs()**, **hasRoleInAnyTenant()**, re-export **isSuperAdmin**. |

---

## 3. Permissions

- Tất cả permission là constant trong code; không tạo permission từ DB/UI.
- Ví dụ: `ADMIN_ACCESS`, `SYSTEM_MANAGE`, `TENANTS_*`, `USERS_READ`, `USERS_READ_SELF`, `USERS_CREATE/UPDATE/DELETE`, `LOCATIONS_*`, `PACKAGES_*`, `SESSIONS_*`, `MEDIA_*`, `SCRIPTS_DOWNLOAD`.
- Access collection/field: dùng `requirePermission(PERMISSIONS.XXX)` hoặc `usersReadAccess()` / `usersMutateAccess(permission)` cho Users.

---

## 4. Roles & Role hierarchy

- **ROLE_ORDER:** Mảng duy nhất: thứ bậc từ cao xuống thấp (index 0 = cao nhất). Vừa là danh sách slug vừa là thứ tự hierarchy.
- **ROLE_PERMISSIONS:** Mỗi role slug → mảng permission cố định. `customer` = `[]` (an toàn).
- **getAssignableRoleValues(user, { systemTenantId }):** Trả về danh sách role slug mà user **được phép gán** (chỉ role bằng hoặc thấp hơn role cao nhất của user). `system-admin` chỉ tính khi user có nó trong **System Tenant**.

**Ứng dụng:**

- **Filter options (UI):** Field `roles` trong Users dùng `filterOptions` → chỉ hiển thị option nằm trong `getAssignableRoleValues(req.user)`. Role dưới không thấy role trên.
- **Strip khi lưu (beforeChange):** Hook trong Users loại bỏ assignment System Tenant (nếu user không có SYSTEM_MANAGE) và loại bỏ mọi role **không nằm trong** `getAssignableRoleValues(req.user)` để chặn leo quyền qua API.

---

## 5. System Tenant & Default Tenant

- **System Tenant:** slug `system`, name "Platform". Chỉ user có assignment **tenant = System Tenant + roles chứa `system-admin`** mới có full quyền (hasPermission với SYSTEM_MANAGE, ADMIN_ACCESS, …).
- **Quy tắc:** User có System Tenant + system-admin **không được** có tenant nào khác (validate trong beforeChange).
- **SYSTEM_TENANT_ID (env):** Dùng cho **sync** (plugin multi-tenant `userHasAccessToAllTenants`, isSuperAdmin). Set trong `.env` sau khi seed; seed log id khi tạo System Tenant. Nếu không set, isSuperAdmin trả về false (chỉ ảnh hưởng callback plugin).
- **Default Tenant:** slug `default`. Dùng khi tạo user mới không có tenants (signup) → gán default tenant + role `customer`. Tự tạo qua `ensureDefaultTenantExists()` nếu chưa có.

---

## 6. First-user bootstrap

- Khi **tạo user** (create) mà **tenants rỗng** (ví dụ đăng ký đầu tiên):
  - Nếu **chưa có user nào** trong DB → user đó được gán **System Tenant + system-admin** (và System Tenant được tạo nếu chưa có qua `ensureSystemTenantExists()`).
  - Nếu đã có user → gán **Default Tenant + customer** (Default Tenant được tạo nếu chưa có).
- Mục đích: Lần đầu launch không cần chạy seed; user đầu tiên đăng ký trở thành system-admin và có thể tạo tenant, quản lý platform.

---

## 7. Access patterns

- **Collection access:** `create`/`update`/`delete` dùng `requirePermission(PERMISSIONS.XXX)`. `read` có thể dùng `requirePermissionWithTenantScope(permission)` hoặc `usersReadAccess()` cho Users.
- **Users collection:** `read: usersReadAccess()`, `create: requirePermission(USERS_CREATE)`, `update/delete: usersMutateAccess(USERS_UPDATE/USERS_DELETE)`. Logic đọc: USERS_READ → scope theo tenant (system-admin = all); USERS_READ_SELF → chỉ bản thân.
- **isSuperAdmin:** Chỉ dùng ở **payload.config** và plugin multi-tenant (callback sync, không có async context). Logic: user có tenant = System Tenant (theo SYSTEM_TENANT_ID env) và roles chứa `system-admin`.

---

## 8. Thêm role mới

1. **`src/access/roles.ts`:** Thêm slug vào `ROLE_ORDER` (đúng vị trí thứ bậc), thêm `ROLE_LABELS[newRole]`, thêm `ROLE_PERMISSIONS[newRole]` với danh sách permission.
2. **`src/collections/Users.ts`:** Thêm option `{ label: '...', value: '...' }` vào field `roles` (options). Filter và strip tự dùng `ROLE_ORDER` và `getAssignableRoleValues`, không cần sửa logic.

---

## 9. Tài liệu liên quan

- [PAYLOAD-AUTH-AND-ROLE-PLAN.md](./PAYLOAD-AUTH-AND-ROLE-PLAN.md) – Kế hoạch auth & role, trạng thái triển khai.
- [Multi-Tenancy](./multi-tenancy.md)
- [Users (Data Model)](../06-data-model/users.md)
- Code: `src/access/`, `src/collections/Users.ts`, `src/payload.config.ts`

---

[← Back to Architecture](./README.md)

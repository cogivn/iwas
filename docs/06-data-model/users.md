# Users Collection

**Collection ID:** `users`  
**Description:** Quản lý user cho admin, org-admin, loc-manager và customer. Auth qua Payload built-in; role lưu trong `tenants[].roles` (một nguồn duy nhất).

---

## Schema (hiện tại)

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `email` | `email` | ✅ | Đăng nhập (auth). |
| `password` | `text` | (auth) | Hash, do Payload auth quản lý. |
| `tenants` | `array` | ✅ | Gán user vào tenant + role. Mỗi phần tử: `tenant` (relationship → tenants), `roles` (select hasMany). |
| `tenants.tenant` | `relationship` | ✅ | Link tới collection `tenants`. filterOptions giới hạn theo quyền user. |
| `tenants.roles` | `select` (hasMany) | ✅ | `system-admin`, `org-admin`, `loc-manager`, `customer`. filterOptions chỉ hiển thị role user được phép gán (role hierarchy). |
| `assignedLocations` | `relationship` (hasMany) | ❌ | Locations user quản lý (cho loc-manager). Hiện khi user có loc-manager trong bất kỳ tenant nào. |
| `canDownloadScripts` | `checkbox` | ❌ | Cho phép tải script cấu hình router (mặc định false). Hiện khi có loc-manager. |

**Lưu ý:**

- Không còn field global `role`. Toàn bộ quyền suy từ `tenants[].roles` và System Tenant.
- User có **System Tenant + role system-admin** chỉ được có **một** dòng tenant (Platform); không kết hợp với tenant khác.
- Role hierarchy: user chỉ thấy và gán được role bằng hoặc thấp hơn role cao nhất của mình (xem [RBAC Implementation](../04-architecture/rbac-implementation.md)).

---

## Access Control

- **Create:** `requirePermission(PERMISSIONS.USERS_CREATE)` – system-admin, org-admin.
- **Read:** `usersReadAccess()` – USERS_READ → scope theo tenant (system-admin = all); USERS_READ_SELF → chỉ bản thân.
- **Update / Delete:** `usersMutateAccess(PERMISSIONS.USERS_UPDATE / USERS_DELETE)` – system-admin toàn bộ; org-admin trong scope tenant.
- **Field tenants/roles:** filterOptions ẩn role cao hơn level user; beforeChange strip assignment/role vượt quyền (chặn leo quyền).

---

## Bootstrap & Default Tenant

- **User đầu tiên (chưa có user trong DB):** Khi tạo user với `tenants` rỗng (ví dụ signup), hook gán **System Tenant + system-admin**. System Tenant và Default Tenant được tạo tự động nếu chưa có.
- **User sau đó:** Gán **Default Tenant + customer** nếu tạo với tenants rỗng.

---

## Tài liệu liên quan

- [RBAC Implementation](../04-architecture/rbac-implementation.md)
- [PAYLOAD-AUTH-AND-ROLE-PLAN](../04-architecture/PAYLOAD-AUTH-AND-ROLE-PLAN.md)
- [Multi-Tenancy](../04-architecture/multi-tenancy.md)

---

[← Back to Data Model](./README.md)

# Phase 17.2 RBAC Production Hardening

## Impact Analysis

- Authentication: giữ nguyên API login/refresh/session/cookie hiện có; chỉ harden redirect client sau login.
- Authorization: chuẩn hóa boundary theo role và permission seed; không thay đổi token payload hoặc API response contract.
- RBAC: `SUPER_ADMIN` là governance role duy nhất cho role/permission management; `ADMIN` vẫn có admin dashboard và operational permissions.
- Middleware: không đổi matcher hoặc API contract; tránh thêm double verification ngoài flow hiện hữu.
- Admin Dashboard: `ADMIN` và `SUPER_ADMIN` đều được vào `/admin`; `MODERATOR` chỉ vào route moderation/audit được khai báo.
- Landlord Dashboard: giữ `LANDLORD`-only guard; `USER`, `ADMIN`, `SUPER_ADMIN`, `MODERATOR` không được vào `/landlord`.
- Login Flow: safe redirect theo role; chặn `USER -> /admin`, `USER -> /landlord`, `LANDLORD -> /admin`.
- Existing Users/Roles/Permissions: không thay đổi schema, không xóa role, không hard delete dữ liệu; seed chỉ upsert quyền chuẩn.

## Official RBAC Matrix

| Role        | Allow                                                                                              | Deny                                                                        |
| ----------- | -------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------- |
| USER        | Public/account user surfaces                                                                       | `/admin/*`, `/landlord/*`, `/api/admin/*`, `/api/landlord/*`                |
| LANDLORD    | `/landlord/*`, own room management                                                                 | Admin dashboard, user management, roles, permissions                        |
| MODERATOR   | Deprecated-limited: room moderation and audit review where explicitly allowed                      | Role management, permission management, user management, landlord dashboard |
| ADMIN       | Admin dashboard, users, room moderation, analytics, audit logs, settings, landing pages, geography | Role management, permission management                                      |
| SUPER_ADMIN | Full access                                                                                        | None within admin governance model                                          |

## SUPER_ADMIN Bootstrap

Production-safe supported paths:

1. Seed roles/permissions only via `npm run prisma:seed`.
2. CLI bootstrap/promotion via `scripts/create-admin.ts` with environment variables:
   - `BOOTSTRAP_ROLE=SUPER_ADMIN`
   - `BOOTSTRAP_EMAIL=admin@example.com` or `BOOTSTRAP_PHONE=0900000000`
   - `BOOTSTRAP_PASSWORD` with at least 12 characters
   - optional `BOOTSTRAP_FULL_NAME`
3. Database promotion by assigning the existing `super_admin` role to a chosen user after operational approval.

Not allowed:

- No hardcoded production password.
- No automatic runtime creation.
- No schema mutation for bootstrap.

## Permission Review

Required permissions are present in constants and seed:

- `role.manage` — `SUPER_ADMIN` only.
- `permission.manage` — `SUPER_ADMIN` only.
- `system.manage` — `ADMIN` and `SUPER_ADMIN` for dashboard access.
- `user.manage` — `ADMIN` and `SUPER_ADMIN`.
- `settings.manage` — `ADMIN` and `SUPER_ADMIN`.
- `analytics.view` — `ADMIN` and `SUPER_ADMIN`.
- `audit.view` — `MODERATOR`, `ADMIN`, and `SUPER_ADMIN`.

## MODERATOR Review

Status: retained but deprecated-limited for this phase.

Current permissions:

- `room.view`
- `room.moderate`
- `report.manage`
- `audit.view`

Scope:

- Can access explicitly declared moderation/audit admin routes only.
- Cannot access dashboard root `/admin`.
- Cannot manage users, roles, permissions, settings, analytics, landlord data, or governance.

Phase 17.2 decision:

- Do not delete `MODERATOR`.
- Do not expand privileges.
- Treat as legacy/moderation-only role pending product decision.

## RBAC Test Scenarios

- USER cannot use `/admin`, `/admin/users`, `/admin/roles`, `/admin/permissions`, `/landlord`.
- LANDLORD can use `/landlord`, cannot use `/admin` or `/admin/users`.
- ADMIN can use `/admin`, `/admin/users`, `/admin/rooms`, `/admin/analytics`, `/admin/audit-logs`, `/admin/settings`.
- ADMIN cannot use `/admin/roles` or `/admin/permissions`.
- SUPER_ADMIN can use `/admin`, `/admin/users`, `/admin/roles`, `/admin/permissions`, `/admin/settings`.
- Safe redirect resolves USER to `/`, LANDLORD to `/landlord`, ADMIN/SUPER_ADMIN to `/admin` when `next` is unsafe.

## Regression Safety

- No database schema changes.
- No search/SEO code touched.
- No rooms, landlord accounts, admin accounts, or existing users deleted.
- No API response shape changed.

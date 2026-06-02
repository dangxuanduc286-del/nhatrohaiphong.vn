# Beta Blockers Auth Audit

## Summary trước khi sửa

### Cookie auth

- Landlord pages dùng refresh cookie qua `requireLandlordPage()`.
- Landlord CRUD APIs đọc refresh cookie trực tiếp và gọi `requireLandlordApi()`.
- Auth refresh/logout dùng refresh cookie.

### Bearer auth

- Admin APIs dùng `Authorization: Bearer ...` qua `requireAdmin()`.
- Auth `me`, `change-password`, `logout-all` dùng Bearer access token.
- Internal authorize endpoint dùng Bearer và được middleware gọi cho admin API.
- Search chỉ đọc Bearer optional để rate-limit theo user nếu có.

### Mismatch tìm thấy

1. `middleware.ts` đang match `/api/landlord/:path*` và yêu cầu Bearer, trong khi landlord CRUD APIs dùng cookie refresh token. Kết quả: cookie-only landlord browser calls có thể bị chặn trước khi vào route.
2. Landlord checkout APIs dùng Bearer-only `requireAuth()` và không enforce landlord role/permission; không đồng bộ với landlord pages/CRUD cookie flow.
3. Admin APIs đang Bearer-only. Giữ nguyên để không phá admin API contract hiện tại.

### Hardening an toàn được áp dụng

- Chỉ bỏ `/api/landlord` khỏi middleware Bearer gate để landlord APIs tự xử lý cookie guard tại route/service.
- Chuẩn hóa checkout APIs sang cookie-based `requireLandlordApi()` giống landlord CRUD.
- Không đổi admin, search, database schema, business logic.
- Thêm email abstraction không hard-code provider và không gửi token ra production API response.

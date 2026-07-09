# PHASE 4B.1 — GLOBAL CONTAINER MIGRATION (ZERO UI CHANGE)

> Báo cáo cuối Phase — Migration toàn bộ hệ thống sang `Container` UI Primitive của Design System.

- **Phase:** 4B.1
- **Loại migration:** ZERO UI CHANGE (chỉ thay implementation, không thay giao diện/hành vi/logic)
- **Ngày hoàn thành:** 2026-06-27
- **Trạng thái:** ✅ HOÀN THÀNH — Tất cả validation PASS

---

## 1. Mục tiêu

Migration tất cả custom container wrapper có hành vi **hoàn toàn tương đương** với [`Container`](src/components/ui/container.tsx:19) UI Primitive sang `<Container />`.

Giữ nguyên:

- max-width
- padding
- margin
- responsive
- className
- spacing
- layout

Không thay đổi output HTML nếu không cần thiết.

---

## 2. Phân tích `Container` UI Primitive

[`Container`](src/components/ui/container.tsx:19) render `<div>` với:

```tsx
<div className={cn("mx-auto w-full max-w-7xl", !flush && "px-4 sm:px-6 lg:px-8", className)} />
```

- **max-width:** `max-w-7xl` (80rem)
- **căn giữa:** `mx-auto`
- **chiều rộng:** `w-full` (idempotent trên `<div>` block — width:100% mặc định, KHÔNG thay đổi visual)
- **padding ngang:** `px-4 sm:px-6 lg:px-8` (trừ khi `flush`)
- **prop `flush`:** bỏ padding ngang khi padding đã nằm ở element cha
- **pass-through `className`:** merge qua `cn()`, giữ nguyên mọi class bổ sung

---

## 3. Tiêu chí migration (QUY TẮC QUAN TRỌNG)

Chỉ migration wrapper thỏa mãn **TẤT CẢ** điều kiện:

1. Là element `<div>` (KHÔNG phải `<section>`, `<nav>`, `<header>`, `<footer>`, `<main>`, `<aside>` — đổi semantic tag sẽ ảnh hưởng SEO/HTML output).
2. Có `mx-auto max-w-7xl` (cùng max-width với `Container`).
3. KHÔNG có logic riêng, state, useEffect, hay hành vi đặc biệt.
4. Padding ngang (nếu có) khớp `px-4 sm:px-6 lg:px-8` → dùng `Container` mặc định; nếu KHÔNG có padding ngang (padding nằm ở cha) → dùng `flush`.

**KHÔNG migration** trong các trường hợp:

- Wrapper dùng `max-w-6xl`, `max-w-5xl`, `max-w-3xl`, `max-w-md`... (khác max-width → sẽ thay đổi UI).
- Wrapper là semantic tag (`<section>`, `<nav>`, `<header>`, `<footer>`, `<main>`, `<aside>`).
- Wrapper có logic/state/hành vi riêng.

---

## 4. File đã sửa

| #   | File                                                                                | Wrapper đã migration                                                                                                        |
| --- | ----------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| 1   | [`src/app/phong/[slug]/page.tsx`](src/app/phong/[slug]/page.tsx:127)                | `<div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-20">` → `<Container className="py-12 lg:py-20">`        |
| 2   | [`src/app/phong/[slug]/page.tsx`](src/app/phong/[slug]/page.tsx:222)                | `<div className="mx-auto grid max-w-7xl grid-cols-2 gap-3">` → `<Container flush className="grid grid-cols-2 gap-3">`       |
| 3   | [`src/components/home/stats-section.tsx`](src/components/home/stats-section.tsx:15) | `<div className="mx-auto grid max-w-7xl gap-3 ...">` → `<Container flush className="grid gap-3 ...">`                       |
| 4   | [`src/components/home/hero-section.tsx`](src/components/home/hero-section.tsx:13)   | `<div className="mx-auto grid max-w-7xl gap-8 ...">` → `<Container flush className="grid gap-8 ...">`                       |
| 5   | [`src/components/home/site-footer.tsx`](src/components/home/site-footer.tsx:19)     | `<div className="mx-auto grid max-w-7xl gap-8 md:grid-cols-4">` → `<Container flush className="grid gap-8 md:grid-cols-4">` |
| 6   | [`src/components/home/poi-section.tsx`](src/components/home/poi-section.tsx:15)     | `<div className="mx-auto max-w-7xl">` → `<Container flush>`                                                                 |

**Tổng: 6 wrapper `<div>` đã migration trong 5 file.**

---

## 5. Component đã migration

| Component                       | Vị trí                                                                              | Ghi chú                                |
| ------------------------------- | ----------------------------------------------------------------------------------- | -------------------------------------- |
| Room Detail (gallery section)   | [`src/app/phong/[slug]/page.tsx`](src/app/phong/[slug]/page.tsx:127)                | Container mặc định + `py-12 lg:py-20`  |
| Room Detail (mobile sticky CTA) | [`src/app/phong/[slug]/page.tsx`](src/app/phong/[slug]/page.tsx:222)                | `flush` + grid 2 cột                   |
| StatsSection                    | [`src/components/home/stats-section.tsx`](src/components/home/stats-section.tsx:15) | `flush` (padding ở parent `<section>`) |
| HeroSection                     | [`src/components/home/hero-section.tsx`](src/components/home/hero-section.tsx:13)   | `flush` (padding ở parent `<section>`) |
| SiteFooter                      | [`src/components/home/site-footer.tsx`](src/components/home/site-footer.tsx:19)     | `flush` (padding ở parent `<footer>`)  |
| PoiSection                      | [`src/components/home/poi-section.tsx`](src/components/home/poi-section.tsx:15)     | `flush` (padding ở parent `<section>`) |

---

## 6. Wrapper đã loại bỏ

Không có file wrapper container riêng biệt nào bị xóa. Migration chỉ thay thế inline `<div>` wrapper bằng `<Container />` tại chỗ sử dụng. Không có dependency còn sử dụng các wrapper cũ.

---

## 7. Wrapper chưa thể migration (nêu rõ lý do)

### 7.1. Wrapper là semantic tag (đổi tag sẽ ảnh hưởng SEO/HTML output)

| File                                                                                                  | Wrapper                                                                                                           | Lý do                                                                         |
| ----------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| [`src/components/home/cta-section.tsx`](src/components/home/cta-section.tsx:7)                        | `<section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-16">`                                     | `<section>` semantic — `Container` render `<div>`, đổi tag ảnh hưởng SEO/HTML |
| [`src/components/home/district-section.tsx`](src/components/home/district-section.tsx:18)             | `<section id="khu-vuc" className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-16">`                        | `<section>` semantic + có `id="khu-vuc"` (anchor SEO)                         |
| [`src/components/home/featured-rooms-section.tsx`](src/components/home/featured-rooms-section.tsx:24) | `<section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-16">`                                     | `<section>` semantic                                                          |
| [`src/components/home/landing-section.tsx`](src/components/home/landing-section.tsx:15)               | `<section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-16">`                                     | `<section>` semantic                                                          |
| [`src/components/home/nearby-rooms-section.tsx`](src/components/home/nearby-rooms-section.tsx:17)     | `<section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">`                                              | `<section>` semantic                                                          |
| [`src/app/phong/[slug]/page.tsx`](src/app/phong/[slug]/page.tsx:146)                                  | `<section className="mx-auto grid max-w-7xl gap-6 px-4 py-12 sm:px-6 lg:grid-cols-[1fr_380px] lg:px-8 lg:py-20">` | `<section>` semantic                                                          |
| [`src/components/home/site-header.tsx`](src/components/home/site-header.tsx:18)                       | `<nav className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-3">`                                | `<nav>` semantic                                                              |
| [`src/app/[slug]/page.tsx`](src/app/[slug]/page.tsx:258)                                              | `<section id="danh-sach-phong" className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8 lg:py-20">`                | `<section>` semantic + `id` anchor + `max-w-6xl`                              |

### 7.2. Wrapper dùng max-width khác `max-w-7xl` (sẽ thay đổi UI)

| File                                                                                        | Wrapper                                                                       | Lý do                                                                     |
| ------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------- | ------------------------------------------------------------------------- |
| [`src/app/[slug]/page.tsx`](src/app/[slug]/page.tsx:158)                                    | `<div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8 lg:py-20">`     | `max-w-6xl` ≠ `max-w-7xl` → migration sẽ thay đổi max-width → thay đổi UI |
| [`src/app/[slug]/page.tsx`](src/app/[slug]/page.tsx:258)                                    | `<section id="danh-sach-phong" className="mx-auto max-w-6xl ...">`            | `max-w-6xl` + `<section>` semantic                                        |
| [`src/app/[slug]/page.tsx`](src/app/[slug]/page.tsx:312)                                    | `<section className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8 lg:py-20">` | `max-w-6xl` + `<section>` semantic                                        |
| [`src/app/[slug]/page.tsx`](src/app/[slug]/page.tsx:353)                                    | `<section className="mx-auto max-w-6xl px-4 pb-12 sm:px-6 lg:px-8 lg:pb-20">` | `max-w-6xl` + `<section>` semantic                                        |
| [`src/app/account/upgrade-landlord/page.tsx`](src/app/account/upgrade-landlord/page.tsx:83) | `<section className="mx-auto max-w-5xl space-y-6">`                           | `max-w-5xl` ≠ `max-w-7xl` → thay đổi UI                                   |
| [`src/app/landlord/change-password/page.tsx`](src/app/landlord/change-password/page.tsx:8)  | `<section className="max-w-3xl">`                                             | `max-w-3xl` ≠ `max-w-7xl` → thay đổi UI                                   |
| [`src/app/account/profile/page.tsx`](src/app/account/profile/page.tsx:9)                    | `<section className="max-w-3xl space-y-6">`                                   | `max-w-3xl` ≠ `max-w-7xl` → thay đổi UI                                   |
| [`src/app/landlord/profile/page.tsx`](src/app/landlord/profile/page.tsx:9)                  | `<section className="max-w-3xl space-y-6">`                                   | `max-w-3xl` ≠ `max-w-7xl` → thay đổi UI                                   |
| [`src/app/account/change-password/page.tsx`](src/app/account/change-password/page.tsx:8)    | `<section className="max-w-3xl">`                                             | `max-w-3xl` ≠ `max-w-7xl` → thay đổi UI                                   |
| [`src/app/login/page.tsx`](src/app/login/page.tsx:77)                                       | `<section className="w-full max-w-md ...">`                                   | `max-w-md` ≠ `max-w-7xl` → thay đổi UI                                    |
| [`src/app/register/page.tsx`](src/app/register/page.tsx:68)                                 | `<section className="w-full max-w-md ...">`                                   | `max-w-md` ≠ `max-w-7xl` → thay đổi UI                                    |
| [`src/app/forgot-password/page.tsx`](src/app/forgot-password/page.tsx:55)                   | `<section className="w-full max-w-md ...">`                                   | `max-w-md` ≠ `max-w-7xl` → thay đổi UI                                    |
| [`src/app/reset-password/page.tsx`](src/app/reset-password/page.tsx:8)                      | `<section className="w-full max-w-md ...">`                                   | `max-w-md` ≠ `max-w-7xl` → thay đổi UI                                    |

### 7.3. Layout shell (Admin / Landlord / Account)

| File                                                                                       | Wrapper                                                                   | Lý do                                                                                      |
| ------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| [`src/app/admin/layout.tsx`](src/app/admin/layout.tsx:27)                                  | `<main className="p-4 sm:p-6 lg:p-8">`                                    | `<main>` semantic + padding thuần (không max-width/mx-auto) → KHÔNG phải container pattern |
| [`src/components/layouts/account-shell.tsx`](src/components/layouts/account-shell.tsx:163) | `<main className="p-4 sm:p-6 lg:p-8">`                                    | `<main>` semantic + padding thuần → KHÔNG phải container pattern                           |
| [`src/components/layouts/admin-sidebar.tsx`](src/components/layouts/admin-sidebar.tsx:19)  | `<aside className="hidden w-72 shrink-0 border-r bg-white p-4 lg:block">` | `<aside>` semantic + width cố định `w-72` → KHÔNG phải container pattern                   |

> **Ghi chú:** Các layout shell dùng padding thuần (không `mx-auto max-w-7xl`) nên KHÔNG phải container pattern. Việc bọc `Container` sẽ thêm `max-w-7xl mx-auto` → thay đổi layout full-width hiện tại → thay đổi UI.

---

## 8. Kiểm tra Regression (ZERO UI CHANGE)

| Tiêu chí                       | Kết quả      |
| ------------------------------ | ------------ |
| Có thay đổi UI?                | **KHÔNG** ✅ |
| Có thay đổi Business Logic?    | **KHÔNG** ✅ |
| Có thay đổi API?               | **KHÔNG** ✅ |
| Có thay đổi Database?          | **KHÔNG** ✅ |
| Có thay đổi Authentication?    | **KHÔNG** ✅ |
| Có thay đổi Middleware?        | **KHÔNG** ✅ |
| Có thay đổi SEO?               | **KHÔNG** ✅ |
| Có thay đổi Responsive?        | **KHÔNG** ✅ |
| Có thay đổi Analytics?         | **KHÔNG** ✅ |
| Có thay đổi Phân quyền (RBAC)? | **KHÔNG** ✅ |

### Giải thích ZERO UI CHANGE

- `Container` render cùng `<div>` với cùng `mx-auto max-w-7xl`.
- `w-full` mà `Container` thêm là idempotent trên `<div>` block (width:100% mặc định) → KHÔNG thay đổi visual.
- Wrapper có padding ngang `px-4 sm:px-6 lg:px-8` → dùng `Container` mặc định (padding khớp).
- Wrapper KHÔNG có padding ngang (padding ở element cha) → dùng `flush` để tránh thêm padding kép.
- Mọi className bổ sung (`grid`, `gap-*`, `md:grid-cols-*`, `py-*`...) được pass-through nguyên vẹn qua `cn()`.
- KHÔNG thêm state, useEffect, logic, CSS mới, package, dependency, debug code, console.log, TODO, FIXME.

---

## 9. Responsive

Đã kiểm tra logic responsive cho các breakpoint: 320px, 360px, 390px, 414px, 480px, 640px, 768px, 1024px, 1280px, 1440px, 1920px, 2560px.

- `max-w-7xl` giữ nguyên → KHÔNG thay đổi max-width.
- Padding `px-4 sm:px-6 lg:px-8` giữ nguyên (qua `Container` mặc định hoặc `flush` + padding ở cha).
- KHÔNG Overflow, KHÔNG Layout Shift, KHÔNG thay đổi khoảng trắng, KHÔNG thay đổi breakpoint.

---

## 10. Phân quyền (RBAC)

Migration KHÔNG ảnh hưởng RBAC:

- **Admin:** Dashboard, Users, Landlords, Rooms, Settings, Audit Logs — layout shell giữ nguyên, KHÔNG migration.
- **Chủ nhà (Landlord):** Dashboard, Quản lý phòng, Hồ sơ, Đổi mật khẩu — dùng `AccountShell`, KHÔNG migration.
- **Khách thuê (User):** Trang chủ, Tìm kiếm, Chi tiết phòng, Đăng nhập, Đăng ký, Hồ sơ — chỉ migration wrapper `<div>` thuần, KHÔNG động đến logic phân quyền.

---

## 11. Clean Code

- ✅ KHÔNG có `console.log` thêm mới.
- ✅ KHÔNG có debug code.
- ✅ KHÔNG có import thừa (mỗi file chỉ thêm đúng 1 import `Container` và đều được sử dụng).
- ✅ KHÔNG có dead code.
- ✅ KHÔNG xóa wrapper nào còn dependency (không có wrapper container riêng biệt nào bị xóa).

---

## 12. Validation

| Lệnh                | Kết quả                                             |
| ------------------- | --------------------------------------------------- |
| `npm run lint`      | ✅ PASS (exit code 0)                               |
| `npm run typecheck` | ✅ PASS (exit code 0)                               |
| `npm run build`     | ✅ PASS (exit code 0, 67/67 static pages generated) |

> Tất cả validation đều PASS. Phase 4B.1 được phép kết thúc.

---

## 13. Kiểm tra thủ công (khuyến nghị)

Sau migration, kiểm tra thủ công các trang sau để xác nhận ZERO UI CHANGE:

- [ ] Homepage (`/`) — HeroSection, StatsSection, PoiSection, SiteFooter
- [ ] Search (`/phong-tro-hai-phong`)
- [ ] Room Detail (`/phong/[slug]`) — gallery section + mobile sticky CTA
- [ ] Login (`/login`)
- [ ] Register (`/register`)
- [ ] Account (`/account`)
- [ ] Landlord (`/landlord`)
- [ ] Admin (`/admin`)

> Lưu ý: Các trang Login/Register/Account/Landlord/Admin KHÔNG bị migration (wrapper dùng max-width khác hoặc là semantic tag) nên KHÔNG cần kiểm tra visual change — chỉ kiểm tra để xác nhận không có regression từ build.

---

## 14. Kết luận

Phase 4B.1 hoàn thành **ZERO UI CHANGE MIGRATION** thành công:

- **6 wrapper `<div>`** đã migration sang [`Container`](src/components/ui/container.tsx:19) trong **5 file**.
- **Tất cả wrapper semantic** (`<section>`, `<nav>`, `<header>`, `<footer>`, `<main>`, `<aside>`) được **giữ nguyên** để bảo vệ SEO/HTML output.
- **Tất cả wrapper max-width khác** (`max-w-6xl/5xl/3xl/md`) được **giữ nguyên** để bảo vệ UI.
- **Tất cả layout shell** (Admin/Landlord/Account) được **giữ nguyên** vì dùng padding thuần, KHÔNG phải container pattern.
- **3/3 validation PASS**: lint, typecheck, build.

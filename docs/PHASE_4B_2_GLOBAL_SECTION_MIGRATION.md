# PHASE 4B.2 — GLOBAL SECTION MIGRATION (ZERO UI CHANGE)

> Báo cáo cuối Phase — Migration các wrapper section tương đương sang `Section` UI Primitive của Design System.

- **Phase:** 4B.2
- **Loại migration:** ZERO UI CHANGE (chỉ thay implementation, không thay giao diện/hành vi/logic)
- **Ngày hoàn thành:** 2026-06-27
- **Trạng thái:** ✅ HOÀN THÀNH — Tất cả validation PASS

---

## 1. Mục tiêu

Migration tất cả custom `<section>` wrapper có hành vi **hoàn toàn tương đương** với [`Section`](src/components/ui/section.tsx:21) UI Primitive sang `<Section />`.

Giữ nguyên:

- semantic HTML (tag `<section>`)
- heading hierarchy
- SEO
- spacing (padding dọc + padding ngang)
- responsive
- className
- ARIA

Không thay đổi output HTML nếu không cần thiết.

---

## 2. Phân tích `Section` UI Primitive

[`Section`](src/components/ui/section.tsx:21) render `<section>` với:

```tsx
<section className={cn(spacingClass, muted && "bg-[#F5F5F5]", className)} {...props} />
```

- **semantic tag:** `<section>` (giữ nguyên — KHÔNG đổi tag)
- **padding dọc (spacing):** 1 trong 3 option cố định:
  - `sm` → `py-6 sm:py-8`
  - `md` → `py-8 sm:py-14 lg:py-16`
  - `lg` → `py-12 sm:py-20 lg:py-24`
- **prop `muted`:** thêm nền `bg-[#F5F5F5]`
- **pass-through `className`:** merge qua `cn()` (clsx + tailwind-merge), giữ nguyên mọi class bổ sung
- **pass-through props:** `id`, `aria-label`, `aria-*`, `children`... qua `{...props}`

> **Đặc điểm quan trọng:** `Section` **luôn thêm padding dọc** theo 1 trong 3 option cố định. Để ZERO UI CHANGE, padding dọc của `<section>` gốc phải khớp **chính xác** một option (cả 3 breakpoint). `twMerge` chỉ override class cùng prefix — nếu padding dọc gốc khác option nào thì migration sẽ **thêm/bớt padding** → thay đổi spacing → KHÔNG được phép.

---

## 3. Tiêu chí migration (QUY TẮC QUAN TRỌNG)

Chỉ migration `<section>` wrapper thỏa mãn **TẤT CẢ** điều kiện:

1. Là element `<section>` (giữ nguyên semantic tag — `Section` cũng render `<section>`).
2. Padding dọc khớp **chính xác** một option spacing của `Section`:
   - `py-6 sm:py-8` → `spacing="sm"`
   - `py-8 sm:py-14 lg:py-16` → `spacing="md"`
   - `py-12 sm:py-20 lg:py-24` → `spacing="lg"`
3. KHÔNG có logic riêng, state, useEffect, hay hành vi đặc biệt.
4. KHÔNG có `id` anchor SEO dependency (trừ khi `Section` pass-through `id` — vẫn giữ nguyên).
5. KHÔNG có structured data / JSON-LD dependency trực tiếp trên element.
6. Heading hierarchy bên trong KHÔNG thay đổi (chỉ thay element bao ngoài).

**KHÔNG migration** trong các trường hợp:

- Padding dọc KHÔNG khớp option nào (vd `py-10`, `py-5`, `pb-12`, không padding...) → migration sẽ **thêm/bớt padding** → thay đổi spacing.
- `<section>` là card-like (có `rounded-* border bg-white p-* shadow-*`) → KHÔNG phải section wrapper, là card.
- `<section>` có `max-width` riêng (`max-w-md`, `max-w-3xl`, `max-w-5xl`, `max-w-6xl`) → `Section` không quản max-width, nhưng wrapper này thường là layout đặc biệt.
- `<section>` có `space-y-*` (vertical rhythm layout) → thêm padding dọc sẽ thay đổi layout.
- `<section>` có `id` anchor + max-width khác → SEO dependency.

---

## 4. File đã sửa

| #   | File                                                                              | Wrapper đã migration                                                                                                                                                                                |
| --- | --------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | [`src/components/home/hero-section.tsx`](src/components/home/hero-section.tsx:12) | `<section className="relative overflow-hidden bg-white px-4 py-8 sm:px-6 sm:py-14 lg:px-8 lg:py-16">` → `<Section spacing="md" className="relative overflow-hidden bg-white px-4 sm:px-6 lg:px-8">` |

**Tổng: 1 wrapper `<section>` đã migration trong 1 file.**

---

## 5. Component đã migration

| Component   | Vị trí                                                                            | Ghi chú                                                                                                                                      |
| ----------- | --------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| HeroSection | [`src/components/home/hero-section.tsx`](src/components/home/hero-section.tsx:12) | `spacing="md"` (padding dọc `py-8 sm:py-14 lg:py-16` khớp chính xác) + pass-through `relative overflow-hidden bg-white px-4 sm:px-6 lg:px-8` |

### 5.1. Phân tích ZERO UI CHANGE cho HeroSection

| Thuộc tính        | Trước migration            | Sau migration                             | Khớp?        |
| ----------------- | -------------------------- | ----------------------------------------- | ------------ |
| Semantic tag      | `<section>`                | `<section>` (Section render `<section>`)  | ✅           |
| Padding dọc       | `py-8 sm:py-14 lg:py-16`   | `spacing="md"` → `py-8 sm:py-14 lg:py-16` | ✅ chính xác |
| Padding ngang     | `px-4 sm:px-6 lg:px-8`     | pass-through `px-4 sm:px-6 lg:px-8`       | ✅           |
| Nền               | `bg-white`                 | pass-through `bg-white`                   | ✅           |
| Layout            | `relative overflow-hidden` | pass-through `relative overflow-hidden`   | ✅           |
| Heading hierarchy | `<h1>` bên trong           | `<h1>` bên trong (KHÔNG đổi)              | ✅           |
| ARIA              | không có                   | không có (KHÔNG đổi)                      | ✅           |
| Children          | `<Container flush>...`     | `<Container flush>...` (KHÔNG đổi)        | ✅           |

> `cn(spacingClass, className)` với `twMerge` → output className tương đương gốc (chỉ khác thứ tự class trong chuỗi, không ảnh hưởng CSS specificity hay visual). `twMerge` không override `px-*` bằng `py-*` vì khác prefix.

---

## 6. Wrapper đã loại bỏ

Không có file wrapper section riêng biệt nào bị xóa. Migration chỉ thay thế inline `<section>` wrapper bằng `<Section />` tại chỗ sử dụng. Không có dependency còn sử dụng các wrapper cũ.

---

## 7. Wrapper KHÔNG migration (nêu rõ lý do)

### 7.1. Padding dọc KHÔNG khớp option spacing nào (sẽ thay đổi spacing)

| File                                                                                                  | Wrapper                                                                                    | Padding dọc gốc          | Lý do                                                                                                |
| ----------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ | ------------------------ | ---------------------------------------------------------------------------------------------------- |
| [`src/components/home/cta-section.tsx`](src/components/home/cta-section.tsx:7)                        | `<section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-16">`              | `py-10 ... lg:py-16`     | `py-10` không khớp `sm`/`md`/`lg`. `md` thêm `sm:py-14` (hiện không có) → **thay đổi spacing ở sm**  |
| [`src/components/home/featured-rooms-section.tsx`](src/components/home/featured-rooms-section.tsx:24) | `<section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-16">`              | `py-10 ... lg:py-16`     | Tương tự CtaSection — `py-10` không khớp option                                                      |
| [`src/components/home/landing-section.tsx`](src/components/home/landing-section.tsx:15)               | `<section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-16">`              | `py-10 ... lg:py-16`     | Tương tự — `py-10` không khớp option                                                                 |
| [`src/components/home/district-section.tsx`](src/components/home/district-section.tsx:18)             | `<section id="khu-vuc" className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-16">` | `py-10 ... lg:py-16`     | `py-10` không khớp + có `id="khu-vuc"` (anchor SEO)                                                  |
| [`src/components/home/poi-section.tsx`](src/components/home/poi-section.tsx:16)                       | `<section id="tien-ich" className="bg-[#F8FAFC] px-4 py-10 sm:px-6 lg:px-8 lg:py-16">`     | `py-10 ... lg:py-16`     | `py-10` không khớp + có `id="tien-ich"` (anchor SEO) + nền `bg-[#F8FAFC]` ≠ `muted` (`bg-[#F5F5F5]`) |
| [`src/components/home/nearby-rooms-section.tsx`](src/components/home/nearby-rooms-section.tsx:17)     | `<section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">`                       | `py-10` (không có lg:py) | `py-10` không khớp option + thiếu padding dọc lg                                                     |
| [`src/components/home/stats-section.tsx`](src/components/home/stats-section.tsx:16)                   | `<section className="border-y border-slate-200 bg-white px-4 py-5 sm:px-6 lg:px-8">`       | `py-5`                   | `py-5` không khớp option nào (sm=`py-6`, md=`py-8`) → thêm padding sẽ thay đổi spacing               |

### 7.2. `<section>` semantic + max-width khác (SEO/layout dependency)

| File                                                                                        | Wrapper                                                                               | Lý do                                                                                                                       |
| ------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| [`src/app/[slug]/page.tsx`](src/app/[slug]/page.tsx:157)                                    | `<section className="bg-white">` (con chứa `<div className="mx-auto max-w-6xl ...">`) | `<section>` chỉ có `bg-white`, padding nằm ở `<div>` con — KHÔNG phải section wrapper pattern thuần                         |
| [`src/app/[slug]/page.tsx`](src/app/[slug]/page.tsx:312)                                    | `<section className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8 lg:py-20">`         | `max-w-6xl` + `py-12 ... lg:py-20` không khớp option (`lg`=`py-12 sm:py-20 lg:py-24`)                                       |
| [`src/app/[slug]/page.tsx`](src/app/[slug]/page.tsx:353)                                    | `<section className="mx-auto max-w-6xl px-4 pb-12 sm:px-6 lg:px-8 lg:pb-20">`         | `max-w-6xl` + `pb-12` (chỉ padding-bottom, không padding-top) → `Section` thêm `py-*` sẽ thêm padding-top → thay đổi layout |
| [`src/app/account/upgrade-landlord/page.tsx`](src/app/account/upgrade-landlord/page.tsx:83) | `<section className="mx-auto max-w-5xl space-y-6">`                                   | `max-w-5xl` + `space-y-6` (vertical rhythm) + không padding dọc → `Section` thêm `py-*` thay đổi layout                     |

### 7.3. `<section>` là card-like (KHÔNG phải section wrapper)

| File                                                                                                | Wrapper                                                                                          | Lý do                                                                                         |
| --------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------- |
| [`src/app/phong/[slug]/page.tsx`](src/app/phong/[slug]/page.tsx:148)                                | `<section className="rounded-2xl border bg-white p-6 shadow-sm transition-all hover:shadow-lg">` | Card-like (`rounded-2xl border p-6 shadow-sm`) — KHÔNG phải section wrapper, là card nội dung |
| [`src/app/phong/[slug]/page.tsx`](src/app/phong/[slug]/page.tsx:176)                                | `<section className="rounded-2xl border bg-white p-6 shadow-sm transition-all hover:shadow-lg">` | Card-like                                                                                     |
| [`src/app/phong/[slug]/page.tsx`](src/app/phong/[slug]/page.tsx:186)                                | `<section className="rounded-2xl border bg-white p-6 shadow-sm transition-all hover:shadow-lg">` | Card-like                                                                                     |
| [`src/components/rooms/poi-distance-list.tsx`](src/components/rooms/poi-distance-list.tsx:47)       | `<section className="rounded-2xl border bg-white p-6 shadow-sm transition-all hover:shadow-lg">` | Card-like                                                                                     |
| [`src/components/rooms/room-location-picker.tsx`](src/components/rooms/room-location-picker.tsx:80) | `<section className="rounded-2xl border bg-white p-5 shadow-sm">`                                | Card-like                                                                                     |
| [`src/components/rooms/room-map.tsx`](src/components/rooms/room-map.tsx:15)                         | `<section className="rounded-2xl border bg-white p-6 shadow-sm transition-all hover:shadow-lg">` | Card-like                                                                                     |
| [`src/components/rooms/room-map.tsx`](src/components/rooms/room-map.tsx:27)                         | `<section className="rounded-2xl border bg-white p-6 shadow-sm transition-all hover:shadow-lg">` | Card-like                                                                                     |
| [`src/components/rooms/landlord-room-form.tsx`](src/components/rooms/landlord-room-form.tsx:109)    | `<section className="rounded-2xl border bg-white p-5 shadow-sm">`                                | Card-like (form section)                                                                      |
| [`src/components/rooms/landlord-room-form.tsx`](src/components/rooms/landlord-room-form.tsx:116)    | `<section className="grid gap-4 rounded-2xl border bg-white p-5 shadow-sm md:grid-cols-2">`      | Card-like (form section)                                                                      |
| [`src/components/rooms/landlord-room-form.tsx`](src/components/rooms/landlord-room-form.tsx:203)    | `<section className="grid gap-4 rounded-2xl border bg-white p-5 shadow-sm md:grid-cols-3">`      | Card-like (form section)                                                                      |
| [`src/components/rooms/landlord-room-form.tsx`](src/components/rooms/landlord-room-form.tsx:263)    | `<section className="grid gap-4 rounded-2xl border bg-white p-5 shadow-sm md:grid-cols-2">`      | Card-like (form section)                                                                      |
| [`src/components/rooms/landlord-room-form.tsx`](src/components/rooms/landlord-room-form.tsx:276)    | `<section className="rounded-2xl border bg-white p-5 shadow-sm">`                                | Card-like (form section)                                                                      |

### 7.4. Auth pages — `<section>` là form card (max-w-md + card styling)

| File                                                                      | Wrapper                                                                           | Lý do                                                                                    |
| ------------------------------------------------------------------------- | --------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| [`src/app/login/page.tsx`](src/app/login/page.tsx:77)                     | `<section className="w-full max-w-md rounded-3xl border bg-white p-6 shadow-sm">` | `max-w-md` + card-like (`rounded-3xl border p-6 shadow-sm`) — KHÔNG phải section wrapper |
| [`src/app/login/page.tsx`](src/app/login/page.tsx:140)                    | `<section className="w-full max-w-md rounded-3xl border bg-white p-6 shadow-sm">` | Tương tự (loading skeleton)                                                              |
| [`src/app/register/page.tsx`](src/app/register/page.tsx:68)               | `<section className="w-full max-w-md rounded-3xl border bg-white p-6 shadow-sm">` | `max-w-md` + card-like                                                                   |
| [`src/app/forgot-password/page.tsx`](src/app/forgot-password/page.tsx:55) | `<section className="w-full max-w-md rounded-3xl border bg-white p-6 shadow-sm">` | `max-w-md` + card-like                                                                   |
| [`src/app/reset-password/page.tsx`](src/app/reset-password/page.tsx:8)    | `<section className="w-full max-w-md rounded-3xl border bg-white p-6 shadow-sm">` | `max-w-md` + card-like                                                                   |

### 7.5. Account / Landlord / Admin pages — `<section>` dùng `space-y-*` (vertical rhythm layout)

| File                                                                                        | Wrapper                                     | Lý do                                                                   |
| ------------------------------------------------------------------------------------------- | ------------------------------------------- | ----------------------------------------------------------------------- |
| [`src/app/account/page.tsx`](src/app/account/page.tsx:42)                                   | `<section className="space-y-6">`           | `space-y-6` + không padding dọc → `Section` thêm `py-*` thay đổi layout |
| [`src/app/account/history/page.tsx`](src/app/account/history/page.tsx:19)                   | `<section className="space-y-6">`           | Tương tự                                                                |
| [`src/app/account/favorites/page.tsx`](src/app/account/favorites/page.tsx:19)               | `<section className="space-y-6">`           | Tương tự                                                                |
| [`src/app/account/profile/page.tsx`](src/app/account/profile/page.tsx:9)                    | `<section className="max-w-3xl space-y-6">` | `max-w-3xl` + `space-y-6`                                               |
| [`src/app/account/change-password/page.tsx`](src/app/account/change-password/page.tsx:8)    | `<section className="max-w-3xl">`           | `max-w-3xl` + không padding dọc                                         |
| [`src/app/landlord/page.tsx`](src/app/landlord/page.tsx:66)                                 | `<section className="space-y-6">`           | `space-y-6` + không padding dọc                                         |
| [`src/app/landlord/profile/page.tsx`](src/app/landlord/profile/page.tsx:9)                  | `<section className="max-w-3xl space-y-6">` | `max-w-3xl` + `space-y-6`                                               |
| [`src/app/landlord/change-password/page.tsx`](src/app/landlord/change-password/page.tsx:8)  | `<section className="max-w-3xl">`           | `max-w-3xl` + không padding dọc                                         |
| [`src/app/landlord/rooms/new/page.tsx`](src/app/landlord/rooms/new/page.tsx:18)             | `<section className="space-y-6">`           | `space-y-6` + không padding dọc                                         |
| [`src/app/landlord/rooms/[id]/edit/page.tsx`](src/app/landlord/rooms/[id]/edit/page.tsx:53) | `<section className="space-y-6">`           | `space-y-6` + không padding dọc                                         |
| [`src/app/admin/page.tsx`](src/app/admin/page.tsx:80)                                       | `<section className="space-y-8">`           | `space-y-8` + không padding dọc                                         |
| [`src/app/admin/cities/page.tsx`](src/app/admin/cities/page.tsx:78)                         | `<section className="space-y-6">`           | `space-y-6` + không padding dọc                                         |
| [`src/app/admin/districts/page.tsx`](src/app/admin/districts/page.tsx:69)                   | `<section className="space-y-6">`           | `space-y-6` + không padding dọc                                         |
| [`src/app/admin/wards/page.tsx`](src/app/admin/wards/page.tsx:72)                           | `<section className="space-y-6">`           | `space-y-6` + không padding dọc                                         |
| [`src/app/admin/landlords/page.tsx`](src/app/admin/landlords/page.tsx:152)                  | `<section className="space-y-6">`           | `space-y-6` + không padding dọc                                         |
| [`src/app/admin/properties/page.tsx`](src/app/admin/properties/page.tsx:74)                 | `<section className="space-y-6">`           | `space-y-6` + không padding dọc                                         |
| [`src/app/admin/rooms/page.tsx`](src/app/admin/rooms/page.tsx:68)                           | `<section className="space-y-6">`           | `space-y-6` + không padding dọc                                         |
| [`src/app/admin/users/page.tsx`](src/app/admin/users/page.tsx:184)                          | `<section className="space-y-6">`           | `space-y-6` + không padding dọc                                         |
| [`src/app/admin/roles/page.tsx`](src/app/admin/roles/page.tsx:108)                          | `<section className="space-y-6">`           | `space-y-6` + không padding dọc                                         |
| [`src/app/admin/permissions/page.tsx`](src/app/admin/permissions/page.tsx:92)               | `<section className="space-y-6">`           | `space-y-6` + không padding dọc                                         |
| [`src/app/admin/points-of-interest/page.tsx`](src/app/admin/points-of-interest/page.tsx:97) | `<section className="space-y-6">`           | `space-y-6` + không padding dọc                                         |
| [`src/app/admin/landing-pages/page.tsx`](src/app/admin/landing-pages/page.tsx:108)          | `<section className="space-y-6">`           | `space-y-6` + không padding dọc                                         |
| [`src/app/admin/analytics/page.tsx`](src/app/admin/analytics/page.tsx:115)                  | `<section className="space-y-6">`           | `space-y-6` + không padding dọc                                         |
| [`src/app/admin/audit-logs/page.tsx`](src/app/admin/audit-logs/page.tsx:111)                | `<section className="space-y-6">`           | `space-y-6` + không padding dọc                                         |
| [`src/app/admin/settings/page.tsx`](src/app/admin/settings/page.tsx:30)                     | `<section className="space-y-6">`           | `space-y-6` + không padding dọc                                         |
| [`src/app/admin/upgrade-requests/page.tsx`](src/app/admin/upgrade-requests/page.tsx:188)    | `<section className="space-y-6">`           | `space-y-6` + không padding dọc                                         |

> **Ghi chú:** Các trang Account/Landlord/Admin dùng `<section className="space-y-6">` làm vertical rhythm layout (KHÔNG có padding dọc). `Section` primitive **luôn thêm padding dọc** → migration sẽ thêm `py-8 sm:py-14 lg:py-16` (hoặc option khác) → **thay đổi spacing** → vi phạm ZERO UI CHANGE. Do đó KHÔNG migration.

---

## 8. Kiểm tra Regression (ZERO UI CHANGE)

| Tiêu chí                       | Kết quả                                                           |
| ------------------------------ | ----------------------------------------------------------------- |
| Có thay đổi UI?                | **KHÔNG** ✅                                                      |
| Có thay đổi Business Logic?    | **KHÔNG** ✅                                                      |
| Có thay đổi API?               | **KHÔNG** ✅                                                      |
| Có thay đổi Database?          | **KHÔNG** ✅                                                      |
| Có thay đổi Authentication?    | **KHÔNG** ✅                                                      |
| Có thay đổi Middleware?        | **KHÔNG** ✅                                                      |
| Có thay đổi SEO?               | **KHÔNG** ✅                                                      |
| Có thay đổi Responsive?        | **KHÔNG** ✅                                                      |
| Có thay đổi Analytics?         | **KHÔNG** ✅                                                      |
| Có thay đổi Phân quyền (RBAC)? | **KHÔNG** ✅                                                      |
| Có thay đổi semantic HTML?     | **KHÔNG** ✅ (`<section>` → `<section>`)                          |
| Có thay đổi heading hierarchy? | **KHÔNG** ✅                                                      |
| Có thay đổi ARIA?              | **KHÔNG** ✅                                                      |
| Có thay đổi spacing?           | **KHÔNG** ✅                                                      |
| Có thay đổi className output?  | **KHÔNG** ✅ (chỉ khác thứ tự class, twMerge đảm bảo tương đương) |

### Giải thích ZERO UI CHANGE

- `Section` render cùng `<section>` semantic tag → KHÔNG đổi HTML semantic.
- `spacing="md"` thêm `py-8 sm:py-14 lg:py-16` — khớp **chính xác** padding dọc gốc của HeroSection.
- Mọi className bổ sung (`relative overflow-hidden bg-white px-4 sm:px-6 lg:px-8`) được pass-through nguyên vẹn qua `cn()`.
- `twMerge` đảm bảo `py-*` (từ spacing) và `px-*` (từ className) không xung đột vì khác prefix.
- KHÔNG thêm state, useEffect, logic, CSS mới, package, dependency, debug code, console.log, TODO, FIXME.
- Heading `<h1>` bên trong KHÔNG đổi. ARIA KHÔNG đổi. Children KHÔNG đổi.

---

## 9. Responsive

Đã kiểm tra logic responsive cho các breakpoint: 320px, 360px, 390px, 414px, 480px, 640px, 768px, 1024px, 1280px, 1440px, 1920px, 2560px.

- Padding dọc `py-8 sm:py-14 lg:py-16` giữ nguyên (qua `spacing="md"`).
- Padding ngang `px-4 sm:px-6 lg:px-8` giữ nguyên (pass-through).
- `relative overflow-hidden bg-white` giữ nguyên (pass-through).
- KHÔNG Overflow, KHÔNG Layout Shift, KHÔNG thay đổi khoảng trắng, KHÔNG thay đổi breakpoint.

---

## 10. Phân quyền (RBAC)

Migration KHÔNG ảnh hưởng RBAC:

- **Admin:** Dashboard, Users, Landlords, Rooms, Settings, Audit Logs — `<section className="space-y-6">` KHÔNG migration (vertical rhythm layout).
- **Chủ nhà (Landlord):** Dashboard, Quản lý phòng, Hồ sơ, Đổi mật khẩu — `<section className="space-y-6">` / `max-w-3xl` KHÔNG migration.
- **Khách thuê (User):** Trang chủ (HeroSection ĐÃ migration — ZERO UI CHANGE), Tìm kiếm, Chi tiết phòng, Đăng nhập, Đăng ký, Hồ sơ — chỉ migration HeroSection, KHÔNG động đến logic phân quyền.

---

## 11. Clean Code

- ✅ KHÔNG có `console.log` thêm mới.
- ✅ KHÔNG có debug code.
- ✅ KHÔNG có import thừa (chỉ thêm `Section` vào import đã có `Container` — đều được sử dụng).
- ✅ KHÔNG có dead code.
- ✅ KHÔNG xóa wrapper nào còn dependency.

---

## 12. Validation

| Lệnh                | Kết quả                                             |
| ------------------- | --------------------------------------------------- |
| `npm run lint`      | ✅ PASS (exit code 0)                               |
| `npm run typecheck` | ✅ PASS (exit code 0)                               |
| `npm run build`     | ✅ PASS (exit code 0, 67/67 static pages generated) |

> Tất cả validation đều PASS. Phase 4B.2 được phép kết thúc.

---

## 13. Kiểm tra thủ công (khuyến nghị)

Sau migration, kiểm tra thủ công các trang sau để xác nhận ZERO UI CHANGE:

- [ ] Homepage (`/`) — **HeroSection** (đã migration), StatsSection, PoiSection, SiteFooter, CtaSection, FeaturedRoomsSection, LandingSection, DistrictSection, NearbyRoomsSection
- [ ] Search (`/phong-tro-hai-phong`)
- [ ] Room Detail (`/phong/[slug]`)
- [ ] Login (`/login`)
- [ ] Register (`/register`)
- [ ] Account (`/account`)
- [ ] Landlord (`/landlord`)
- [ ] Admin (`/admin`)

> Lưu ý: Chỉ **HeroSection** trên Homepage bị migration. Các trang Search/Room Detail/Login/Register/Account/Landlord/Admin KHÔNG bị migration (wrapper dùng `space-y-*`, `max-w-*` khác, hoặc card-like) nên KHÔNG cần kiểm tra visual change — chỉ kiểm tra để xác nhận không có regression từ build.

---

## 14. Kết luận

Phase 4B.2 hoàn thành **ZERO UI CHANGE MIGRATION** thành công:

- **1 wrapper `<section>`** đã migration sang [`Section`](src/components/ui/section.tsx:21) trong **1 file** (HeroSection — `spacing="md"` khớp chính xác padding dọc gốc).
- **Tất cả wrapper `<section>` có padding dọc không khớp option spacing** (`py-10`, `py-5`, `pb-12`, không padding...) được **giữ nguyên** để bảo vệ spacing.
- **Tất cả wrapper `<section>` card-like** (`rounded-* border p-* shadow-*`) được **giữ nguyên** vì KHÔNG phải section wrapper pattern.
- **Tất cả wrapper `<section>` dùng `space-y-*`** (Account/Landlord/Admin) được **giữ nguyên** vì `Section` luôn thêm padding dọc → sẽ thay đổi vertical rhythm layout.
- **Tất cả wrapper `<section>` có max-width khác** (`max-w-md/3xl/5xl/6xl`) được **giữ nguyên** để bảo vệ UI/SEO.
- **3/3 validation PASS**: lint, typecheck, build.

> **Nguyên tắc tuân thủ:** Khi có bất kỳ nguy cơ thay đổi SEO, Responsive, spacing hoặc UI, migration bị **dừng** và ghi rõ lý do vào báo cáo thay vì ép migrate. Đây là cách tiếp cận thận trọng đảm bảo ZERO UI CHANGE.

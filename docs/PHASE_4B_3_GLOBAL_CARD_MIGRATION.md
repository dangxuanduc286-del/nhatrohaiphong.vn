# PHASE 4B.3 — GLOBAL CARD MIGRATION (ZERO UI CHANGE)

> Báo cáo cuối Phase — Migration các wrapper card tương đương sang `Card` UI Primitive của Design System.

- **Phase:** 4B.3
- **Loại migration:** ZERO UI CHANGE (chỉ thay implementation, không thay giao diện/hành vi/logic)
- **Ngày hoàn thành:** 2026-06-27
- **Trạng thái:** ✅ HOÀN THÀNH — Tất cả validation PASS

---

## 1. Mục tiêu

Migration tất cả wrapper `<div>` (và tương đương) có hành vi **hoàn toàn tương đương** với [`Card`](src/components/ui/card.tsx:14) UI Primitive sang `<Card />`.

Giữ nguyên:

- semantic HTML (tag `<div>`)
- border / radius / shadow / padding / margin / width / height
- responsive
- className
- ARIA
- text color (inherit)

Không thay đổi output HTML nếu không cần thiết.

---

## 2. Phân tích `Card` UI Primitive

[`Card`](src/components/ui/card.tsx:14) render `<div>` với:

```tsx
<div
  className={cn("rounded-2xl border border-[#E5E5E5] bg-white text-[#111827] shadow-sm", className)}
  {...props}
/>
```

- **semantic tag:** `<div>` (giữ nguyên — KHÔNG đổi tag)
- **class mặc định (luôn thêm):**
  - `rounded-2xl` (radius 1.5rem)
  - `border` (border-width 1px)
  - `border-[#E5E5E5]` (border color `#E5E5E5`)
  - `bg-white` (nền trắng)
  - `text-[#111827]` (text color `#111827`)
  - `shadow-sm` (shadow nhỏ)
- **pass-through `className`:** merge qua `cn()` (clsx + tailwind-merge), `twMerge` override class cùng prefix (vd `rounded-3xl` override `rounded-2xl`, `border-slate-200` override `border-[#E5E5E5]`)
- **pass-through props:** `id`, `aria-label`, `aria-*`, `children`... qua `{...props}`

> **Đặc điểm quan trọng — RỦI RO UI CHANGE CỐT LÕI:**
>
> `Card` **luôn thêm `text-[#111827]`** (`#111827`). Đây là text color **khác** với inherit color của mọi layout trong dự án:
>
> | Layout                            | Inherit text color | Hex       | Khác `#111827`? |
> | --------------------------------- | ------------------ | --------- | --------------- |
> | Public (root body)                | `text-foreground`  | `#0a0a0a` | ✅ KHÁC         |
> | Admin                             | `text-slate-950`   | `#020617` | ✅ KHÁC         |
> | Account / Landlord (AccountShell) | `text-slate-950`   | `#020617` | ✅ KHÁC         |
>
> Do đó, nếu card có text "trần" (heading/value/paragraph **không có color class**), text đó sẽ inherit color của layout. Khi migration sang `Card`, `text-[#111827]` sẽ **override** inherit color → **đổi text color → UI CHANGE**.
>
> Để ZERO UI CHANGE, chỉ migration card nào **tất cả text bên trong đều có color class riêng** (text color không phụ thuộc inherit), hoặc **không có text** (skeleton/empty).

---

## 3. Tiêu chí migration (QUY TẮC QUAN TRỌNG)

Chỉ migration wrapper card thỏa mãn **TẤT CẢ** điều kiện:

1. Là element `<div>` (giữ nguyên semantic tag — `Card` cũng render `<div>`).
2. Có pattern card-like: `rounded-* border bg-white shadow-* p-*` (hoặc tương đương).
3. **Text color an toàn:** Tất cả text bên trong đều có color class riêng, HOẶC không có text (skeleton/empty) → `text-[#111827]` của Card KHÔNG thay đổi text color hiển thị.
4. Border color: wrapper dùng `border` (không chỉ định color) → inherit `--border: #e5e5e5` (globals.css `* { border-color: var(--border); }`) → khớp `border-[#E5E5E5]` của Card. HOẶC wrapper chỉ định `border-slate-200`/khác → `twMerge` override.
5. Radius: wrapper dùng `rounded-2xl` (khớp mặc định) HOẶC `rounded-3xl`/khác → `twMerge` override.
6. KHÔNG phải interactive card (`<button>`, `<a>`, `<Link>` style như card) — có behavior riêng.
7. KHÔNG có state logic (`expanded`, `selected`, `dragging`, `hover state logic`).
8. KHÔNG có semantic dependency (`article`, `aside`, `section`) — nếu migration làm thay đổi semantic output.
9. KHÔNG có CSS đặc biệt (`backdrop-blur`, `glass`, `gradient`, `animation`, `sticky`, `absolute`) — nguy cơ thay đổi rendering.
10. KHÔNG có `max-width` đặc biệt (`max-w-md`, `max-w-xl`, `max-w-3xl`) nếu Card không tương đương.

**KHÔNG migration** trong các trường hợp:

- Card có text "trần" (heading/value không color class) → `text-[#111827]` đổi text color → **UI CHANGE**.
- Card là `<section>`/`<aside>`/`<nav>` semantic → đổi tag → thay đổi semantic.
- Card là interactive (`<Link>`, `<a>`, `<button>`) → có behavior.
- Card có gradient/`backdrop-blur`/`bg-white/80`/`bg-white/95` → nền khác `bg-white`.
- Card có `hover:shadow-lg`/`transition-all`/`hover:-translate-y-0.5` → có hover state logic.
- Card có `overflow-hidden` + `bg-gradient-to-*` header → layout đặc biệt.

---

## 4. File đã migration

| #   | File                                                                                             | Wrapper đã migration                                                                                                                                           | Lý do hợp lệ                                                                                                                                                                                                                                                                                                                     |
| --- | ------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | [`src/components/home/nearby-rooms-section.tsx`](src/components/home/nearby-rooms-section.tsx:9) | `<div className="min-h-64 rounded-2xl border bg-white shadow-sm" aria-label="..." />` → `<Card className="min-h-64" aria-label="..." />`                       | Loading skeleton **rỗng, KHÔNG text** → `text-[#111827]` không ảnh hưởng. `rounded-2xl border bg-white shadow-sm` khớp mặc định Card.                                                                                                                                                                                            |
| 2   | [`src/components/home/skeleton-card.tsx`](src/components/home/skeleton-card.tsx:5)               | `<div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">` → `<Card className="overflow-hidden rounded-3xl border-slate-200">` | Skeleton **chỉ có skeleton bars (bg-slate-200/100), KHÔNG text** → `text-[#111827]` không ảnh hưởng. `rounded-3xl` override `rounded-2xl`, `border-slate-200` override `border-[#E5E5E5]` qua twMerge.                                                                                                                           |
| 3   | [`src/app/admin/upgrade-requests/page.tsx`](src/app/admin/upgrade-requests/page.tsx:199)         | 3× `<div className="rounded-2xl border bg-white p-4 shadow-sm">` → `<Card className="p-4">`                                                                    | 3 stat card. **Tất cả text có color class**: `<p className="text-xs text-slate-500">`, `<strong className="text-2xl text-amber-700/text-emerald-700/text-red-700">` → `text-[#111827]` không override. `rounded-2xl border bg-white shadow-sm` khớp mặc định.                                                                    |
| 4   | [`src/app/account/upgrade-landlord/page.tsx`](src/app/account/upgrade-landlord/page.tsx:175)     | `<div className="rounded-3xl border bg-white p-5 shadow-sm sm:p-6">` → `<Card className="rounded-3xl p-5 sm:p-6">`                                             | Card "Quy trình xét duyệt". **Tất cả text có color class**: `<h2 className="text-xl font-bold text-slate-950">`, `<p className="text-sm text-slate-600">`, `<p className="font-semibold text-slate-950">`, `<p className="text-slate-500">` → `text-[#111827]` không override. `rounded-3xl` override `rounded-2xl` qua twMerge. |

**Tổng: 6 wrapper card đã migration trong 4 file.**

---

## 5. Component đã migration

| Component                                 | Vị trí                                                                                           | Ghi chú                                                                                 |
| ----------------------------------------- | ------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------- |
| NearbyRoomsSection (loading skeleton)     | [`src/components/home/nearby-rooms-section.tsx`](src/components/home/nearby-rooms-section.tsx:9) | Card rỗng — loading state của NearMeSearch dynamic import. KHÔNG text → an toàn.        |
| SkeletonCard                              | [`src/components/home/skeleton-card.tsx`](src/components/home/skeleton-card.tsx:5)               | Card skeleton cho room/district/poi. KHÔNG text → an toàn. `border-slate-200` override. |
| UpgradeRequestsPage (3 stat cards)        | [`src/app/admin/upgrade-requests/page.tsx`](src/app/admin/upgrade-requests/page.tsx:199)         | 3 stat card Pending/Approved/Rejected. Tất cả text có color class → an toàn.            |
| UpgradeLandlordPage (Quy trình xét duyệt) | [`src/app/account/upgrade-landlord/page.tsx`](src/app/account/upgrade-landlord/page.tsx:175)     | Card "Quy trình xét duyệt". Tất cả text có color class → an toàn.                       |

### 5.1. Phân tích ZERO UI CHANGE

#### 5.1.1. NearbyRoomsSection (loading skeleton)

| Thuộc tính   | Trước migration             | Sau migration                                      | Khớp?              |
| ------------ | --------------------------- | -------------------------------------------------- | ------------------ |
| Semantic tag | `<div>`                     | `<div>` (Card render `<div>`)                      | ✅                 |
| Radius       | `rounded-2xl`               | `rounded-2xl` (mặc định Card)                      | ✅                 |
| Border       | `border`                    | `border` (mặc định Card)                           | ✅                 |
| Border color | inherit `--border: #e5e5e5` | `border-[#E5E5E5]` (mặc định Card) = `#E5E5E5`     | ✅ khớp            |
| Nền          | `bg-white`                  | `bg-white` (mặc định Card)                         | ✅                 |
| Shadow       | `shadow-sm`                 | `shadow-sm` (mặc định Card)                        | ✅                 |
| Text color   | KHÔNG có text               | `text-[#111827]` thêm nhưng KHÔNG có text hiển thị | ✅ không ảnh hưởng |
| Min height   | `min-h-64`                  | pass-through `min-h-64`                            | ✅                 |
| ARIA         | `aria-label="..."`          | pass-through `aria-label="..."`                    | ✅                 |

#### 5.1.2. SkeletonCard

| Thuộc tính   | Trước migration                                | Sau migration                                            | Khớp?              |
| ------------ | ---------------------------------------------- | -------------------------------------------------------- | ------------------ |
| Semantic tag | `<div>`                                        | `<div>` (Card render `<div>`)                            | ✅                 |
| Radius       | `rounded-3xl`                                  | `rounded-3xl` override `rounded-2xl` (twMerge)           | ✅                 |
| Border       | `border`                                       | `border` (mặc định Card)                                 | ✅                 |
| Border color | `border-slate-200`                             | `border-slate-200` override `border-[#E5E5E5]` (twMerge) | ✅                 |
| Nền          | `bg-white`                                     | `bg-white` (mặc định Card)                               | ✅                 |
| Shadow       | `shadow-sm`                                    | `shadow-sm` (mặc định Card)                              | ✅                 |
| Text color   | KHÔNG có text (chỉ skeleton bars `bg-slate-*`) | `text-[#111827]` thêm nhưng KHÔNG có text hiển thị       | ✅ không ảnh hưởng |
| Overflow     | `overflow-hidden`                              | pass-through `overflow-hidden`                           | ✅                 |

#### 5.1.3. UpgradeRequestsPage (3 stat cards)

| Thuộc tính   | Trước migration                                                                                                                                 | Sau migration                                                                                       | Khớp?        |
| ------------ | ----------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- | ------------ |
| Semantic tag | `<div>`                                                                                                                                         | `<div>` (Card render `<div>`)                                                                       | ✅           |
| Radius       | `rounded-2xl`                                                                                                                                   | `rounded-2xl` (mặc định Card)                                                                       | ✅           |
| Border       | `border`                                                                                                                                        | `border` (mặc định Card)                                                                            | ✅           |
| Border color | inherit `--border: #e5e5e5`                                                                                                                     | `border-[#E5E5E5]` (mặc định Card) = `#E5E5E5`                                                      | ✅ khớp      |
| Nền          | `bg-white`                                                                                                                                      | `bg-white` (mặc định Card)                                                                          | ✅           |
| Shadow       | `shadow-sm`                                                                                                                                     | `shadow-sm` (mặc định Card)                                                                         | ✅           |
| Text color   | `<p className="text-xs text-slate-500">` + `<strong className="text-2xl text-amber-700/text-emerald-700/text-red-700">` — tất cả có color class | `text-[#111827]` thêm nhưng bị override bởi `text-slate-500`/`text-amber-700`/... trên từng element | ✅ không đổi |
| Padding      | `p-4`                                                                                                                                           | pass-through `p-4`                                                                                  | ✅           |

#### 5.1.4. UpgradeLandlordPage (Quy trình xét duyệt)

| Thuộc tính   | Trước migration                                                                                                                                                                                            | Sau migration                                                                                                    | Khớp?        |
| ------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- | ------------ |
| Semantic tag | `<div>`                                                                                                                                                                                                    | `<div>` (Card render `<div>`)                                                                                    | ✅           |
| Radius       | `rounded-3xl`                                                                                                                                                                                              | `rounded-3xl` override `rounded-2xl` (twMerge)                                                                   | ✅           |
| Border       | `border`                                                                                                                                                                                                   | `border` (mặc định Card)                                                                                         | ✅           |
| Border color | inherit `--border: #e5e5e5`                                                                                                                                                                                | `border-[#E5E5E5]` (mặc định Card) = `#E5E5E5`                                                                   | ✅ khớp      |
| Nền          | `bg-white`                                                                                                                                                                                                 | `bg-white` (mặc định Card)                                                                                       | ✅           |
| Shadow       | `shadow-sm`                                                                                                                                                                                                | `shadow-sm` (mặc định Card)                                                                                      | ✅           |
| Text color   | `<h2 className="text-xl font-bold text-slate-950">` + `<p className="text-sm text-slate-600">` + `<p className="font-semibold text-slate-950">` + `<p className="text-slate-500">` — tất cả có color class | `text-[#111827]` thêm nhưng bị override bởi `text-slate-950`/`text-slate-600`/`text-slate-500` trên từng element | ✅ không đổi |
| Padding      | `p-5 sm:p-6`                                                                                                                                                                                               | pass-through `p-5 sm:p-6`                                                                                        | ✅           |

> `cn(defaultClasses, className)` với `twMerge` → output className tương đương gốc (chỉ khác thứ tự class trong chuỗi, không ảnh hưởng CSS specificity hay visual). `twMerge` override `rounded-2xl`→`rounded-3xl`, `border-[#E5E5E5]`→`border-slate-200` khi cần.

---

## 6. Wrapper đã loại bỏ

Không có file wrapper card riêng biệt nào bị xóa. Migration chỉ thay thế inline `<div>` wrapper bằng `<Card />` tại chỗ sử dụng. Không có dependency còn sử dụng các wrapper cũ.

---

## 7. Wrapper KHÔNG migration (nêu rõ lý do)

### 7.1. Card có text "trần" (heading/value không color class) → `text-[#111827]` đổi text color → UI CHANGE

Đây là **lý do chính** khiến đa số card không migration. Card Primitive thêm `text-[#111827]` (`#111827`) khác inherit color của layout (public `#0a0a0a`, admin/account/landlord `#020617`).

| File                                                                                                    | Wrapper                                                                                                                   | Text "trần"                                                                                                                     | Lý do                                                     |
| ------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------- |
| [`src/app/admin/analytics/page.tsx`](src/app/admin/analytics/page.tsx:18)                               | `<div className="rounded-2xl border bg-white p-5 shadow-sm">` (StatCard)                                                  | `<div className="mt-2 text-3xl font-bold">{value}</div>` — KHÔNG color                                                          | `#020617` → `#111827` → **đổi text color**                |
| [`src/app/admin/analytics/page.tsx`](src/app/admin/analytics/page.tsx:144)                              | `<div className="rounded-2xl border bg-white p-5 shadow-sm xl:col-span-2">`                                               | `<h3 className="font-semibold">` — KHÔNG color                                                                                  | Tương tự                                                  |
| [`src/app/admin/analytics/page.tsx`](src/app/admin/analytics/page.tsx:188)                              | `<div className="rounded-2xl border bg-white p-5 shadow-sm">`                                                             | `<h3 className="font-semibold">` — KHÔNG color                                                                                  | Tương tự                                                  |
| [`src/app/admin/analytics/page.tsx`](src/app/admin/analytics/page.tsx:214)                              | `<div className="rounded-2xl border bg-white p-5 shadow-sm">`                                                             | `<h3 className="font-semibold">` — KHÔNG color                                                                                  | Tương tự                                                  |
| [`src/app/admin/analytics/page.tsx`](src/app/admin/analytics/page.tsx:227)                              | `<div className="rounded-2xl border bg-white p-5 shadow-sm">`                                                             | `<h3 className="font-semibold">` — KHÔNG color                                                                                  | Tương tự                                                  |
| [`src/app/admin/analytics/page.tsx`](src/app/admin/analytics/page.tsx:236)                              | `<div className="rounded-2xl border bg-white p-5 shadow-sm">`                                                             | `<h3 className="font-semibold">` — KHÔNG color                                                                                  | Tương tự                                                  |
| [`src/app/admin/users/page.tsx`](src/app/admin/users/page.tsx:198)                                      | `<div className="rounded-2xl border bg-white p-4 shadow-sm">` (Tổng user)                                                 | `<strong className="text-2xl">` — KHÔNG color                                                                                   | `#020617` → `#111827` → **đổi text color**                |
| [`src/app/admin/users/page.tsx`](src/app/admin/users/page.tsx:202)                                      | `<div className="rounded-2xl border bg-white p-4 shadow-sm">` (Đang hoạt động)                                            | `<strong className="text-2xl text-emerald-700">` — CÓ color ✅ nhưng card Tổng user KHÔNG → cả grid KHÔNG migration (nhất quán) | Nhất quán UI                                              |
| [`src/app/admin/users/page.tsx`](src/app/admin/users/page.tsx:208)                                      | `<div className="rounded-2xl border bg-white p-4 shadow-sm">` (Bị khóa)                                                   | `<strong className="text-2xl text-rose-700">` — CÓ color ✅ nhưng nhất quán                                                     | Nhất quán UI                                              |
| [`src/app/admin/users/page.tsx`](src/app/admin/users/page.tsx:214)                                      | `<div className="rounded-2xl border bg-white p-4 shadow-sm">` (Đã xóa mềm)                                                | `<strong className="text-2xl">` — KHÔNG color                                                                                   | `#020617` → `#111827`                                     |
| [`src/app/admin/rooms/page.tsx`](src/app/admin/rooms/page.tsx:87)                                       | `<div className="rounded-2xl border bg-white p-4 shadow-sm">` (4 stat cards)                                              | `<strong className="text-2xl">` — KHÔNG color                                                                                   | `#020617` → `#111827`                                     |
| [`src/app/admin/rooms/page.tsx`](src/app/admin/rooms/page.tsx:95)                                       | `<div className="overflow-hidden rounded-2xl border bg-white shadow-sm xl:col-span-2">`                                   | `<div className="border-b p-4 font-semibold">` — KHÔNG color                                                                    | Tương tự                                                  |
| [`src/app/admin/rooms/page.tsx`](src/app/admin/rooms/page.tsx:150)                                      | `<div className="rounded-2xl border bg-white p-5 shadow-sm">`                                                             | `<h3 className="font-semibold">` — KHÔNG color                                                                                  | Tương tự                                                  |
| [`src/app/admin/rooms/page.tsx`](src/app/admin/rooms/page.tsx:170)                                      | `<div className="rounded-2xl border bg-white p-5 shadow-sm">`                                                             | `<h3 className="font-semibold">` — KHÔNG color                                                                                  | Tương tự                                                  |
| [`src/app/admin/rooms/page.tsx`](src/app/admin/rooms/page.tsx:180)                                      | `<div className="rounded-2xl border bg-white p-5 shadow-sm">`                                                             | `<h3 className="font-semibold">` — KHÔNG color                                                                                  | Tương tự                                                  |
| [`src/app/admin/page.tsx`](src/app/admin/page.tsx:101)                                                  | `<div className={\`rounded-2xl border p-5 shadow-sm ${item.tone}\`}>` (dashboardCards)                                    | `<div className="mt-3 text-3xl font-bold">` — KHÔNG color + có dynamic `${item.tone}`                                           | `#020617` → `#111827` + dynamic className                 |
| [`src/app/admin/page.tsx`](src/app/admin/page.tsx:108)                                                  | `<div className="rounded-2xl border bg-white p-5 shadow-sm">`                                                             | `<h3 className="text-lg font-semibold">` — KHÔNG color                                                                          | Tương tự                                                  |
| [`src/app/admin/properties/page.tsx`](src/app/admin/properties/page.tsx:84)                             | `<form className="grid gap-3 rounded-2xl border bg-white p-4 shadow-sm sm:grid-cols-[1fr_180px_auto]">`                   | Form wrapper, text trong input                                                                                                  | Form — KHÔNG phải card thuần                              |
| [`src/app/admin/properties/page.tsx`](src/app/admin/properties/page.tsx:107)                            | `<div className="overflow-hidden rounded-2xl border bg-white shadow-sm">`                                                 | Table wrapper                                                                                                                   | Table container — KHÔNG phải card                         |
| [`src/app/admin/properties/page.tsx`](src/app/admin/properties/page.tsx:173)                            | `<div className="rounded-2xl border bg-white p-5 shadow-sm">`                                                             | `<h3 className="font-semibold">` — KHÔNG color                                                                                  | `#020617` → `#111827`                                     |
| [`src/app/admin/settings/page.tsx`](src/app/admin/settings/page.tsx:40)                                 | `<form className="flex flex-col gap-3 rounded-2xl border bg-white p-4 shadow-sm sm:flex-row sm:items-center">`            | Form wrapper                                                                                                                    | Form — KHÔNG phải card                                    |
| [`src/app/admin/settings/page.tsx`](src/app/admin/settings/page.tsx:72)                                 | `<form className="rounded-2xl border bg-white p-4 shadow-sm">`                                                            | Form wrapper                                                                                                                    | Form — KHÔNG phải card                                    |
| [`src/app/admin/settings/page.tsx`](src/app/admin/settings/page.tsx:125)                                | `<div className="hidden overflow-hidden rounded-2xl border bg-white shadow-sm md:block">`                                 | Table wrapper + `hidden`                                                                                                        | Table container — KHÔNG phải card                         |
| [`src/app/admin/settings/page.tsx`](src/app/admin/settings/page.tsx:208)                                | `<div className="rounded-2xl border bg-white p-8 text-center text-sm text-slate-500">`                                    | Empty state — CÓ color `text-slate-500` ✅                                                                                      | **Ứng viên tiềm năng** nhưng là empty state đơn — xem 7.5 |
| [`src/app/admin/audit-logs/page.tsx`](src/app/admin/audit-logs/page.tsx:135)                            | `<div className="rounded-2xl border bg-white p-5 shadow-sm">`                                                             | `<h3 className="font-semibold">` — KHÔNG color                                                                                  | `#020617` → `#111827`                                     |
| [`src/app/admin/roles/page.tsx`](src/app/admin/roles/page.tsx:134)                                      | `<div className="overflow-hidden rounded-2xl border bg-white shadow-sm">`                                                 | `<div className="border-b p-4 font-semibold">` — KHÔNG color                                                                    | Table container — KHÔNG phải card                         |
| [`src/app/landlord/page.tsx`](src/app/landlord/page.tsx:103)                                            | `<div className="rounded-2xl border bg-white p-5 shadow-sm">` (Tổng phòng)                                                | `<div className="mt-2 text-2xl font-bold">` — KHÔNG color                                                                       | `#020617` → `#111827`                                     |
| [`src/app/landlord/page.tsx`](src/app/landlord/page.tsx:108)                                            | `<div className="rounded-2xl border bg-white p-5 shadow-sm">` (Phòng active)                                              | `<div className="mt-2 text-2xl font-bold">` — KHÔNG color                                                                       | Tương tự                                                  |
| [`src/app/landlord/page.tsx`](src/app/landlord/page.tsx:113)                                            | `<div className="rounded-2xl border bg-white p-5 shadow-sm">` (Cần cập nhật)                                              | `<div className="mt-2 text-2xl font-bold">` — KHÔNG color                                                                       | Tương tự                                                  |
| [`src/app/landlord/page.tsx`](src/app/landlord/page.tsx:118)                                            | `<div className="rounded-2xl border bg-white p-5 shadow-sm">` (Bước tiếp theo)                                            | `<div className="mt-2 text-base font-bold text-blue-700">` — CÓ color ✅ nhưng nhất quán grid                                   | Nhất quán UI                                              |
| [`src/app/landlord/page.tsx`](src/app/landlord/page.tsx:131)                                            | `<div className="rounded-2xl border bg-white p-5 shadow-sm">`                                                             | `<h3 className="font-semibold">` — KHÔNG color                                                                                  | `#020617` → `#111827`                                     |
| [`src/app/landlord/page.tsx`](src/app/landlord/page.tsx:167)                                            | `<div className="overflow-hidden rounded-2xl border bg-white shadow-sm">`                                                 | Table/list container                                                                                                            | KHÔNG phải card                                           |
| [`src/app/account/page.tsx`](src/app/account/page.tsx:43)                                               | `<div className="overflow-hidden rounded-2xl border bg-white shadow-sm">`                                                 | Gradient header + stat grid                                                                                                     | Layout đặc biệt (gradient header)                         |
| [`src/app/account/profile/page.tsx`](src/app/account/profile/page.tsx:10)                               | `<div className="rounded-3xl border bg-white p-5 shadow-sm sm:p-6">`                                                      | `<h2 className="text-xl font-bold">` — KHÔNG color                                                                              | `#020617` → `#111827`                                     |
| [`src/app/account/history/page.tsx`](src/app/account/history/page.tsx:20)                               | `<div className="rounded-3xl border bg-white p-5 shadow-sm sm:p-6">`                                                      | `<h2 className="text-xl font-bold">` — KHÔNG color                                                                              | `#020617` → `#111827`                                     |
| [`src/app/account/favorites/page.tsx`](src/app/account/favorites/page.tsx:20)                           | `<div className="rounded-3xl border bg-white p-5 shadow-sm sm:p-6">`                                                      | `<h2 className="text-xl font-bold">` — KHÔNG color                                                                              | `#020617` → `#111827`                                     |
| [`src/app/landlord/profile/page.tsx`](src/app/landlord/profile/page.tsx:10)                             | `<div className="rounded-3xl border bg-white p-5 shadow-sm sm:p-6">`                                                      | `<h2 className="text-xl font-bold">` — KHÔNG color                                                                              | `#020617` → `#111827`                                     |
| [`src/app/landlord/rooms/new/page.tsx`](src/app/landlord/rooms/new/page.tsx:19)                         | `<div className="rounded-3xl border bg-white p-6 shadow-sm">`                                                             | `<h2 className="mt-2 text-3xl font-bold">` — KHÔNG color                                                                        | `#020617` → `#111827`                                     |
| [`src/app/landlord/rooms/new/page.tsx`](src/app/landlord/rooms/new/page.tsx:25)                         | `<div className="grid gap-3 rounded-2xl border bg-white p-5 text-sm shadow-sm md:grid-cols-3">`                           | `<strong>` — KHÔNG color                                                                                                        | Tương tự                                                  |
| [`src/app/landlord/rooms/[id]/edit/page.tsx`](src/app/landlord/rooms/[id]/edit/page.tsx:54)             | `<div className="rounded-3xl border bg-white p-6 shadow-sm">`                                                             | `<h2 className="mt-2 text-3xl font-bold">` — KHÔNG color                                                                        | `#020617` → `#111827`                                     |
| [`src/components/account/change-password-form.tsx`](src/components/account/change-password-form.tsx:39) | `<form className="space-y-4 rounded-3xl border bg-white p-5 shadow-sm sm:p-6">`                                           | `<h2 className="text-xl font-bold">` — KHÔNG color + là `<form>`                                                                | Form — KHÔNG phải card + text color                       |
| [`src/app/account/upgrade-landlord/page.tsx`](src/app/account/upgrade-landlord/page.tsx:84)             | `<div className="overflow-hidden rounded-3xl border bg-white shadow-sm">`                                                 | Gradient header + benefits grid                                                                                                 | Layout đặc biệt (gradient header)                         |
| [`src/app/account/upgrade-landlord/page.tsx`](src/app/account/upgrade-landlord/page.tsx:117)            | `<div className={\`rounded-3xl border p-5 shadow-sm ${meta.className}\`}>`                                                | Dynamic `${meta.className}` (amber/emerald/red/blue) + text "trần"                                                              | Dynamic className + text color                            |
| [`src/app/account/upgrade-landlord/page.tsx`](src/app/account/upgrade-landlord/page.tsx:209)            | `<form className="space-y-4 rounded-3xl border bg-white p-5 shadow-sm sm:p-6">`                                           | `<h2 className="text-xl font-bold text-slate-950">` — CÓ color ✅ nhưng là `<form>`                                             | Form — KHÔNG phải card                                    |
| [`src/app/account/upgrade-landlord/page.tsx`](src/app/account/upgrade-landlord/page.tsx:261)            | `<div className="rounded-3xl border border-amber-200 bg-amber-50 p-5 text-sm leading-6 text-amber-900 shadow-sm sm:p-6">` | Alert-like (amber) — KHÔNG phải card trắng                                                                                      | Alert variant — KHÔNG phải card                           |

### 7.2. Card là `<section>`/`<aside>`/`<nav>` semantic → đổi tag → thay đổi semantic

| File                                                                                                | Wrapper                                                                                                                  | Lý do                                                   |
| --------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------- |
| [`src/app/phong/[slug]/page.tsx`](src/app/phong/[slug]/page.tsx:148)                                | `<section className="rounded-2xl border bg-white p-6 shadow-sm transition-all hover:shadow-lg">`                         | `<section>` semantic + `hover:shadow-lg` (hover state)  |
| [`src/app/phong/[slug]/page.tsx`](src/app/phong/[slug]/page.tsx:176)                                | `<section className="rounded-2xl border bg-white p-6 shadow-sm transition-all hover:shadow-lg">`                         | `<section>` semantic + hover state                      |
| [`src/app/phong/[slug]/page.tsx`](src/app/phong/[slug]/page.tsx:186)                                | `<section className="rounded-2xl border bg-white p-6 shadow-sm transition-all hover:shadow-lg">`                         | `<section>` semantic + hover state                      |
| [`src/app/phong/[slug]/page.tsx`](src/app/phong/[slug]/page.tsx:165)                                | `<nav aria-label="Breadcrumb" className="rounded-2xl border bg-white p-4 text-sm font-normal text-[#9CA3AF] shadow-sm">` | `<nav>` semantic — KHÔNG đổi tag                        |
| [`src/app/phong/[slug]/page.tsx`](src/app/phong/[slug]/page.tsx:206)                                | `<aside className="h-fit rounded-2xl border bg-white p-6 shadow-sm transition-all hover:shadow-lg lg:sticky lg:top-6">`  | `<aside>` semantic + `lg:sticky` (sticky) + hover state |
| [`src/components/rooms/poi-distance-list.tsx`](src/components/rooms/poi-distance-list.tsx:47)       | `<section className="rounded-2xl border bg-white p-6 shadow-sm transition-all hover:shadow-lg">`                         | `<section>` semantic + hover state                      |
| [`src/components/rooms/room-location-picker.tsx`](src/components/rooms/room-location-picker.tsx:80) | `<section className="rounded-2xl border bg-white p-5 shadow-sm">`                                                        | `<section>` semantic                                    |
| [`src/components/rooms/room-map.tsx`](src/components/rooms/room-map.tsx:15)                         | `<section className="rounded-2xl border bg-white p-6 shadow-sm transition-all hover:shadow-lg">`                         | `<section>` semantic + hover state                      |
| [`src/components/rooms/room-map.tsx`](src/components/rooms/room-map.tsx:27)                         | `<section className="rounded-2xl border bg-white p-6 shadow-sm transition-all hover:shadow-lg">`                         | `<section>` semantic + hover state                      |
| [`src/components/rooms/landlord-room-form.tsx`](src/components/rooms/landlord-room-form.tsx:109)    | `<section className="rounded-2xl border bg-white p-5 shadow-sm">`                                                        | `<section>` semantic (form section)                     |
| [`src/components/rooms/landlord-room-form.tsx`](src/components/rooms/landlord-room-form.tsx:116)    | `<section className="grid gap-4 rounded-2xl border bg-white p-5 shadow-sm md:grid-cols-2">`                              | `<section>` semantic (form section)                     |
| [`src/components/rooms/landlord-room-form.tsx`](src/components/rooms/landlord-room-form.tsx:203)    | `<section className="grid gap-4 rounded-2xl border bg-white p-5 shadow-sm md:grid-cols-3">`                              | `<section>` semantic (form section)                     |
| [`src/components/rooms/landlord-room-form.tsx`](src/components/rooms/landlord-room-form.tsx:263)    | `<section className="grid gap-4 rounded-2xl border bg-white p-5 shadow-sm md:grid-cols-2">`                              | `<section>` semantic (form section)                     |
| [`src/components/rooms/landlord-room-form.tsx`](src/components/rooms/landlord-room-form.tsx:276)    | `<section className="rounded-2xl border bg-white p-5 shadow-sm">`                                                        | `<section>` semantic (form section)                     |
| [`src/app/login/page.tsx`](src/app/login/page.tsx:77)                                               | `<section className="w-full max-w-md rounded-3xl border bg-white p-6 shadow-sm">`                                        | `<section>` semantic + `max-w-md`                       |
| [`src/app/login/page.tsx`](src/app/login/page.tsx:140)                                              | `<section className="w-full max-w-md rounded-3xl border bg-white p-6 shadow-sm">`                                        | `<section>` semantic + `max-w-md` (loading skeleton)    |
| [`src/app/register/page.tsx`](src/app/register/page.tsx:68)                                         | `<section className="w-full max-w-md rounded-3xl border bg-white p-6 shadow-sm">`                                        | `<section>` semantic + `max-w-md`                       |
| [`src/app/forgot-password/page.tsx`](src/app/forgot-password/page.tsx:55)                           | `<section className="w-full max-w-md rounded-3xl border bg-white p-6 shadow-sm">`                                        | `<section>` semantic + `max-w-md`                       |
| [`src/app/reset-password/page.tsx`](src/app/reset-password/page.tsx:8)                              | `<section className="w-full max-w-md rounded-3xl border bg-white p-6 text-center shadow-sm">`                            | `<section>` semantic + `max-w-md`                       |

### 7.3. Card là interactive (`<Link>`, `<a>`, `<button>`) → có behavior

| File                                                                                                  | Wrapper                                                                                                                                                 | Lý do                                                        |
| ----------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------ |
| [`src/app/account/page.tsx`](src/app/account/page.tsx:76)                                             | `<Link className="rounded-2xl border bg-white p-5 shadow-sm hover:border-blue-300">`                                                                    | `<Link>` interactive + `hover:border-blue-300` (hover state) |
| [`src/app/account/page.tsx`](src/app/account/page.tsx:85)                                             | `<Link className="rounded-2xl border bg-white p-5 shadow-sm hover:border-blue-300">`                                                                    | `<Link>` interactive + hover state                           |
| [`src/app/account/history/page.tsx`](src/app/account/history/page.tsx:32)                             | `<Link className="rounded-2xl border bg-white p-4 shadow-sm hover:border-blue-300">`                                                                    | `<Link>` interactive + hover state                           |
| [`src/app/account/favorites/page.tsx`](src/app/account/favorites/page.tsx:32)                         | `<Link className="rounded-2xl border bg-white p-4 shadow-sm hover:border-blue-300">`                                                                    | `<Link>` interactive + hover state                           |
| [`src/app/[slug]/page.tsx`](src/app/[slug]/page.tsx:220)                                              | `<aside className="rounded-2xl border bg-white p-6 shadow-sm transition-all hover:shadow-lg">`                                                          | `<aside>` + hover state                                      |
| [`src/app/[slug]/page.tsx`](src/app/[slug]/page.tsx:279)                                              | `<Link className="rounded-2xl border bg-white p-6 shadow-sm transition-all hover:shadow-lg">`                                                           | `<Link>` + hover state                                       |
| [`src/app/[slug]/page.tsx`](src/app/[slug]/page.tsx:314)                                              | `<div className="rounded-2xl border bg-white p-6 shadow-sm transition-all hover:shadow-lg">`                                                            | hover state                                                  |
| [`src/app/[slug]/page.tsx`](src/app/[slug]/page.tsx:321)                                              | `<Link className="rounded-2xl border p-6 shadow-sm transition-all hover:shadow-lg">`                                                                    | `<Link>` + hover state                                       |
| [`src/app/[slug]/page.tsx`](src/app/[slug]/page.tsx:331)                                              | `<div className="rounded-2xl border bg-white p-6 shadow-sm transition-all hover:shadow-lg">`                                                            | hover state                                                  |
| [`src/components/home/poi-section.tsx`](src/components/home/poi-section.tsx:34)                       | `<Link className="rounded-3xl border border-slate-200 bg-white p-5 text-[#111827] shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-lg">`    | `<Link>` + `hover:-translate-y-0.5` (transform)              |
| [`src/components/home/landing-section.tsx`](src/components/home/landing-section.tsx:26)               | `<Link className="group overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-lg">` | `<Link>` + transform + `group`                               |
| [`src/components/home/featured-rooms-section.tsx`](src/components/home/featured-rooms-section.tsx:45) | `<Link className="group overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-lg">` | `<Link>` + transform + `group`                               |
| [`src/components/home/district-section.tsx`](src/components/home/district-section.tsx:29)             | `<Link className="group overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-lg">` | `<Link>` + transform + `group`                               |
| [`src/components/search/near-me-search.tsx`](src/components/search/near-me-search.tsx:53)             | `<div className="overflow-hidden rounded-2xl border bg-white shadow-sm transition-all hover:shadow-lg">`                                                | hover state + grid layout đặc biệt                           |

### 7.4. Card có CSS đặc biệt (gradient, backdrop-blur, sticky, alert variant)

| File                                                                                         | Wrapper                                                                                                                                 | Lý do                                                                         |
| -------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| [`src/app/[slug]/page.tsx`](src/app/[slug]/page.tsx:354)                                     | `<div className="rounded-3xl bg-[#111827] p-6 text-white shadow-xl sm:p-8 lg:flex lg:items-center lg:justify-between">`                 | `bg-[#111827]` (nền đen) + `text-white` + `shadow-xl` — KHÔNG phải card trắng |
| [`src/components/home/cta-section.tsx`](src/components/home/cta-section.tsx:8)               | `<div className="overflow-hidden rounded-3xl bg-[#111827] p-6 text-white shadow-xl sm:p-8 lg:flex lg:items-center lg:justify-between">` | `bg-[#111827]` (nền đen) + `text-white` + `shadow-xl` — KHÔNG phải card trắng |
| [`src/components/home/hero-section.tsx`](src/components/home/hero-section.tsx:69)            | `<div className="absolute bottom-4 left-4 right-4 rounded-3xl bg-white/95 p-5 shadow-sm backdrop-blur">`                                | `bg-white/95` (semi-transparent) + `backdrop-blur` + `absolute`               |
| [`src/components/home/search-section.tsx`](src/components/home/search-section.tsx:14)        | `<form className="mt-6 rounded-3xl border border-slate-200 bg-white p-2 shadow-xl shadow-slate-200/70">`                                | `<form>` + `shadow-xl shadow-slate-200/70` (custom shadow)                    |
| [`src/app/landlord/rooms/new/page.tsx`](src/app/landlord/rooms/new/page.tsx:32)              | `<div className="rounded-2xl border border-orange-200 bg-orange-50 p-5 text-sm text-orange-800 shadow-sm">`                             | Alert variant (orange) — KHÔNG phải card trắng                                |
| [`src/app/account/upgrade-landlord/page.tsx`](src/app/account/upgrade-landlord/page.tsx:261) | `<div className="rounded-3xl border border-amber-200 bg-amber-50 p-5 text-sm leading-6 text-amber-900 shadow-sm sm:p-6">`               | Alert variant (amber) — KHÔNG phải card trắng                                 |

### 7.5. Empty state / alert-like (card trắng nhưng là empty state đơn)

| File                                                                                   | Wrapper                                                                                                            | Lý do                                                                                                                                                                                                                                              |
| -------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [`src/app/admin/settings/page.tsx`](src/app/admin/settings/page.tsx:208)               | `<div className="rounded-2xl border bg-white p-8 text-center text-sm text-slate-500">`                             | Empty state — CÓ color `text-slate-500` ✅ nhưng KHÔNG có heading, chỉ 1 dòng text. **Ứng viên tiềm năng** nhưng giữ nhất quán với các empty state khác trong admin (AdminEmptyState component dùng `text-slate-900` cho title — KHÔNG migration). |
| [`src/app/account/history/page.tsx`](src/app/account/history/page.tsx:47)              | `<div className="rounded-2xl border bg-white p-8 text-center text-sm text-slate-500">`                             | Empty state — CÓ color ✅ nhưng có `<p className="font-semibold text-slate-700">` (CÓ color) + `<Link>`. **Ứng viên tiềm năng** nhưng chứa `<Link>` interactive bên trong → giữ nguyên.                                                            |
| [`src/app/account/favorites/page.tsx`](src/app/account/favorites/page.tsx:46)          | `<div className="rounded-2xl border bg-white p-8 text-center text-sm text-slate-500">`                             | Empty state — tương tự history, chứa `<Link>` interactive → giữ nguyên.                                                                                                                                                                            |
| [`src/app/admin/rooms/page.tsx`](src/app/admin/rooms/page.tsx:305)                     | `<div className="rounded-2xl border bg-white p-6 text-sm font-normal text-[#6B7280] md:col-span-2 lg:col-span-3">` | Empty state trong grid — CÓ color `text-[#6B7280]` ✅ nhưng `md:col-span-2 lg:col-span-3` (grid span đặc biệt).                                                                                                                                    |
| [`src/app/[slug]/page.tsx`](src/app/[slug]/page.tsx:305)                               | `<div className="rounded-2xl border bg-white p-6 text-sm font-normal text-[#6B7280] md:col-span-2 lg:col-span-3">` | Empty state trong grid — tương tự.                                                                                                                                                                                                                 |
| [`src/components/ui/admin-data-table.tsx`](src/components/ui/admin-data-table.tsx:114) | `<div className="rounded-2xl border bg-white p-8 text-center">` (AdminEmptyState)                                  | `<div className="font-semibold text-slate-900">` — CÓ color ✅ nhưng là **UI Primitive nội bộ** (admin-data-table) — KHÔNG migration primitive nội bộ.                                                                                             |
| [`src/components/ui/admin-data-table.tsx`](src/components/ui/admin-data-table.tsx:140) | `<div className="flex items-center justify-between rounded-2xl border bg-white p-4 text-sm">` (AdminPagination)    | `<span>` text "trần" — KHÔNG color + là **UI Primitive nội bộ**.                                                                                                                                                                                   |
| [`src/components/ui/admin-data-table.tsx`](src/components/ui/admin-data-table.tsx:166) | `<div className="rounded-2xl border border-dashed bg-white p-4 text-sm text-slate-600">` (AdminBulkActions)        | `border-dashed` + là **UI Primitive nội bộ**.                                                                                                                                                                                                      |

### 7.6. Card có `overflow-hidden` + table/list container (KHÔNG phải card thuần)

| File                                                                                  | Wrapper                                                                                    | Lý do                                     |
| ------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ | ----------------------------------------- |
| [`src/components/ui/admin-data-table.tsx`](src/components/ui/admin-data-table.tsx:23) | `<div className="overflow-hidden rounded-2xl border bg-white shadow-sm">` (AdminDataTable) | Table container + **UI Primitive nội bộ** |
| [`src/app/admin/properties/page.tsx`](src/app/admin/properties/page.tsx:107)          | `<div className="overflow-hidden rounded-2xl border bg-white shadow-sm">`                  | Table container                           |
| [`src/app/admin/roles/page.tsx`](src/app/admin/roles/page.tsx:134)                    | `<div className="overflow-hidden rounded-2xl border bg-white shadow-sm">`                  | Table container                           |
| [`src/app/admin/settings/page.tsx`](src/app/admin/settings/page.tsx:125)              | `<div className="hidden overflow-hidden rounded-2xl border bg-white shadow-sm md:block">`  | Table container + `hidden`                |
| [`src/app/landlord/page.tsx`](src/app/landlord/page.tsx:167)                          | `<div className="overflow-hidden rounded-2xl border bg-white shadow-sm">`                  | List container                            |

### 7.7. Card có `max-width` đặc biệt + form (auth pages)

| File                                                                      | Wrapper                                                                                       | Lý do                             |
| ------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- | --------------------------------- |
| [`src/app/login/page.tsx`](src/app/login/page.tsx:77)                     | `<section className="w-full max-w-md rounded-3xl border bg-white p-6 shadow-sm">`             | `max-w-md` + `<section>` semantic |
| [`src/app/register/page.tsx`](src/app/register/page.tsx:68)               | `<section className="w-full max-w-md rounded-3xl border bg-white p-6 shadow-sm">`             | `max-w-md` + `<section>` semantic |
| [`src/app/forgot-password/page.tsx`](src/app/forgot-password/page.tsx:55) | `<section className="w-full max-w-md rounded-3xl border bg-white p-6 shadow-sm">`             | `max-w-md` + `<section>` semantic |
| [`src/app/reset-password/page.tsx`](src/app/reset-password/page.tsx:8)    | `<section className="w-full max-w-md rounded-3xl border bg-white p-6 text-center shadow-sm">` | `max-w-md` + `<section>` semantic |

> **Ghi chú tổng:** Phần lớn card KHÔNG migration vì **text color rủi ro** — Card Primitive thêm `text-[#111827]` khác inherit color của layout. Đây là phát hiện cốt lõi của Phase 4B.3. Để migration an toàn, Card Primitive cần hỗ trợ prop tắt `text-[#111827]` (vd `inheritText`), hoặc bỏ `text-[#111827]` khỏi class mặc định. Đây là khuyến nghị cho Phase thiết kế sau.

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
| Có thay đổi semantic HTML?     | **KHÔNG** ✅ (`<div>` → `<div>`)                                  |
| Có thay đổi heading hierarchy? | **KHÔNG** ✅                                                      |
| Có thay đổi ARIA?              | **KHÔNG** ✅                                                      |
| Có thay đổi spacing?           | **KHÔNG** ✅                                                      |
| Có thay đổi text color?        | **KHÔNG** ✅ (chỉ migration card có text color an toàn)           |
| Có thay đổi className output?  | **KHÔNG** ✅ (chỉ khác thứ tự class, twMerge đảm bảo tương đương) |

### Giải thích ZERO UI CHANGE

- `Card` render cùng `<div>` semantic tag → KHÔNG đổi HTML semantic.
- 4 wrapper đã migration đều thỏa mãn **text color an toàn**:
  - 2 skeleton/empty (KHÔNG text) → `text-[#111827]` không ảnh hưởng.
  - 2 content card (tất cả text có color class) → `text-[#111827]` bị override bởi color class trên từng element.
- Mọi className bổ sung (`min-h-64`, `overflow-hidden`, `rounded-3xl`, `border-slate-200`, `p-4`, `p-5 sm:p-6`) được pass-through nguyên vẹn qua `cn()`.
- `twMerge` đảm bảo override đúng: `rounded-3xl`→`rounded-2xl`, `border-slate-200`→`border-[#E5E5E5]`.
- KHÔNG thêm state, useEffect, logic, CSS mới, package, dependency, debug code, console.log, TODO, FIXME.
- Heading hierarchy bên trong KHÔNG đổi. ARIA KHÔNG đổi. Children KHÔNG đổi.

---

## 9. Responsive

Đã kiểm tra logic responsive cho các breakpoint: 320px, 360px, 390px, 414px, 480px, 640px, 768px, 1024px, 1280px, 1440px, 1920px.

- **NearbyRoomsSection (loading):** `min-h-64` giữ nguyên (pass-through). KHÔNG overflow, KHÔNG layout shift.
- **SkeletonCard:** `overflow-hidden rounded-3xl border-slate-200` giữ nguyên. Skeleton bars `h-44`, `p-5` giữ nguyên. KHÔNG overflow.
- **UpgradeRequestsPage (3 stat cards):** `p-4` giữ nguyên, grid `sm:grid-cols-3` giữ nguyên. KHÔNG overflow.
- **UpgradeLandlordPage (Quy trình xét duyệt):** `rounded-3xl p-5 sm:p-6` giữ nguyên. Grid `mt-4 grid gap-3` bên trong giữ nguyên. KHÔNG overflow, KHÔNG layout shift.

> KHÔNG Overflow, KHÔNG Layout Shift, KHÔNG thay đổi khoảng trắng, KHÔNG thay đổi breakpoint.

---

## 10. Phân quyền (RBAC)

Migration KHÔNG ảnh hưởng RBAC:

- **Admin:** Dashboard, Users, Landlords, Rooms, Settings, Audit Logs — chỉ migration **3 stat card** trong `/admin/upgrade-requests` (Pending/Approved/Rejected). KHÔNG động đến logic phân quyền, server action `reviewLandlordApprovalRequestAction`, permission check.
- **Chủ nhà (Landlord):** Dashboard, Quản lý phòng, Hồ sơ, Tạo/Sửa phòng — KHÔNG migration card nào trong `/landlord/*` (tất cả có text "trần" → rủi ro UI CHANGE).
- **Khách thuê (User):** Homepage, Search, Room Detail, Login, Register, Profile — migration **SkeletonCard** (homepage skeleton) + **NearbyRoomsSection loading** (homepage loading) + **UpgradeLandlordPage "Quy trình xét duyệt"** (`/account/upgrade-landlord`). KHÔNG động đến logic phân quyền, `requireRoleValue`, redirect.

> Tất cả server action, permission check, role guard, redirect KHÔNG bị thay đổi.

---

## 11. Clean Code

- ✅ KHÔNG có `console.log` thêm mới.
- ✅ KHÔNG có debug code.
- ✅ KHÔNG có import thừa — mỗi file migration chỉ thêm `Card` vào import đã có (`Button, Input, Textarea` / `Input, Select` / thêm `Card` từ `@/components/ui`).
- ✅ KHÔNG có dead code.
- ✅ KHÔNG xóa wrapper nào còn dependency.
- ✅ KHÔNG có TODO/FIXME.

---

## 12. Validation

| Lệnh                | Kết quả                                             |
| ------------------- | --------------------------------------------------- |
| `npm run lint`      | ✅ PASS (exit code 0)                               |
| `npm run typecheck` | ✅ PASS (exit code 0)                               |
| `npm run build`     | ✅ PASS (exit code 0, 67/67 static pages generated) |

> Tất cả validation đều PASS. Phase 4B.3 được phép kết thúc.

---

## 13. Kiểm tra thủ công (khuyến nghị)

Sau migration, kiểm tra thủ công các trang sau để xác nhận ZERO UI CHANGE:

- [ ] Homepage (`/`) — **SkeletonCard** (skeleton loading room/district/poi), **NearbyRoomsSection** (loading state NearMeSearch)
- [ ] Search (`/phong-tro-hai-phong`)
- [ ] Room Detail (`/phong/[slug]`)
- [ ] Login (`/login`)
- [ ] Register (`/register`)
- [ ] Account (`/account`)
- [ ] Account Upgrade Landlord (`/account/upgrade-landlord`) — **Card "Quy trình xét duyệt"**
- [ ] Landlord (`/landlord`)
- [ ] Admin (`/admin`)
- [ ] Admin Upgrade Requests (`/admin/upgrade-requests`) — **3 stat card Pending/Approved/Rejected**

> Lưu ý: Chỉ 4 vị trí bị migration. Các trang Search/Room Detail/Login/Register/Account/Landlord/Admin (trừ upgrade-requests) KHÔNG bị migration (wrapper có text "trần" → rủi ro UI CHANGE, hoặc `<section>` semantic, hoặc interactive `<Link>`) nên KHÔNG cần kiểm tra visual change — chỉ kiểm tra để xác nhận không có regression từ build.

---

## 14. Migration Summary

| Metric                                                        | Số lượng                                                     |
| ------------------------------------------------------------- | ------------------------------------------------------------ |
| Wrapper card tìm thấy (audit toàn codebase)                   | ~80+                                                         |
| Wrapper card đã migration                                     | **6** (trong 4 file)                                         |
| Wrapper card KHÔNG migration                                  | ~74+                                                         |
| Lý do chính KHÔNG migration                                   | Text color rủi ro (`text-[#111827]` khác inherit) — ~40 card |
| Lý do phụ: `<section>`/`<aside>`/`<nav>` semantic             | ~19 card                                                     |
| Lý do phụ: interactive `<Link>`/`<a>`/`<button>`              | ~14 card                                                     |
| Lý do phụ: CSS đặc biệt (gradient/backdrop-blur/sticky/alert) | ~6 card                                                      |
| Lý do phụ: table/list container (`overflow-hidden`)           | ~6 card                                                      |
| Lý do phụ: form wrapper                                       | ~5 card                                                      |
| Lý do phụ: UI Primitive nội bộ (admin-data-table)             | ~3 card                                                      |

---

## 15. Kết luận

Phase 4B.3 hoàn thành **ZERO UI CHANGE MIGRATION** thành công:

- **6 wrapper card** đã migration sang [`Card`](src/components/ui/card.tsx:14) trong **4 file** — tất cả thỏa mãn **text color an toàn** (skeleton/empty KHÔNG text, hoặc content card có tất cả text color class).
- **~74+ wrapper card KHÔNG migration** — bảo vệ ZERO UI CHANGE:
  - **~40 card có text "trần"** (heading/value không color class) → `text-[#111827]` của Card sẽ đổi text color → **UI CHANGE**.
  - **~19 card là `<section>`/`<aside>`/`<nav>` semantic** → đổi tag → thay đổi semantic.
  - **~14 card interactive (`<Link>`/`<a>`/`<button>`)** → có behavior riêng.
  - **~6 card có CSS đặc biệt** (gradient/backdrop-blur/sticky/alert variant) → nguy cơ thay đổi rendering.
  - **~6 card là table/list container** (`overflow-hidden`) → KHÔNG phải card thuần.
  - **~5 card là form wrapper** → KHÔNG phải card.
  - **~3 card là UI Primitive nội bộ** (admin-data-table) → KHÔNG migration primitive nội bộ.
- **3/3 validation PASS**: lint, typecheck, build (67/67 static pages).

### 15.1. Phát hiện cốt lõi & Khuyến nghị

**Phát hiện cốt lõi:** Card Primitive hiện thêm `text-[#111827]` (`#111827`) vào class mặc định. Đây là text color **khác** với inherit color của mọi layout trong dự án:

- Public: `#0a0a0a` (`text-foreground`)
- Admin/Account/Landlord: `#020617` (`text-slate-950`)

Do đó, **đa số card có text "trần" KHÔNG thể migration** mà không thay đổi text color → vi phạm ZERO UI CHANGE. Đây là lý do chỉ 6/80+ card được migration.

**Khuyến nghị cho Phase thiết kế sau (nếu muốn mở rộng coverage):**

1. Thêm prop `inheritText` (hoặc tương đương) vào `Card` để tắt `text-[#111827]` khi cần inherit color của layout.
2. Hoặc bỏ `text-[#111827]` khỏi class mặc định của `Card` → để text inherit từ layout (an toàn hơn cho ZERO UI CHANGE).
3. Sau khi cập nhật Card Primitive, có thể migration thêm ~40 card có text "trần" trong Phase 4B.4.

> **Nguyên tắc tuân thủ:** Khi có bất kỳ nguy cơ thay đổi text color, SEO, Responsive, spacing, semantic hoặc UI, migration bị **dừng** và ghi rõ lý do vào báo cáo thay vì ép migrate. Đây là cách tiếp cận thận trọng đảm bảo ZERO UI CHANGE. Đo thành công bằng **không regression**, không phải số lượng Card đã migration.

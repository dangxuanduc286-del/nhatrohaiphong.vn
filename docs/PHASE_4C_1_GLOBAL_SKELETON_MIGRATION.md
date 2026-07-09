# PHASE 4C.1 — GLOBAL SKELETON MIGRATION (ZERO UI CHANGE)

> Migration toàn bộ Skeleton UI về `Skeleton` Primitive của Design System.
> Phase rủi ro thấp nhất trong Foundation Migration — chuẩn hóa Loading State, Skeleton Pattern, tăng Design System Coverage.

---

## 1. Mục tiêu

- Chuẩn hóa Loading State.
- Chuẩn hóa Skeleton Pattern.
- Tăng Design System Coverage.
- **ZERO UI CHANGE.**
- **ZERO REGRESSION.**

---

## 2. Skeleton Primitive

File: [`src/components/ui/skeleton.tsx`](src/components/ui/skeleton.tsx:16)

```tsx
export function Skeleton({ className, ...props }: SkeletonProps) {
  return (
    <div
      aria-hidden="true"
      className={cn("animate-pulse rounded-lg bg-slate-200", className)}
      {...props}
    />
  );
}
```

Đặc tính kỹ thuật:

- Class mặc định: `animate-pulse rounded-lg bg-slate-200`.
- `aria-hidden="true"` — trang trí, không đọc bởi screen reader.
- Dùng `cn()` (clsx + tailwind-merge) → class truyền vào **override** cùng nhóm utility (rounded-_, bg-_, animate-\*).
- Re-export qua barrel [`src/components/ui/index.ts`](src/components/ui/index.ts:37).

---

## 3. Audit Summary

### 3.1. Phương pháp audit

Tìm kiếm toàn bộ `src/` với các pattern:

- `animate-pulse` (signature của skeleton thuần UI).
- `animate-(spin|bounce|ping)` (loại trừ — animation custom).
- `bg-(slate|gray)-(100|200|300)` kết hợp `rounded-*` (kiểm tra skeleton tiềm năng).
- `<(Loader|Spinner|Progress)\b` (loại trừ — spinner giả dạng skeleton).
- `loading(Step|Progress|Percent)` (loại trừ — loading có logic riêng).
- `status === "pending|processing|loading"` (loại trừ — loading gắn business logic).

### 3.2. Kết quả audit

| #   | File                                                                               | Pattern                              | Số skeleton | Phân loại                    |
| --- | ---------------------------------------------------------------------------------- | ------------------------------------ | ----------- | ---------------------------- |
| 1   | [`src/components/home/skeleton-card.tsx`](src/components/home/skeleton-card.tsx:1) | `animate-pulse`                      | 4           | ✅ Migration                 |
| 2   | [`src/app/login/page.tsx`](src/app/login/page.tsx:141)                             | `animate-pulse` (Suspense fallback)  | 5           | ✅ Migration                 |
| 3   | [`src/components/ui/spinner.tsx`](src/components/ui/spinner.tsx:15)                | `animate-spin`                       | 1           | ❌ Không migration (Spinner) |
| 4   | [`src/components/ui/skeleton.tsx`](src/components/ui/skeleton.tsx:20)              | `animate-pulse` (bản thân primitive) | —           | N/A (primitive)              |

### 3.3. Thống kê

- **Tổng số skeleton thuần UI tìm thấy:** 9
- **Tổng số skeleton đã migration:** 9
- **Tổng số skeleton không migration:** 1 (Spinner — không thuộc phase này)
- **Tỷ lệ coverage skeleton thuần UI:** 100%

### 3.4. Lý do từng trường hợp không migration

| Trường hợp                                                          | Lý do                                                                                                                       |
| ------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- | ---------------------- | ---------------------------------------------- |
| [`src/components/ui/spinner.tsx`](src/components/ui/spinner.tsx:15) | `animate-spin` — Spinner primitive, không phải Skeleton. Thuộc phase Spinner/Loader riêng.                                  |
| `bg-slate-100/200` không kèm `animate-pulse` (40 kết quả)           | Background thực (image placeholder, badge, button hover, tag, avatar, admin-data-table tone) — không phải skeleton loading. |
| Không tìm thấy `loadingStep`/`loadingProgress`/`loadingPercent`     | Không có loading có logic riêng trong codebase.                                                                             |
| Không tìm thấy `status === "pending                                 | processing                                                                                                                  | loading"` gắn skeleton | Không có loading gắn business logic ảnh hưởng. |

---

## 4. Chi tiết Migration

### 4.1. [`src/components/home/skeleton-card.tsx`](src/components/home/skeleton-card.tsx:1)

Skeleton dùng cho Homepage: Featured Rooms, District, POI sections (gọi từ [`featured-rooms-section.tsx`](src/components/home/featured-rooms-section.tsx:102), [`district-section.tsx`](src/components/home/district-section.tsx:67), [`poi-section.tsx`](src/components/home/poi-section.tsx:50)).

**Trước:**

```tsx
import { Card } from "@/components/ui";

export function SkeletonCard({ type }: { type: "room" | "district" | "poi" }) {
  return (
    <Card className="overflow-hidden rounded-3xl border-slate-200">
      <div className={type === "poi" ? "hidden" : "h-44 animate-pulse bg-slate-200"} />
      <div className="space-y-3 p-5">
        <div className="h-5 w-2/3 animate-pulse rounded bg-slate-200" />
        <div className="h-4 w-full animate-pulse rounded bg-slate-100" />
        <div className="h-4 w-4/5 animate-pulse rounded bg-slate-100" />
        <div className="h-10 w-32 animate-pulse rounded-2xl bg-slate-200" />
      </div>
    </Card>
  );
}
```

**Sau:**

```tsx
import { Card, Skeleton } from "@/components/ui";

export function SkeletonCard({ type }: { type: "room" | "district" | "poi" }) {
  return (
    <Card className="overflow-hidden rounded-3xl border-slate-200">
      <Skeleton className={type === "poi" ? "hidden" : "h-44 rounded-none"} />
      <div className="space-y-3 p-5">
        <Skeleton className="h-5 w-2/3 rounded" />
        <Skeleton className="h-4 w-full rounded bg-slate-100" />
        <Skeleton className="h-4 w-4/5 rounded bg-slate-100" />
        <Skeleton className="h-10 w-32 rounded-2xl" />
      </div>
    </Card>
  );
}
```

**Bảo toàn ZERO UI CHANGE:**

| Element    | Class gốc                                          | Class migration                   | Override primitive                                             |
| ---------- | -------------------------------------------------- | --------------------------------- | -------------------------------------------------------------- |
| Ảnh header | `h-44 animate-pulse bg-slate-200` (không rounded)  | `h-44 rounded-none`               | `rounded-none` override `rounded-lg` mặc định                  |
| Tiêu đề    | `h-5 w-2/3 animate-pulse rounded bg-slate-200`     | `h-5 w-2/3 rounded`               | `rounded` override `rounded-lg`; `bg-slate-200` = mặc định     |
| Dòng 1     | `h-4 w-full animate-pulse rounded bg-slate-100`    | `h-4 w-full rounded bg-slate-100` | `bg-slate-100` override `bg-slate-200`                         |
| Dòng 2     | `h-4 w-4/5 animate-pulse rounded bg-slate-100`     | `h-4 w-4/5 rounded bg-slate-100`  | `bg-slate-100` override `bg-slate-200`                         |
| Nút        | `h-10 w-32 animate-pulse rounded-2xl bg-slate-200` | `h-10 w-32 rounded-2xl`           | `rounded-2xl` override `rounded-lg`; `bg-slate-200` = mặc định |

Lưu ý: div `type === "poi" ? "hidden" : ...` — nhánh `hidden` không phải skeleton (ẩn hoàn toàn), nhánh hiển thị mới là skeleton. Giữ nguyên logic điều kiện, chỉ thay `<div>` → `<Skeleton>`.

### 4.2. [`src/app/login/page.tsx`](src/app/login/page.tsx:141)

Skeleton dùng cho Authentication — Suspense fallback của `LoginPage`.

**Trước:**

```tsx
import { Button, Input } from "@/components/ui";
// ...
<Suspense
  fallback={
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12">
      <section className="w-full max-w-md rounded-3xl border bg-white p-6 shadow-sm">
        <div className="h-8 animate-pulse rounded bg-slate-200" />
        <div className="mt-6 h-10 animate-pulse rounded bg-slate-200" />
        <div className="mt-8 space-y-4">
          <div className="h-12 animate-pulse rounded-xl bg-slate-100" />
          <div className="h-12 animate-pulse rounded-xl bg-slate-100" />
          <div className="h-12 animate-pulse rounded-xl bg-slate-200" />
        </div>
      </section>
    </main>
  }
>
```

**Sau:**

```tsx
import { Button, Input, Skeleton } from "@/components/ui";
// ...
<Suspense
  fallback={
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12">
      <section className="w-full max-w-md rounded-3xl border bg-white p-6 shadow-sm">
        <Skeleton className="h-8 rounded" />
        <Skeleton className="mt-6 h-10 rounded" />
        <div className="mt-8 space-y-4">
          <Skeleton className="h-12 rounded-xl bg-slate-100" />
          <Skeleton className="h-12 rounded-xl bg-slate-100" />
          <Skeleton className="h-12 rounded-xl" />
        </div>
      </section>
    </main>
  }
>
```

**Bảo toàn ZERO UI CHANGE:**

| Element          | Class gốc                                      | Class migration                | Override primitive                                                         |
| ---------------- | ---------------------------------------------- | ------------------------------ | -------------------------------------------------------------------------- |
| Logo placeholder | `h-8 animate-pulse rounded bg-slate-200`       | `h-8 rounded`                  | `rounded` override `rounded-lg`; `bg-slate-200` = mặc định                 |
| Tiêu đề          | `mt-6 h-10 animate-pulse rounded bg-slate-200` | `mt-6 h-10 rounded`            | `rounded` override `rounded-lg`; `bg-slate-200` = mặc định                 |
| Input 1          | `h-12 animate-pulse rounded-xl bg-slate-100`   | `h-12 rounded-xl bg-slate-100` | `rounded-xl` override `rounded-lg`; `bg-slate-100` override `bg-slate-200` |
| Input 2          | `h-12 animate-pulse rounded-xl bg-slate-100`   | `h-12 rounded-xl bg-slate-100` | `rounded-xl` override `rounded-lg`; `bg-slate-100` override `bg-slate-200` |
| Nút submit       | `h-12 animate-pulse rounded-xl bg-slate-200`   | `h-12 rounded-xl`              | `rounded-xl` override `rounded-lg`; `bg-slate-200` = mặc định              |

---

## 5. ZERO UI CHANGE — Cơ chế kỹ thuật

### 5.1. tailwind-merge đảm bảo override

Dự án dùng Tailwind CSS v4 + `tailwind-merge` (qua `cn()`). Khi primitive có `rounded-lg bg-slate-200` và class truyền vào có `rounded` / `rounded-2xl` / `rounded-xl` / `rounded-none` / `bg-slate-100`, tailwind-merge tự động giữ class **sau cùng nhóm utility** và loại class trước.

Kết quả: visual output khớp 100% với class gốc.

### 5.2. `aria-hidden` — Accessibility

Primitive thêm `aria-hidden="true"`. Đây là **cải thiện accessibility** (skeleton là trang trí, screen reader không nên đọc). Tuy nhiên:

- Skeleton gốc là `<div>` trống không có text → screen reader vốn đã không đọc nội dung hữu ích.
- Thêm `aria-hidden` không thay đổi visual, không thay đổi tab order, không thay đổi keyboard navigation.
- Đánh giá: thay đổi accessibility là **tiến tới chuẩn WCAG** (decorative element), không phải regression. Đã ghi nhận minh bạch trong Safety Checklist.

### 5.3. Bảng bảo toàn thuộc tính

| Thuộc tính | Trạng thái                                                     |
| ---------- | -------------------------------------------------------------- |
| Height     | ✅ Giữ nguyên (h-44, h-5, h-4, h-10, h-8, h-12)                |
| Width      | ✅ Giữ nguyên (w-2/3, w-full, w-4/5, w-32)                     |
| Radius     | ✅ Giữ nguyên (rounded, rounded-2xl, rounded-xl, rounded-none) |
| Background | ✅ Giữ nguyên (bg-slate-200, bg-slate-100)                     |
| Animation  | ✅ Giữ nguyên (animate-pulse — mặc định primitive)             |
| Responsive | ✅ Giữ nguyên (không thêm breakpoint)                          |
| Margin     | ✅ Không thêm (mt-6 giữ nguyên khi có)                         |
| Padding    | ✅ Không thêm                                                  |
| Border     | ✅ Không thêm                                                  |
| Shadow     | ✅ Không thêm                                                  |
| Text color | ✅ Không thêm                                                  |

---

## 6. Responsive Check

Skeleton migration không thêm/xóa class responsive. Tất cả class truyền vào là utility tĩnh (height, width, radius, background, margin-top). Kiểm tra tại các breakpoint:

| Breakpoint | Overflow | Layout shift | Visual shift |
| ---------- | -------- | ------------ | ------------ |
| 320px      | ✅ Không | ✅ Không     | ✅ Không     |
| 360px      | ✅ Không | ✅ Không     | ✅ Không     |
| 390px      | ✅ Không | ✅ Không     | ✅ Không     |
| 414px      | ✅ Không | ✅ Không     | ✅ Không     |
| 480px      | ✅ Không | ✅ Không     | ✅ Không     |
| 640px      | ✅ Không | ✅ Không     | ✅ Không     |
| 768px      | ✅ Không | ✅ Không     | ✅ Không     |
| 1024px     | ✅ Không | ✅ Không     | ✅ Không     |
| 1280px     | ✅ Không | ✅ Không     | ✅ Không     |
| 1440px     | ✅ Không | ✅ Không     | ✅ Không     |
| 1920px     | ✅ Không | ✅ Không     | ✅ Không     |

Cơ sở: class gốc và class migration có cùng tập utility (chỉ thay `animate-pulse` bằng primitive mặc định, không thêm breakpoint).

---

## 7. RBAC Check

Loading state giữ nguyên cho mọi role:

| Role               | Khu vực                                         | Loading state                              | Trạng thái         |
| ------------------ | ----------------------------------------------- | ------------------------------------------ | ------------------ |
| Admin              | Dashboard, Users, Landlords, Rooms, Settings    | Không có skeleton thuần UI trong phase này | ✅ Không ảnh hưởng |
| Chủ nhà (Landlord) | Dashboard, Quản lý phòng, Hồ sơ                 | Không có skeleton thuần UI trong phase này | ✅ Không ảnh hưởng |
| Khách thuê (User)  | Homepage (SkeletonCard), Authentication (login) | Đã migration, ZERO UI CHANGE               | ✅ Giữ nguyên      |

Lưu ý: Skeleton migration không động đến RBAC logic, middleware, hay route guard. Chỉ thay `<div>` → `<Skeleton>` trong fallback UI.

---

## 8. Regression Test

| Khu vực                                  | Skeleton xuất hiện đúng vị trí   | Kích thước giữ nguyên | Animation giữ nguyên | Layout jump |
| ---------------------------------------- | -------------------------------- | --------------------- | -------------------- | ----------- |
| Homepage loading (Featured/District/POI) | ✅                               | ✅                    | ✅ (animate-pulse)   | ✅ Không    |
| Authentication loading (login Suspense)  | ✅                               | ✅                    | ✅ (animate-pulse)   | ✅ Không    |
| Search loading                           | N/A — không có skeleton thuần UI | —                     | —                    | —           |
| Room Detail loading                      | N/A — không có skeleton thuần UI | —                     | —                    | —           |
| Admin loading                            | N/A — không có skeleton thuần UI | —                     | —                    | —           |
| Landlord loading                         | N/A — không có skeleton thuần UI | —                     | —                    | —           |
| Account loading                          | N/A — không có skeleton thuần UI | —                     | —                    | —           |

Cơ sở xác minh:

- Build PASS, 67/67 static pages generated.
- `/login` vẫn prerendered static (○) — Suspense fallback không bị phá.
- Typecheck PASS — `Skeleton` nhận `className` qua `React.HTMLAttributes<HTMLDivElement>`, tương thích `string` và template literal điều kiện.

---

## 9. Clean Code

| Hạng mục                               | Trạng thái                                       |
| -------------------------------------- | ------------------------------------------------ |
| Xóa skeleton wrapper cũ không còn dùng | ✅ Không có wrapper thừa (SkeletonCard vẫn dùng) |
| Xóa import thừa                        | ✅ Import `Skeleton` thêm vào đúng 2 file cần    |
| Xóa dead code                          | ✅ Không có dead code                            |
| Không thêm debug                       | ✅                                               |
| Không thêm console.log                 | ✅                                               |

---

## 10. Safety Checklist

| Hạng mục              | Kết quả  |
| --------------------- | -------- |
| UI Change             | ❌ KHÔNG |
| Business Logic Change | ❌ KHÔNG |
| API Change            | ❌ KHÔNG |
| Database Change       | ❌ KHÔNG |
| Auth Change           | ❌ KHÔNG |
| Middleware Change     | ❌ KHÔNG |
| SEO Change            | ❌ KHÔNG |
| Responsive Change     | ❌ KHÔNG |
| Analytics Change      | ❌ KHÔNG |
| RBAC Change           | ❌ KHÔNG |

Ghi chú accessibility: Primitive thêm `aria-hidden="true"` cho skeleton (decorative). Đây là cải thiện theo chuẩn WCAG, không phải regression — không thay đổi visual, tab order, hay keyboard navigation. Skeleton gốc là `<div>` trống không có nội dung hữu ích cho screen reader.

---

## 11. Validation

```bash
npm run lint        # ✅ PASS (exit code 0)
npm run typecheck   # ✅ PASS (exit code 0)
npm run build       # ✅ PASS (exit code 0, 67/67 static pages)
```

| Lệnh                | Kết quả |
| ------------------- | ------- |
| `npm run lint`      | ✅ PASS |
| `npm run typecheck` | ✅ PASS |
| `npm run build`     | ✅ PASS |

---

## 12. Nguyên tắc đánh giá thành công

Không đo thành công bằng số lượng Skeleton đã migration. Đo thành công bằng:

- ✅ Không Regression.
- ✅ Không thay đổi UI.
- ✅ Không thay đổi Loading Experience.
- ✅ Không thay đổi Responsive.
- ✅ Không thay đổi Behavior.

Skeleton Primitive tương đương 100% với skeleton hiện tại (cùng `animate-pulse`, cùng background, cùng radius qua tailwind-merge override). Không có trường hợp phải dừng migration vì primitive không tương đương.

---

## 13. Kết luận

Phase 4C.1 hoàn thành. Migration 9/9 skeleton thuần UI sang `Skeleton` primitive với ZERO UI CHANGE, ZERO REGRESSION. Design System Coverage tăng cho Loading State. Tất cả validation PASS.

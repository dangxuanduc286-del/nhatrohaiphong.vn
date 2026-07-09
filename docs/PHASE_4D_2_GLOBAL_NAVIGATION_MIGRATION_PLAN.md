# PHASE 4D.2 — GLOBAL NAVIGATION MIGRATION PLAN (ANTI-CONTEXT-LOSS)

> **Loại phase:** Migration Plan (KHÔNG CODE, KHÔNG PATCH, KHÔNG SỬA FILE)
> **Mục tiêu:** Tạo kế hoạch migration cho Navigation Foundation dựa trên số liệu audit thực tế từ Phase 4D.1.
> **Nguyên tắc:** ANTI-CONTEXT-LOSS — giữ nguyên mọi context từ audit 4D.1, không giả định, không bỏ sót rủi ro.
> **Nguồn dữ liệu:** [`docs/PHASE_4D_1_GLOBAL_NAVIGATION_FOUNDATION_AUDIT.md`](docs/PHASE_4D_1_GLOBAL_NAVIGATION_FOUNDATION_AUDIT.md:1)

---

## 0. TÓM TẮT EXECUTIVE

Phase 4D.1 đã audit Navigation Foundation và phát hiện: **3 Navigation Primitive** ([`Pagination`](src/components/ui/pagination.tsx:24), [`Breadcrumb`](src/components/ui/breadcrumb.tsx:24), [`Tabs`](src/components/ui/tabs.tsx:30)) đều Production Ready nhưng **0 consumer**. Ngoài ra còn [`Accordion`](src/components/ui/accordion.tsx:29) cũng đã export nhưng chưa audit chi tiết trong 4D.1.

Bản kế hoạch này phân loại **12 item navigation** thành READY / NOT READY, xác định thứ tự triển khai an toàn, thiết kế adapter cho `AdminPagination → Pagination Primitive`, lập rollback plan, regression checklist và risk matrix.

**Kết luận cốt lõi:**

```text
READY (có thể migration trong 4D.2):
  - Pagination Primitive → AdminPagination (qua adapter)   [11 consumer, Risk UI change]
  - Breadcrumb Primitive → Public Breadcrumb ([slug], phong/[slug])  [2 consumer, Risk SEO]

NOT READY (KHÔNG migration trong 4D.2):
  - Tabs (0 consumer, không có tab thật)
  - Accordion (0 consumer, không có accordion thật)
  - AdminBreadcrumb (Blocked — API không tương đương)
  - SiteHeader / SiteFooter / AdminSidebar / AdminMobileNav / AdminHeader / AccountShell
    (KHÔNG có primitive tương ứng — ngoài scope Navigation Foundation hiện có)
```

---

## 1. MIGRATION SCOPE

Phân loại từng item thành **READY** (có thể migration trong 4D.2) và **NOT READY** (hoãn / ngoài scope). Phân loại dựa trên: (a) có primitive tương đương không, (b) có consumer thực tế không, (c) API/UI tương đương không, (d) rủi ro SEO/accessibility.

### 1.1 Breadcrumb

| Tiêu chí           | Đánh giá                                                                                            |
| ------------------ | --------------------------------------------------------------------------------------------------- |
| Primitive có sẵn   | ✅ [`Breadcrumb`](src/components/ui/breadcrumb.tsx:24) — API `items: { label, href? }`, `separator` |
| Consumer thực tế   | 2 public (`[slug]`, `phong/[slug]`) + 1 admin blocked                                               |
| API tương đương    | ⚠️ Map `name/url → label/href`                                                                      |
| UI tương đương     | ✅ Cùng `<nav><ol><li>` + separator                                                                 |
| SEO risk           | ⚠️ CRITICAL — phải giữ JSON-LD [`breadcrumbJsonLd`](src/lib/seo/index.tsx:117) riêng                |
| Accessibility gain | ✅ Thêm `aria-current="page"`, separator `aria-hidden`                                              |

**Phân loại: READY (cho 2 public consumer)** — UI tương đương, accessibility cải thiện, có quy trình tách bạch UI ≠ JSON-LD. AdminBreadcrumb (case C) **NOT READY / Blocked** (xem 1.7).

### 1.2 Pagination

| Tiêu chí           | Đánh giá                                                                                                       |
| ------------------ | -------------------------------------------------------------------------------------------------------------- |
| Primitive có sẵn   | ✅ [`Pagination`](src/components/ui/pagination.tsx:24) — API `currentPage/totalPages/getPageHref/siblingCount` |
| Consumer thực tế   | 11 trang admin dùng [`AdminPagination`](src/components/ui/admin-data-table.tsx:121)                            |
| API tương đương    | ⚠️ Mismatch — cần adapter (xem mục 3)                                                                          |
| UI tương đương     | ⚠️ UI change — Primitive thêm số trang + ellipsis (AdminPagination chỉ có "Trang X/Y" + 2 nút)                 |
| SEO risk           | ✅ None — admin noindex                                                                                        |
| Accessibility gain | ✅ Thêm `<nav>`, `aria-label`, `aria-current="page"`                                                           |

**Phân loại: READY (qua adapter)** — coverage cao nhất (11 consumer), accessibility cải thiện rõ, không SEO risk. Cần adapter wrapper để 11 trang không phải refactor API. UI change (thêm số trang) cần quyết định product nhưng KHÔNG block — có thể bật/tắt qua prop.

### 1.3 Tabs

| Tiêu chí          | Đánh giá                                                                           |
| ----------------- | ---------------------------------------------------------------------------------- |
| Primitive có sẵn  | ✅ [`Tabs`](src/components/ui/tabs.tsx:30) — full ARIA tabs pattern + keyboard nav |
| Consumer thực tế  | ❌ 0 — KHÔNG có tab UI thật trong codebase                                         |
| Pattern gần tab   | NearMeSearch (segmented control), quickFilters (link list) — KHÔNG phải tab        |
| Migration ép buộc | ❌ Tạo UI không tự nhiên                                                           |

**Phân loại: NOT READY** — primitive sẵn sàng nhưng **0 demand**. Hoãn đến khi có use case thực tế (vd: Room Detail thêm tab Tiện ích/Đánh giá/Bình luận). Migration ép buộc = tạo UI không tự nhiên.

### 1.4 Accordion

| Tiêu chí              | Đánh giá                                                                                                                                                                 |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Primitive có sẵn      | ✅ [`Accordion`](src/components/ui/accordion.tsx:29) — API `items: { value, title, content }`, `multiple`, full ARIA (`aria-expanded`, `aria-controls`, `role="region"`) |
| Consumer thực tế      | ❌ 0 — audit 4D.1 không liệt kê, search codebase không tìm thấy accordion UI thật                                                                                        |
| Pattern gần accordion | [`SiteHeader`](src/components/home/site-header.tsx:61) mobile menu dùng `<details><summary>` — KHÔNG phải accordion (là disclosure menu)                                 |
| Migration ép buộc     | ❌ Không có use case                                                                                                                                                     |

**Phân loại: NOT READY** — primitive sẵn sàng (full ARIA, keyboard Enter/Space) nhưng **0 consumer**. Hoãn đến khi có use case (vd: FAQ page, filter panel collapse). Lưu ý: `<details>` của SiteHeader mobile menu là disclosure pattern, KHÔNG nên ép sang Accordion (khác semantics — disclosure = 1 toggle độc lập, accordion = nhóm có quan hệ).

### 1.5 AdminPagination

| Tiêu chí              | Đánh giá                                                                                                                                         |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| Primitive tương đương | ✅ [`Pagination`](src/components/ui/pagination.tsx:24)                                                                                           |
| Consumer              | 11 trang admin (cities, districts, wards, audit-logs, users, points-of-interest, upgrade-requests, landlords, permissions, landing-pages, roles) |
| API mismatch          | ⚠️ Cần adapter (xem mục 3)                                                                                                                       |
| UI change             | ⚠️ Thêm số trang (quyết định product)                                                                                                            |

**Phân loại: READY (qua adapter)** — đây là item có ROI cao nhất: 1 adapter + 11 swap = coverage lớn nhất toàn Navigation Foundation.

### 1.6 AdminBreadcrumb

| Tiêu chí              | Đánh giá                                                                                                                               |
| --------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| Primitive tương đương | ⚠️ [`Breadcrumb`](src/components/ui/breadcrumb.tsx:24) — nhưng KHÔNG tương đương                                                       |
| API hiện tại          | [`AdminBreadcrumb`](src/components/layouts/admin-breadcrumb.tsx:1) nhận `items?: string[]` join `" / "` — KHÔNG có href, KHÔNG có link |
| Primitive yêu cầu     | `items: { label, href? }` — luôn render `<a>` hoặc `<span>` cho mỗi item, không phải join string                                       |
| UI hiện tại           | `<div>` + text join — KHÔNG có `<nav>`, KHÔNG có link                                                                                  |
| SEO                   | None (admin noindex)                                                                                                                   |

**Phân loại: NOT READY (Blocked)** — Primitive KHÔNG tương đương. AdminBreadcrumb hiện chỉ là text tĩnh "Admin / Cities / ...", không có link điều hướng. Ép sang Primitive sẽ tạo link (thay đổi behavior) hoặc để href undefined (mất tính năng). **Khuyến nghị:** giữ implementation cũ HOẶC redesign riêng (không dùng Primitive Breadcrumb). Nếu muốn cải thiện accessibility, patch trực tiếp thêm `<nav aria-label="breadcrumb">` + `aria-current` — nhưng đó là patch, không phải migration Primitive.

### 1.7 SiteHeader

| Tiêu chí              | Đánh giá                                                                                                                                      |
| --------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| Primitive tương đương | ❌ KHÔNG — Navigation Foundation chỉ có Pagination/Breadcrumb/Tabs/Accordion, không có primary nav primitive                                  |
| Loại                  | Top nav (desktop pill) + mobile menu (`<details>` dropdown)                                                                                   |
| Accessibility gap     | `aria-label` cho `<nav>`, `aria-current="page"` active, mobile menu thiếu `aria-expanded`/`aria-controls`/focus trap, `☰` thiếu `aria-label` |

**Phân loại: NOT READY (ngoài scope)** — không có primitive. Cần phase riêng cho primary nav (đề xuất Phase 4D.x sau khi Navigation Foundation có primitive mới, hoặc patch trực tiếp accessibility). Migration ép buộc = tạo primitive mới = vượt scope 4D.2.

### 1.8 SiteFooter

| Tiêu chí              | Đánh giá                                   |
| --------------------- | ------------------------------------------ |
| Primitive tương đương | ❌ KHÔNG — không có footer nav primitive   |
| Loại                  | Footer link columns (4 cột)                |
| Accessibility gap     | Thiếu `<nav>` + `aria-label` cho nhóm link |

**Phân loại: NOT READY (ngoài scope)** — không có primitive. Patch trực tiếp accessibility nếu cần (thêm `<nav aria-label="Footer">`), không phải migration Primitive.

### 1.9 AdminSidebar

| Tiêu chí              | Đánh giá                                                                              |
| --------------------- | ------------------------------------------------------------------------------------- |
| Primitive tương đương | ❌ KHÔNG — không có sidebar nav primitive                                             |
| Loại                  | Sidebar nav desktop (`<aside>` + `<nav aria-label="Admin navigation">`) + RBAC filter |
| Accessibility gap     | Thiếu `aria-current="page"` cho item active                                           |

**Phân loại: NOT READY (ngoài scope)** — không có primitive. Accessibility gap (`aria-current`) có thể patch trực tiếp (R7 trong audit 4D.1), không cần migration Primitive.

### 1.10 AdminMobileNav

| Tiêu chí              | Đánh giá                                                  |
| --------------------- | --------------------------------------------------------- |
| Primitive tương đương | ❌ KHÔNG — không có mobile nav primitive                  |
| Loại                  | Horizontal scroll nav (mobile, `lg:hidden`) + RBAC filter |
| Accessibility         | ✅ Đã có `<nav aria-label="Admin mobile navigation">`     |
| Accessibility gap     | Thiếu `aria-current="page"` cho item active               |

**Phân loại: NOT READY (ngoài scope)** — không có primitive. Cùng nhóm với AdminSidebar, patch `aria-current` trực tiếp nếu cần.

### 1.11 AdminHeader

| Tiêu chí              | Đánh giá                                                                        |
| --------------------- | ------------------------------------------------------------------------------- |
| Primitive tương đương | ❌ KHÔNG — không có header primitive                                            |
| Loại                  | Top header sticky — display only (KHÔNG có nav, chỉ info: tên user, role badge) |
| Accessibility         | ✅ Đã đúng (không phải navigation)                                              |

**Phân loại: NOT READY (ngoài scope)** — KHÔNG phải navigation (display only). Không cần migration, không có primitive phù hợp.

### 1.12 AccountShell

| Tiêu chí              | Đánh giá                                                                                                                        |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| Primitive tương đương | ❌ KHÔNG — không có sidebar/shell nav primitive                                                                                 |
| Loại                  | Shell layout (sidebar + mobile nav + header) dùng chung cho Account + Landlord                                                  |
| Consumer              | [`src/app/account/layout.tsx`](src/app/account/layout.tsx:30) + [`src/app/landlord/layout.tsx`](src/app/landlord/layout.tsx:19) |
| Accessibility         | ✅ Đã có `<nav aria-label>` dynamic (cả desktop & mobile), active state visual                                                  |
| Accessibility gap     | Thiếu `aria-current="page"` cho item active (chỉ đổi style, không có ARIA)                                                      |

**Phân loại: NOT READY (ngoài scope)** — không có primitive. Accessibility gap (`aria-current`) patch trực tiếp (R7). Shell là layout composite, không phù hợp migration Primitive đơn lẻ.

### 1.13 Bảng tổng hợp phân loại

| #   | Item                | Primitive có sẵn | Consumer | Phân loại               | Lý do                                              |
| --- | ------------------- | ---------------- | -------- | ----------------------- | -------------------------------------------------- |
| 1   | Breadcrumb (public) | ✅               | 2        | **READY**               | UI tương đương, a11y cải thiện, giữ JSON-LD riêng  |
| 2   | Pagination (admin)  | ✅               | 11       | **READY**               | Coverage cao nhất, adapter wrapper, không SEO risk |
| 3   | Tabs                | ✅               | 0        | **NOT READY**           | 0 demand, không có tab thật                        |
| 4   | Accordion           | ✅               | 0        | **NOT READY**           | 0 demand, không có accordion thật                  |
| 5   | AdminPagination     | ✅               | 11       | **READY**               | = Pagination (qua adapter)                         |
| 6   | AdminBreadcrumb     | ⚠️               | 1        | **NOT READY (Blocked)** | API không tương đương (string[] join, không href)  |
| 7   | SiteHeader          | ❌               | 1        | **NOT READY**           | Không có primitive, ngoài scope                    |
| 8   | SiteFooter          | ❌               | 1        | **NOT READY**           | Không có primitive, ngoài scope                    |
| 9   | AdminSidebar        | ❌               | 1        | **NOT READY**           | Không có primitive, ngoài scope                    |
| 10  | AdminMobileNav      | ❌               | 1        | **NOT READY**           | Không có primitive, ngoài scope                    |
| 11  | AdminHeader         | ❌               | 1        | **NOT READY**           | Display only, không phải nav                       |
| 12  | AccountShell        | ❌               | 2        | **NOT READY**           | Không có primitive, ngoài scope                    |

**Tổng kết scope 4D.2:**

```text
READY:    2 item  (Pagination/AdminPagination qua adapter, Breadcrumb public)
          → 13 consumer tiềm năng (11 admin + 2 public)

NOT READY: 10 item
          → 0 consumer migration trong 4D.2
          → 7 item ngoài scope (không có primitive)
          → 2 item 0 demand (Tabs, Accordion)
          → 1 item Blocked (AdminBreadcrumb)
```

---

## 2. EXECUTION ORDER

Thứ tự triển khai an toàn nhất, dựa trên nguyên tắc: **rủi ro thấp trước, rủi ro cao sau; admin trước public (admin noindex → không ảnh hưởng SEO); adapter trước swap consumer.**

### Phase 4D.2 — Execution Order

```text
┌─────────────────────────────────────────────────────────────┐
│ STEP 0 — Pre-flight (KHÔNG đổi code)                        │
│   - Confirm audit 4D.1 số liệu (11 admin, 2 public)         │
│   - Snapshot baseline: npm run lint/typecheck/build         │
│   - Quyết định product: AdminPagination có thêm số trang?   │
│     (YES → Primitive full | NO → adapter giữ prev/next)     │
└─────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│ STEP 1 — Pagination Adapter (admin, không SEO risk)         │
│   1a. Tạo AdminPaginationAdapter (giữ API cũ)               │
│       - map page → currentPage                              │
│       - build getPageHref từ basePath + searchParams         │
│       - quyết định Link vs <a> (xem mục 3)                  │
│   1b. Validate: lint/typecheck/build                        │
│   1c. Swap 1 consumer试点 (cities) → test → validate        │
│   1d. Swap 10 consumer còn lại (batch)                      │
│   1e. Validate toàn bộ: lint/typecheck/build + manual       │
└─────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│ STEP 2 — Breadcrumb Public (SEO risk, cẩn thận)             │
│   2a. Tạo helper map name/url → label/href                  │
│   2b. Confirm JSON-LD breadcrumbJsonLd KHÔNG bị động        │
│   2c. Swap [slug] breadcrumb UI → Primitive                 │
│       (GIỮ nguyên breadcrumbJsonLd call)                    │
│   2d. Validate: JSON-LD còn trong DOM, lint/typecheck/build │
│   2e. Swap phong/[slug] breadcrumb UI → Primitive           │
│   2f. Validate lại + test SEO (Google Rich Results)         │
└─────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│ STEP 3 — Post-migration validation                          │
│   - npm run lint/typecheck/build                            │
│   - Regression checklist (mục 5)                            │
│   - Cập nhật audit coverage (0% → X%)                       │
└─────────────────────────────────────────────────────────────┘
```

### 2.1 Tại sao thứ tự này an toàn?

| Thứ tự | Item                          | Lý do an toàn                                                                                                                                                                    |
| ------ | ----------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1      | Pagination (admin)            | **Không SEO risk** (admin noindex). Coverage cao nhất (11). Adapter giữ API → 11 trang không refactor. Nếu lỗi, chỉ ảnh hưởng admin (user nội bộ), không ảnh hưởng customer/SEO. |
| 2      | Breadcrumb (public)           | **SEO risk cao** → làm sau khi đã có quy trình validate từ Pagination. Chỉ 2 consumer. Phải giữ JSON-LD riêng. Nếu lỗi, ảnh hưởng SEO public → cần rollback nhanh.               |
| —      | Tabs / Accordion              | **KHÔNG làm** — 0 demand.                                                                                                                                                        |
| —      | AdminBreadcrumb               | **KHÔNG làm** — Blocked.                                                                                                                                                         |
| —      | SiteHeader/Footer/Sidebar/... | **KHÔNG làm** — ngoài scope, không có primitive.                                                                                                                                 |

### 2.2 Nguyên tắc "adapter trước swap consumer"

- Bước 1a/2a tạo adapter/helper **trước** khi swap bất kỳ consumer nào.
- Adapter/helper được validate độc lập (lint/typecheck/build pass).
- Sau đó swap **1 consumer试点** (cities cho Pagination, `[slug]` cho Breadcrumb) → test kỹ → mới swap batch còn lại.
- Nguyên tắc: **không bao giờ swap toàn bộ 11/2 consumer cùng lúc mà không có试点.**

---

## 3. ADAPTER STRATEGY

### 3.1 Trường hợp đặc biệt: AdminPagination → Pagination Primitive

Đây là item quan trọng nhất (ROI cao nhất) và cũng là item có API mismatch rõ nhất. Phân tích chi tiết dưới đây. **KHÔNG CODE — chỉ phân tích.**

#### 3.1.1 So sánh API

| Khía cạnh                       | [`AdminPagination`](src/components/ui/admin-data-table.tsx:121) (hiện tại)                                | [`Pagination`](src/components/ui/pagination.tsx:24) (Primitive)  | Mismatch?                                            |
| ------------------------------- | --------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------- | ---------------------------------------------------- |
| **Tên prop trang hiện tại**     | `page: number`                                                                                            | `currentPage: number`                                            | ⚠️ Yes — tên khác                                    |
| **Tổng trang**                  | `totalPages: number`                                                                                      | `totalPages: number`                                             | ✅ Same                                              |
| **Cách tạo href**               | `basePath: string` + `searchParams?: Record<string,string\|undefined>` → tự build `${basePath}?${params}` | `getPageHref: (page: number) => string` (callback)               | ⚠️ Yes — pattern khác hẳn                            |
| **Số trang hiển thị**           | KHÔNG có (chỉ "Trang X/Y" + 2 nút)                                                                        | `siblingCount?: number` (default 1) → render số trang + ellipsis | ⚠️ Yes — UI change                                   |
| **Link component**              | `next/link` [`Link`](src/components/ui/admin-data-table.tsx:145)                                          | `<a>` thuần                                                      | ⚠️ Yes — **CRITICAL** (mất client-side nav/prefetch) |
| **Wrapper semantic**            | `<div>`                                                                                                   | `<nav aria-label="Phân trang">`                                  | ⚠️ Yes — a11y gain                                   |
| **aria-current**                | ❌ Không có                                                                                               | ✅ `aria-current="page"`                                         | ✅ a11y gain                                         |
| **aria-label prev/next**        | ❌ Không có                                                                                               | ✅ `aria-label="Trang trước/Trang sau"`                          | ✅ a11y gain                                         |
| **aria-disabled biên**          | ✅ Có                                                                                                     | ✅ Render `null` (không render nút ở biên)                       | ⚠️ Behavior khác                                     |
| **Empty case (totalPages ≤ 1)** | ✅ Render "Trang 1/1" + 2 nút disabled                                                                    | ❌ `return null` (KHÔNG render gì)                               | ⚠️ Yes — **behavior change**                         |
| **Container styling**           | `rounded-2xl border bg-white p-4 justify-between`                                                         | `flex items-center gap-1 text-sm` (không có card wrapper)        | ⚠️ Yes — mất card style                              |

#### 3.1.2 Phân tích API mismatch — 5 điểm cần giải quyết

**Mismatch #1 — Tên prop `page` vs `currentPage`:**

- Nhỏ, dễ map trong adapter: `currentPage={page}`.
- Risk: LOW.

**Mismatch #2 — Pattern tạo href (`basePath+searchParams` vs `getPageHref`):**

- AdminPagination tự build href từ `basePath` + `searchParams` (merge tất cả param, set `page`).
- Primitive nhận callback `getPageHref(page)`.
- Adapter giải quyết: định nghĩa `getPageHref = (p) => makeHref(p)` bên trong, dùng lại logic `makeHref` hiện có của AdminPagination.
- Risk: LOW — logic makeHref đã có sẵn, chỉ wrap thành callback.

**Mismatch #3 — Link component (`next/link` vs `<a`):**

- **CRITICAL.** Primitive dùng `<a>` thuần → click pagination = **full page reload**, mất client-side navigation + prefetch của Next.js App Router.
- AdminPagination hiện dùng `next/link` [`Link`](src/components/ui/admin-data-table.tsx:145) → client-side nav, prefetch trang kế.
- 2 lựa chọn:
  - **(A) Chấp nhận `<a>`:** đơn giản, adapter chỉ wrap Primitive. Trade-off: admin pagination click = full reload (UX giảm nhẹ, admin user nội bộ chấp nhận được). Risk: MEDIUM.
  - **(B) Refactor Primitive nhận `LinkComponent`:** Primitive trở nên generic, nhận prop `as?: ComponentType` hoặc dùng `next/link` bên trong. Trade-off: Primitive phụ thuộc Next.js (viết nguyên tắc "nền tảng dùng chung, không thêm dependency"). Risk: LOW cho runtime, nhưng vi phạm nguyên tắc thiết kế Primitive.
- **Khuyến nghị:** Lựa chọn (A) cho 4D.2 — chấp nhận `<a>` vì admin noindex + user nội bộ + pagination admin ít click liên tục. Nếu UX quan trọng, làm (B) trong phase riêng. **Quyết định product cần xác nhận trước STEP 1.**

**Mismatch #4 — UI change (thêm số trang + ellipsis):**

- AdminPagination hiện: "Trang X/Y" + 2 nút "Trước"/"Sau".
- Primitive: số trang 1 ... 3 4 **5** 6 7 ... 20 + ‹ ›.
- Audit R1: cần quyết định product — có thêm số trang vào admin không?
- 2 lựa chọn:
  - **(A) Primitive full (có số trang):** UI change, user admin thấy số trang → dễ nhảy trang. Trade-off: tràn trên mobile rất hẹp (audit 6.4). Risk: MEDIUM.
  - **(B) Adapter giữ UI prev/next:** KHÔNG dùng Primitive render số trang, chỉ wrap `<nav>` + aria + dùng Primitive prev/next. Trade-off: KHÔNG phải "migration to Primitive" thật sự — chỉ mượn semantic. Risk: LOW nhưng mất giá trị migration.
- **Khuyến nghị:** Lựa chọn (A) nếu product OK. Nếu product muốn giữ UI cũ → chọn (B) hoặc patch trực tiếp accessibility (không migration Primitive). **Quyết định product cần xác nhận trước STEP 0.**

**Mismatch #5 — Empty case (`totalPages ≤ 1`):**

- AdminPagination: luôn render "Trang 1/1" + 2 nút disabled (thông tin cho user biết chỉ có 1 trang).
- Primitive: `if (totalPages <= 1) return null` (KHÔNG render gì).
- Adapter giải quyết: nếu muốn giữ behavior "Trang 1/1", adapter render fallback khi `totalPages <= 1` (KHÔNG gọi Primitive). Nếu chấp nhận Primitive behavior (ẩn khi 1 trang), adapter gọi Primitive trực tiếp.
- Risk: LOW — behavior change nhỏ, admin user không phụ thuộc "Trang 1/1" text.

#### 3.1.3 Thiết kế Adapter (KHÔNG CODE — chỉ mô tả)

**Tên:** Giữ `AdminPagination` (đổi implementation bên trong) HOẶC tạo `AdminPaginationAdapter` mới + deprecate `AdminPagination` cũ. Khuyến nghị: **giữ tên `AdminPagination`** để 11 consumer không phải đổi import.

**API (giữ nguyên — 0 consumer phải refactor):**

```text
AdminPagination({
  page: number,           // giữ nguyên
  totalPages: number,     // giữ nguyên
  basePath: string,       // giữ nguyên
  searchParams?: Record<string, string | undefined>,  // giữ nguyên
  showPageNumbers?: boolean,  // MỚI — default true (Primitive full), false = giữ UI prev/next
})
```

**Logic bên trong (mô tả, không code):**

```text
function AdminPagination({ page, totalPages, basePath, searchParams, showPageNumbers = true }) {
  // 1. Build getPageHref callback (dùng lại logic makeHref hiện có)
  const getPageHref = (p) => {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(searchParams ?? {}))
      if (value) params.set(key, value);
    params.set("page", String(p));
    return `${basePath}?${params.toString()}`;
  };

  // 2. Empty case — giữ behavior "Trang 1/1" nếu product muốn
  if (totalPages <= 1) {
    return <div className="...card...">Trang 1 / 1</div>;  // fallback
  }

  // 3. Gọi Primitive
  if (showPageNumbers) {
    return (
      <div className="...card wrapper...">
        <Pagination currentPage={page} totalPages={totalPages} getPageHref={getPageHref} />
      </div>
    );
  }

  // 4. (Optional) UI prev/next only — wrap <nav> + aria, KHÔNG dùng Primitive số trang
  //    → chỉ nếu product chọn (B)
}
```

**Lưu ý thiết kế:**

- Adapter **wrap Primitive trong card wrapper** (`rounded-2xl border bg-white p-4`) để giữ visual style admin hiện tại — Primitive chỉ lo `<nav>` + số trang, adapter lo container.
- Nếu chọn Link (B) ở Mismatch #3, adapter KHÔNG thể wrap trực tiếp vì Primitive hardcode `<a>`. Khi đó cần (B) refactor Primitive hoặc (A) chấp nhận `<a>`.

#### 3.1.4 Tóm tắt Adapter Strategy — AdminPagination

| Mismatch                                    | Giải pháp                                                                                  | Risk   |
| ------------------------------------------- | ------------------------------------------------------------------------------------------ | ------ |
| #1 `page` vs `currentPage`                  | Map trong adapter                                                                          | LOW    |
| #2 `basePath+searchParams` vs `getPageHref` | Wrap makeHref thành callback                                                               | LOW    |
| #3 `Link` vs `<a`                           | **Quyết định product:** (A) chấp nhận `<a>` [khuyến nghị 4D.2] hoặc (B) refactor Primitive | MEDIUM |
| #4 UI số trang                              | **Quyết định product:** (A) Primitive full [khuyến nghị] hoặc (B) giữ prev/next            | MEDIUM |
| #5 Empty case                               | Adapter fallback "Trang 1/1" khi totalPages ≤ 1                                            | LOW    |

**Kết luận Adapter:** Adapter khả thi, giữ API cũ → 11 consumer 0 refactor. **2 quyết định product phải chốt trước STEP 0:** (1) Link vs `<a>`, (2) có thêm số trang không. Cả 2 đều KHÔNG block migration — chỉ quyết định trade-off.

### 3.2 Adapter Strategy — Breadcrumb Public (ngắn gọn)

| Mismatch                   | Giải pháp                                                                                                          | Risk           |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------ | -------------- |
| `name/url` vs `label/href` | Helper map `breadcrumbs.map(b => ({ label: b.name, href: b.url }))`                                                | LOW            |
| JSON-LD dependency         | **KHÔNG gộp** — giữ [`breadcrumbJsonLd`](src/lib/seo/index.tsx:117) call nguyên vẹn, chỉ thay phần `<nav>` visible | HIGH (nếu sai) |
| `aria-current` mục cuối    | Primitive tự thêm                                                                                                  | LOW (gain)     |
| separator `aria-hidden`    | Primitive tự thêm                                                                                                  | LOW (gain)     |

**Adapter:** KHÔNG cần wrapper component — chỉ cần helper map type + swap trực tiếp `<nav>` inline thành `<Breadcrumb items={mapped} />`. JSON-LD call giữ nguyên ở cùng file.

---

## 4. ROLLBACK PLAN

### 4.1 Nguyên tắc rollback

- **Rollback per-phase, không rollback toàn bộ** — mỗi STEP (1 Pagination, 2 Breadcrumb) rollback độc lập.
- **Rollback = revert file về trạng thái trước STEP**, không "patch forward" (tránh tạo lỗi mới).
- **Snapshot git trước mỗi STEP** — đảm bảo có điểm khôi phục rõ ràng.
- **Rollback priority:** SEO (Breadcrumb public) > Admin (Pagination) — vì SEO lỗi ảnh hưởng customer/indexing, admin lỗi chỉ ảnh hưởng user nội bộ.

### 4.2 Rollback theo phase

#### Phase 4D.2 STEP 1 — Pagination (Admin) rollback

**Trigger rollback (bất kỳ điều kiện nào):**

- `npm run build` fail sau swap consumer.
- Admin pagination click gây lỗi runtime (vd: href sai format, trang trắng).
- Accessibility regression (vd: `aria-current` sai, screen reader đọc sai).
- UI break trên mobile (số trang tràn, layout shift).

**File rollback:**

| File                                                                                                                                                     | Hành động rollback                                                                                                                               |
| -------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| [`src/components/ui/admin-data-table.tsx`](src/components/ui/admin-data-table.tsx:121)                                                                   | Revert `AdminPagination` về implementation cũ (prev/next + `<div>` + `next/link`) — HOẶC xóa adapter nếu tạo file mới                            |
| 11 file consumer admin (cities, districts, wards, audit-logs, users, points-of-interest, upgrade-requests, landlords, permissions, landing-pages, roles) | Revert import/usage về `AdminPagination` cũ (thực tế nếu giữ tên `AdminPagination` + giữ API, consumer KHÔNG đổi → 0 file consumer cần rollback) |

**Lợi thế giữ tên + giữ API:** Nếu adapter giữ tên `AdminPagination` và giữ API `page/totalPages/basePath/searchParams`, thì **rollback chỉ cần revert 1 file** (`admin-data-table.tsx`). 11 consumer không động → không cần rollback. Đây là lý do adapter strategy quan trọng.

**Rollback order:**

1. `git revert` commit STEP 1 (hoặc `git checkout <snapshot> -- src/components/ui/admin-data-table.tsx`).
2. `npm run lint && npm run typecheck && npm run build` — confirm pass.
3. Manual test 1-2 trang admin pagination.
4. Nếu pass → rollback hoàn tất. Nếu fail → escalate (xem 4.4).

#### Phase 4D.2 STEP 2 — Breadcrumb (Public) rollback

**Trigger rollback (bất kỳ điều kiện nào — NGHIÊM NGẶT hơn admin):**

- JSON-LD `BreadcrumbList` biến mất khỏi DOM (SEO catastrophe).
- `npm run build` fail.
- Breadcrumb UI render sai (sai link, sai label, sai thứ tự).
- Google Rich Results Test báo lỗi BreadcrumbList.
- Regression accessibility (vd: mất `aria-current`).

**File rollback:**

| File                                                                 | Hành động rollback                                                               |
| -------------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| [`src/app/[slug]/page.tsx`](src/app/[slug]/page.tsx:159)             | Revert phần `<nav>` breadcrumb về inline cũ (giữ nguyên `breadcrumbJsonLd` call) |
| [`src/app/phong/[slug]/page.tsx`](src/app/phong/[slug]/page.tsx:165) | Revert phần `<nav>` breadcrumb về inline cũ (giữ nguyên `breadcrumbJsonLd` call) |
| Helper map (nếu tạo file mới)                                        | Xóa file helper                                                                  |

**Rollback order:**

1. **KHÔNG động vào [`src/lib/seo/index.tsx`](src/lib/seo/index.tsx:117)** — JSON-LD phải còn nguyên.
2. `git revert` commit STEP 2 (hoặc `git checkout <snapshot> -- src/app/[slug]/page.tsx src/app/phong/[slug]/page.tsx`).
3. `npm run build` — confirm pass.
4. **Test SEO bắt buộc:** mở page `[slug]` + `phong/[slug]` → view source → confirm JSON-LD `BreadcrumbList` còn trong `<script type="application/ld+json">`.
5. Google Rich Results Test trên 1 URL public.
6. Nếu pass → rollback hoàn tất. Nếu JSON-LD mất → escalate ngay (xem 4.4).

### 4.3 Rollback matrix

| Phase                      | Trigger                                         | File rollback                                          | Số file | Ưu tiên  |
| -------------------------- | ----------------------------------------------- | ------------------------------------------------------ | ------- | -------- |
| STEP 1 (Pagination admin)  | build fail / runtime / a11y / mobile break      | `admin-data-table.tsx` (+ 0 consumer nếu giữ API)      | 1       | Medium   |
| STEP 2 (Breadcrumb public) | JSON-LD mất / build fail / SEO test fail / a11y | `[slug]/page.tsx` + `phong/[slug]/page.tsx` (+ helper) | 2-3     | **HIGH** |

### 4.4 Escalation (khi rollback không giải quyết)

- Nếu rollback STEP 1 mà build vẫn fail → kiểm tra có conflict với commit khác không. Escalate: tạo branch `hotfix/4d.2-rollback` từ snapshot trước toàn bộ 4D.2.
- Nếu rollback STEP 2 mà JSON-LD vẫn mất → kiểm tra [`src/lib/seo/index.tsx`](src/lib/seo/index.tsx:117) có bị động không (phải KHÔNG). Nếu bị động → revert file đó về snapshot. Escalate SEO team re-submit sitemap.
- **Worst case:** rollback toàn bộ 4D.2 → `git revert` toàn bộ commit 4D.2 → codebase về trạng thái audit 4D.1 (0 consumer, primitive còn nguyên).

---

## 5. REGRESSION CHECKLIST

Checklist chạy sau mỗi STEP (1 và 2) + sau toàn bộ 4D.2. Mỗi item: ✅ pass / ❌ fail (→ rollback).

### 5.1 UI

- [ ] Pagination admin: render đúng số trang + ellipsis (nếu chọn UI số trang) HOẶC prev/next (nếu giữ cũ).
- [ ] Pagination admin: nút active highlight đúng trang hiện tại.
- [ ] Pagination admin: prev/next ẩn/hiện đúng ở biên (trang 1 ẩn prev, trang cuối ẩn next — Primitive behavior) HOẶC disabled (nếu adapter giữ behavior cũ).
- [ ] Pagination admin: card wrapper (`rounded-2xl border bg-white`) còn nguyên.
- [ ] Breadcrumb public: render đúng thứ tự items, separator `/` hiển thị.
- [ ] Breadcrumb public: mục cuối highlight (font-medium, color khác) — KHÔNG phải link.
- [ ] Breadcrumb public: mục giữa là link, hover underline + blue.
- [ ] KHÔNG có layout shift / CLS khi render pagination/breadcrumb.

### 5.2 Mobile

- [ ] Pagination admin mobile (lg:hidden / viewport < 1024px): số trang không tràn, flex-wrap hoạt động.
- [ ] Pagination admin mobile rất hẹp (320px): test siblingCount, có thể giảm `siblingCount=0` nếu tràn.
- [ ] Breadcrumb public mobile: flex-wrap, không tràn ngang.
- [ ] Breadcrumb public mobile: separator không xuống dòng lẻ.
- [ ] Touch target ≥ 44px (min-h-9 = 36px — kiểm tra, có thể cần tăng lên min-h-11 cho mobile).
- [ ] SiteHeader mobile menu (`<details>`) KHÔNG bị động (ngoài scope, nhưng confirm không regression).

### 5.3 SEO

- [ ] **JSON-LD `BreadcrumbList` còn trong DOM** page `[slug]` — view source `<script type="application/ld+json">`.
- [ ] **JSON-LD `BreadcrumbList` còn trong DOM** page `phong/[slug]`.
- [ ] JSON-LD `ItemList` (page `[slug]`) KHÔNG bị động.
- [ ] JSON-LD `Residence` (page `phong/[slug]`) KHÔNG bị động.
- [ ] [`breadcrumbJsonLd`](src/lib/seo/index.tsx:117) function KHÔNG bị sửa/xóa.
- [ ] Google Rich Results Test: page `[slug]` → BreadcrumbList PASS.
- [ ] Google Rich Results Test: page `phong/[slug]` → BreadcrumbList + Residence PASS.
- [ ] Sitemap [`src/app/sitemap.ts`](src/app/sitemap.ts) KHÔNG bị động.
- [ ] Robots [`src/app/robots.ts`](src/app/robots.ts) KHÔNG bị động.
- [ ] Admin pagination: KHÔNG có SEO risk (admin noindex) — confirm admin route vẫn noindex.

### 5.4 Accessibility

- [ ] Pagination admin: `<nav aria-label="Phân trang">` present.
- [ ] Pagination admin: `aria-current="page"` trên nút trang hiện tại.
- [ ] Pagination admin: `aria-label="Trang trước"` / `"Trang sau"` trên prev/next.
- [ ] Pagination admin: keyboard navigable (Tab qua các nút).
- [ ] Breadcrumb public: `<nav aria-label="breadcrumb">` present.
- [ ] Breadcrumb public: `aria-current="page"` trên mục cuối.
- [ ] Breadcrumb public: separator `aria-hidden="true"`.
- [ ] Screen reader test (NVDA/VoiceOver): pagination đọc "Phân trang, trang 5, trang hiện tại" / breadcrumb đọc "breadcrumb, Home, Tìm phòng, trang hiện tại".
- [ ] KHÔNG regression accessibility ở component ngoài scope (SiteHeader, AdminSidebar, AccountShell — confirm không bị động).

### 5.5 Admin

- [ ] 11 trang admin pagination hoạt động: cities, districts, wards, audit-logs, users, points-of-interest, upgrade-requests, landlords, permissions, landing-pages, roles.
- [ ] Click trang 2 → URL đổi `?page=2`, data đổi.
- [ ] Click "Trước" ở trang 1 → disabled/ẩn (không lỗi).
- [ ] Click "Sau" ở trang cuối → disabled/ẩn (không lỗi).
- [ ] Search + pagination kết hợp: `?search=abc&page=2` giữ search param khi đổi trang.
- [ ] RBAC: trang admin cần permission vẫn check đúng (pagination KHÔNG ảnh hưởng RBAC).
- [ ] `getPagination` helper [`src/server/admin/utils.ts`](src/server/admin/utils.ts:60) KHÔNG bị động.

### 5.6 Customer (public)

- [ ] Homepage [`src/app/page.tsx`](src/app/page.tsx) KHÔNG bị regression.
- [ ] SEO landing `[slug]`: breadcrumb UI hiển thị đúng + JSON-LD còn.
- [ ] Room detail `phong/[slug]`: breadcrumb UI hiển thị đúng + JSON-LD còn.
- [ ] Room detail mobile CTA bar (fixed bottom) KHÔNG bị động.
- [ ] SiteHeader/SiteFooter KHÔNG bị regression (ngoài scope, confirm).
- [ ] Search/filter flow KHÔNG bị động.

### 5.7 Account / Landlord

- [ ] [`AccountShell`](src/components/layouts/account-shell.tsx:49) KHÔNG bị regression (ngoài scope).
- [ ] Account layout [`src/app/account/layout.tsx`](src/app/account/layout.tsx:30) render đúng.
- [ ] Landlord layout [`src/app/landlord/layout.tsx`](src/app/landlord/layout.tsx:19) render đúng.
- [ ] Account/Landlord sidebar active state visual còn đúng.
- [ ] Account/Landlord mobile nav horizontal scroll còn đúng.
- [ ] Logout flow (AccountShell) KHÔNG bị động.

---

## 6. RISK MATRIX

Phân loại LOW / MEDIUM / HIGH cho mỗi rủi ro đã phát hiện. Risk = kết hợp **probability** (xác suất xảy ra) × **impact** (mức ảnh hưởng).

| #   | Rủi ro                                                       | Vị trí                      | Probability | Impact   | Risk       | Mitigation                                                                                                                        |
| --- | ------------------------------------------------------------ | --------------------------- | ----------- | -------- | ---------- | --------------------------------------------------------------------------------------------------------------------------------- |
| R1  | UI change khi thêm số trang admin                            | AdminPagination → Primitive | Medium      | Low      | **MEDIUM** | Quyết định product STEP 0. Nếu không OK → adapter giữ prev/next (Option B).                                                       |
| R2  | SEO JSON-LD dependency bị động/xóa                           | Breadcrumb public           | Low         | Critical | **HIGH**   | KHÔNG gộp JSON-LD vào Primitive. Giữ [`breadcrumbJsonLd`](src/lib/seo/index.tsx:117) nguyên vẹn. Rollback STEP 2 nếu JSON-LD mất. |
| R3  | API mismatch `name/url` vs `label/href`                      | Breadcrumb public           | High        | Low      | **LOW**    | Helper map type. Validate typecheck.                                                                                              |
| R4  | AdminBreadcrumb Blocked (Primitive không tương đương)        | `admin-breadcrumb.tsx`      | High        | Low      | **MEDIUM** | KHÔNG migration. Giữ implementation cũ hoặc redesign riêng (ngoài 4D.2).                                                          |
| R5  | Tabs/Accordion không có demand                               | Toàn codebase               | —           | —        | **LOW**    | KHÔNG migration trong 4D.x. Đợi use case thực tế.                                                                                 |
| R6  | SiteHeader mobile menu `<details>` accessibility             | `site-header.tsx`           | High        | Medium   | **MEDIUM** | Ngoài scope 4D.2 (không có primitive). Đề xuất phase riêng. KHÔNG động trong 4D.2.                                                |
| R7  | Thiếu `aria-current="page"` ở sidebar active                 | AdminSidebar, AccountShell  | High        | Low      | **LOW**    | Ngoài scope 4D.2. Patch trực tiếp (không cần Primitive) nếu muốn.                                                                 |
| R8  | Link vs `<a>` — mất client-side nav/prefetch                 | AdminPagination → Primitive | High        | Medium   | **MEDIUM** | Quyết định product STEP 0. (A) chấp nhận `<a>` [khuyến nghị] hoặc (B) refactor Primitive.                                         |
| R9  | Empty case `totalPages ≤ 1` — Primitive return null          | AdminPagination → Primitive | High        | Low      | **LOW**    | Adapter fallback "Trang 1/1" khi totalPages ≤ 1.                                                                                  |
| R10 | Mobile rất hẹp (320px) — số trang tràn                       | Pagination admin mobile     | Medium      | Low      | **MEDIUM** | Test 320px. Giảm `siblingCount=0` nếu tràn. Hoặc giữ UI prev/next (Option B).                                                     |
| R11 | 11 consumer swap đồng loạt gây regression                    | Admin pagination            | Medium      | Medium   | **MEDIUM** | Swap 1试点 (cities) trước → test → swap batch. Adapter giữ API → consumer 0 refactor.                                             |
| R12 | Card wrapper style mất khi wrap Primitive                    | AdminPagination             | Medium      | Low      | **LOW**    | Adapter wrap Primitive trong card wrapper (`rounded-2xl border bg-white p-4`).                                                    |
| R13 | `aria-disabled` biên → Primitive render null (behavior khác) | AdminPagination → Primitive | Medium      | Low      | **LOW**    | Acceptable — Primitive ẩn nút biên thay vì disabled. Document behavior change.                                                    |
| R14 | Rollback không sạch (conflict commit)                        | Toàn 4D.2                   | Low         | Medium   | **LOW**    | Snapshot git trước mỗi STEP. Rollback per-STEP. Worst case revert toàn 4D.2.                                                      |

### 6.1 Risk summary

```text
HIGH:    1  (R2 — SEO JSON-LD)
MEDIUM:  6  (R1, R4, R6, R8, R10, R11)
LOW:     7  (R3, R5, R7, R9, R12, R13, R14)
```

### 6.2 Risk theo phase

| Phase                      | Risk cao nhất               | Có block migration?                                                        |
| -------------------------- | --------------------------- | -------------------------------------------------------------------------- |
| STEP 1 (Pagination admin)  | R8 (MEDIUM) — Link vs `<a>` | ❌ Không block — quyết định product                                        |
| STEP 2 (Breadcrumb public) | R2 (HIGH) — JSON-LD         | ⚠️ Không block nhưng NGHIÊM NGẶT — phải giữ JSON-LD, rollback ngay nếu mất |

### 6.3 Risk KHÔNG nằm trong scope 4D.2 (ghi nhận, không xử lý)

- R4 (AdminBreadcrumb Blocked): KHÔNG migration.
- R5 (Tabs/Accordion 0 demand): KHÔNG migration.
- R6 (SiteHeader mobile menu): ngoài scope, phase riêng.
- R7 (sidebar `aria-current`): patch trực tiếp nếu muốn, không phải migration Primitive.

---

## 7. PHẠM VI KHÔNG ĐỤNG (ZERO CODE trong 4D.2 PLAN)

Bản kế hoạch này KHÔNG code, KHÔNG patch, KHÔNG sửa file. Chỉ tạo document:

- ❌ UI / UX / Layout
- ❌ Business Logic / API / Database
- ❌ Authentication / Authorization / Middleware
- ❌ SEO / Analytics / RBAC
- ❌ Không thêm dependency / package / debug code / console log

**File duy nhất được tạo trong phase này:** `docs/PHASE_4D_2_GLOBAL_NAVIGATION_MIGRATION_PLAN.md` (bản kế hoạch).

---

## 8. KẾT LUẬN

Phase 4D.2 Migration Plan hoàn thành dựa trên **số liệu audit thực tế** từ 4D.1:

- **READY (2 item, 13 consumer):** Pagination/AdminPagination (qua adapter, 11 admin) + Breadcrumb public (2 public, giữ JSON-LD).
- **NOT READY (10 item):** Tabs/Accordion (0 demand), AdminBreadcrumb (Blocked), 7 item ngoài scope (không có primitive).
- **Execution order:** Pagination admin trước (không SEO risk, adapter giữ API) → Breadcrumb public sau (SEO risk, cẩn thận JSON-LD).
- **Adapter Strategy:** AdminPagination adapter giữ API `page/totalPages/basePath/searchParams`, map sang Primitive `currentPage/getPageHref`, wrap card style. 2 quyết định product: Link vs `<a>`, có thêm số trang không.
- **Rollback:** per-STEP, snapshot git, rollback priority SEO > admin. Worst case revert toàn 4D.2.
- **Regression:** 7 nhóm (UI, Mobile, SEO, Accessibility, Admin, Customer, Account) — 40+ checkpoint.
- **Risk:** 1 HIGH (SEO JSON-LD), 6 MEDIUM, 7 LOW. Không risk nào block migration — chỉ cần quyết định product + giữ JSON-LD.

MIGRATION PLAN COMPLETE

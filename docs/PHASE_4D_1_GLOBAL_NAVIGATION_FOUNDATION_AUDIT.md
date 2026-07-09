# PHASE 4D.1 — GLOBAL NAVIGATION FOUNDATION AUDIT (ZERO UI CHANGE)

> **Loại phase:** Audit (KHÔNG migration, KHÔNG sửa UI, KHÔNG thay đổi behavior)
> **Mục tiêu:** Đo coverage thực tế của Navigation Primitive, đánh giá khả năng migration, phát hiện semantic/SEO/accessibility risk, xác định thứ tự migration tối ưu cho Phase 4D.2.
> **Nguyên tắc:** Dựa trên số liệu audit thực tế, không dựa trên giả định. Tránh lặp lại trường hợp Section/Card có coverage thấp.

---

## 0. TÓM TẮT EXECUTIVE

| Primitive  | Đã export                             | Đã dùng thực tế | Coverage | Đánh giá                                    |
| ---------- | ------------------------------------- | --------------- | -------- | ------------------------------------------- |
| Pagination | ✅ `src/components/ui/pagination.tsx` | ❌ 0 consumer   | 0%       | Production Ready nhưng **chưa có consumer** |
| Breadcrumb | ✅ `src/components/ui/breadcrumb.tsx` | ❌ 0 consumer   | 0%       | Production Ready nhưng **chưa có consumer** |
| Tabs       | ✅ `src/components/ui/tabs.tsx`       | ❌ 0 consumer   | 0%       | Production Ready nhưng **chưa có consumer** |

**Phát hiện cốt lõi:** Cả 3 Navigation Primitive đều đã được định nghĩa và export qua [`src/components/ui/index.ts`](src/components/ui/index.ts:46) nhưng **KHÔNG có bất kỳ file nào import/sử dụng** chúng. Toàn bộ navigation hiện tại dùng implementation ad-hoc (inline `<nav>`, `<Link>`, `<button>`).

**Validation:** `npm run lint` ✅ · `npm run typecheck` ✅ · `npm run build` ✅ (67 static pages, exit 0)

---

## 1. NAVIGATION INVENTORY

### 1.1 Pagination

#### 1.1.1 Primitive (chưa dùng)

- **File:** [`src/components/ui/pagination.tsx`](src/components/ui/pagination.tsx:24)
- **API:** `Pagination({ currentPage, totalPages, getPageHref, siblingCount })`
- **Semantic:** `<nav aria-label="Phân trang">` + `<a aria-current="page">` + ellipsis
- **Accessibility:** `aria-label="Trang trước/Trang sau"`, `aria-current="page"` ✅
- **Trạng thái:** Production Ready, 0 consumer

#### 1.1.2 Implementation hiện tại — `AdminPagination`

- **File:** [`src/components/ui/admin-data-table.tsx`](src/components/ui/admin-data-table.tsx:121)
- **Loại:** Prev/Next 2-button (KHÔNG có số trang, KHÔNG có ellipsis)
- **Semantic:** `<div>` (KHÔNG phải `<nav>`) + 2 `<Link>` "Trước"/"Sau"
- **Accessibility hiện tại:**
  - ❌ Thiếu `<nav>` wrapper
  - ❌ Thiếu `aria-label` cho vùng phân trang
  - ❌ Thiếu `aria-current="page"`
  - ✅ Có `aria-disabled` cho nút ở biên
- **Số lượng consumer:** **11 trang admin** dùng `AdminPagination`
  - [`src/app/admin/cities/page.tsx`](src/app/admin/cities/page.tsx:94)
  - [`src/app/admin/districts/page.tsx`](src/app/admin/districts/page.tsx:85)
  - [`src/app/admin/wards/page.tsx`](src/app/admin/wards/page.tsx:88)
  - [`src/app/admin/audit-logs/page.tsx`](src/app/admin/audit-logs/page.tsx:157)
  - [`src/app/admin/users/page.tsx`](src/app/admin/users/page.tsx:247)
  - [`src/app/admin/points-of-interest/page.tsx`](src/app/admin/points-of-interest/page.tsx:125)
  - [`src/app/admin/upgrade-requests/page.tsx`](src/app/admin/upgrade-requests/page.tsx:233)
  - [`src/app/admin/landlords/page.tsx`](src/app/admin/landlords/page.tsx:180)
  - [`src/app/admin/permissions/page.tsx`](src/app/admin/permissions/page.tsx:124)
  - [`src/app/admin/landing-pages/page.tsx`](src/app/admin/landing-pages/page.tsx:135)
  - [`src/app/admin/roles/page.tsx`](src/app/admin/roles/page.tsx:128)
- **Helper:** `getPagination(searchParams)` từ [`src/server/admin/utils.ts`](src/server/admin/utils.ts:10) — parse `page`/`pageSize`/`skip`/`take`

#### 1.1.3 Đánh giá migration

| Tiêu chí        | Đánh giá                                                                                                                                                                  |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Tương đương API | ⚠️ **Risk** — Primitive cần `getPageHref(page)` + `currentPage` + `totalPages`; AdminPagination nhận `page` + `totalPages` + `basePath` + `searchParams` và tự build href |
| UI tương đương  | ⚠️ **Risk** — Primitive render số trang + ellipsis; AdminPagination chỉ render "Trang X/Y" + 2 nút. Migration sẽ **thêm số trang** (UI change)                            |
| Accessibility   | ✅ Cải thiện rõ rệt (thêm `<nav>`, `aria-label`, `aria-current`)                                                                                                          |
| Responsive      | ✅ Primitive flex, không layout shift                                                                                                                                     |

**Kết luận Pagination:** **Migration Risk** (11/11). Cần adapter wrapper để giữ API `basePath` + `searchParams` hiện có, đồng thời chấp nhận UI change (thêm số trang). KHÔNG migration vội — cần quyết định có muốn thêm số trang vào admin hay không.

---

### 1.2 Breadcrumb

#### 1.2.1 Primitive (chưa dùng)

- **File:** [`src/components/ui/breadcrumb.tsx`](src/components/ui/breadcrumb.tsx:24)
- **API:** `Breadcrumb({ items: BreadcrumbItem[], separator })` với `BreadcrumbItem = { label, href? }`
- **Semantic:** `<nav aria-label="breadcrumb">` + `<ol>` + `<li>` + `aria-current="page"` cho mục cuối
- **Accessibility:** `aria-label="breadcrumb"`, `aria-current="page"`, separator `aria-hidden` ✅
- **Trạng thái:** Production Ready, 0 consumer

#### 1.2.2 Implementation hiện tại — Breadcrumb inline (public SEO)

**A. SEO Landing Page (`[slug]`)**

- **File:** [`src/app/[slug]/page.tsx`](src/app/[slug]/page.tsx:159)
- **Semantic:** `<nav aria-label="Breadcrumb">` + `<ol>` + `<li>` + `<Link>`
- **Accessibility hiện tại:**
  - ✅ Có `<nav aria-label="Breadcrumb">`
  - ❌ Thiếu `aria-current="page"` cho mục cuối (mục cuối vẫn là `<Link>`)
  - ❌ Separator `/` KHÔNG có `aria-hidden`
- **SEO dependency:** Có `breadcrumbJsonLd(breadcrumbs)` → JSON-LD `BreadcrumbList` ([`src/lib/seo/index.tsx`](src/lib/seo/index.tsx:117))
- **Số lượng:** 1 xuất hiện

**B. Room Detail (`phong/[slug]`)**

- **File:** [`src/app/phong/[slug]/page.tsx`](src/app/phong/[slug]/page.tsx:165)
- **Semantic:** `<nav aria-label="Breadcrumb">` + `<ol>` + `<li>` + `<Link>`
- **Accessibility hiện tại:** giống case A
  - ✅ Có `<nav aria-label="Breadcrumb">`
  - ❌ Thiếu `aria-current="page"` cho mục cuối
  - ❌ Separator `/` KHÔNG có `aria-hidden`
- **SEO dependency:** Có `breadcrumbJsonLd(breadcrumbs)` → JSON-LD `BreadcrumbList`
- **Số lượng:** 1 xuất hiện

**C. AdminBreadcrumb**

- **File:** [`src/components/layouts/admin-breadcrumb.tsx`](src/components/layouts/admin-breadcrumb.tsx:1)
- **Semantic:** `<div>` (KHÔNG phải `<nav>`) + join string `" / "`
- **Accessibility hiện tại:**
  - ❌ Thiếu `<nav>`
  - ❌ Thiếu `aria-label`
  - ❌ Thiếu `aria-current`
  - ❌ KHÔNG có link (chỉ text tĩnh)
- **SEO dependency:** KHÔNG (admin noindex)
- **Số lượng:** 1 xuất hiện (dùng trong [`src/app/admin/layout.tsx`](src/app/admin/layout.tsx:28))

#### 1.2.3 Đánh giá migration

| Tiêu chí        | Đánh giá                                                                                                                                                                                                                                                                       |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Tương đương API | ⚠️ **Risk** — Primitive nhận `items: { label, href? }`; code hiện tại dùng `breadcrumbs: { name, url }`. Cần map `name→label`, `url→href`                                                                                                                                      |
| UI tương đương  | ✅ Tương đương (cùng `<nav><ol><li>` + separator)                                                                                                                                                                                                                              |
| Accessibility   | ✅ Cải thiện (thêm `aria-current`, separator `aria-hidden`)                                                                                                                                                                                                                    |
| **SEO RISK**    | ⚠️ **CRITICAL** — Primitive chỉ render HTML visible. JSON-LD `BreadcrumbList` là **dependency riêng** ở [`src/lib/seo/index.tsx`](src/lib/seo/index.tsx:117). Migration Breadcrumb UI **KHÔNG được** xóa/di chuyển JSON-LD. Phải tách bạch: UI Breadcrumb ≠ SEO BreadcrumbList |

**Kết luận Breadcrumb:**

- Case A & B (public SEO): **Migration Risk** (2/2) — UI tương đương, accessibility cải thiện, nhưng **PHẢI giữ JSON-LD riêng**. Map `name/url → label/href`.
- Case C (AdminBreadcrumb): **Migration Blocked** (1/1) — Primitive yêu cầu `items` có `label`; AdminBreadcrumb hiện chỉ nhận `string[]` join. KHÔNG có link, KHÔNG có href. Primitive không tương đương (Primitive luôn render `<a>` hoặc `<span>` cho mỗi item, không phải join string).

---

### 1.3 Tabs

#### 1.3.1 Primitive (chưa dùng)

- **File:** [`src/components/ui/tabs.tsx`](src/components/ui/tabs.tsx:30)
- **API:** `Tabs({ items: TabItem[], defaultValue })` với `TabItem = { value, label, content }`
- **Semantic:** `role="tablist"` + `role="tab"` + `role="tabpanel"` + `aria-selected` + `aria-controls` + `aria-labelledby`
- **Accessibility:** Full ARIA tabs pattern + keyboard arrow navigation (ArrowLeft/ArrowRight) + roving `tabIndex` ✅
- **Trạng thái:** Production Ready, 0 consumer

#### 1.3.2 Implementation hiện tại — KHÔNG có tab thật

**Audit toàn bộ codebase: KHÔNG tìm thấy bất kỳ tab UI thực sự nào** (không `activeTab`, không `selectedTab`, không `role="tab"` ngoài primitive, không UI "Thông tin/Tiện ích/Đánh giá" dạng tab).

**Pattern gần tab nhưng KHÔNG phải tab:**

**A. NearMeSearch — radius selector**

- **File:** [`src/components/search/near-me-search.tsx`](src/components/search/near-me-search.tsx:67)
- **Pattern:** 5 `<Button>` (1km/3km/5km/10km/20km) + `useState(radius)` + active style
- **Bản chất:** **Toggle button group / segmented control**, KHÔNG phải tab (không có panel content đổi theo)
- **Accessibility:** ❌ Thiếu `role`, `aria-pressed`, `aria-label` cho group
- **Số lượng:** 1 xuất hiện

**B. SearchSection — quick filters**

- **File:** [`src/components/home/search-section.tsx`](src/components/home/search-section.tsx:53)
- **Pattern:** 7 `<Link>` quick filter (Dưới 2 triệu, Gần KCN...) — tất cả href cùng `/phong-tro-hai-phong`
- **Bản chất:** **Link list / chip filter**, KHÔNG phải tab (link điều hướng, không đổi content inline)
- **Số lượng:** 1 xuất hiện

**C. Admin filter — Select dropdown**

- **Files:** `admin/users`, `admin/upgrade-requests`, `admin/properties`, `admin/landing-pages`, `admin/settings`, `admin/points-of-interest`, `admin/permissions`
- **Pattern:** `<Select>` dropdown filter (status/category/group) + form submit
- **Bản chất:** **Form filter**, KHÔNG phải tab
- **Số lượng:** 7 xuất hiện

**D. Admin rooms — stat cards**

- **File:** [`src/app/admin/rooms/page.tsx`](src/app/admin/rooms/page.tsx:80)
- **Pattern:** 4 stat card (Tổng tin/Đang hoạt động/Đã ẩn/Bảo trì) — display only, không click
- **Bản chất:** **Stat display**, KHÔNG phải tab
- **Số lượng:** 1 xuất hiện

#### 1.3.3 Đánh giá migration

| Tiêu chí                  | Đánh giá                                                                                                                                                          |
| ------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Có tab thật để migration? | ❌ **KHÔNG** — 0 tab UI thực sự trong codebase                                                                                                                    |
| Primitive phù hợp?        | ✅ Primitive đúng chuẩn ARIA, nhưng **không có demand**                                                                                                           |
| Pattern gần tab           | ⚠️ NearMeSearch (segmented control) và quickFilters (link list) — Primitive Tabs **KHÔNG tương đương** (Tabs đổi content inline, 2 pattern này điều hướng/filter) |

**Kết luận Tabs:** **Migration Blocked** (0/0 consumer tiềm năng). Primitive đã sẵn sàng nhưng **không có use case thực tế** trong codebase hiện tại. Migration ép buộc sẽ tạo ra UI không tự nhiên (tab cho thứ không phải tab).

---

### 1.4 Other Navigation

#### 1.4.1 SiteHeader (Top Navigation + Mobile Menu)

- **File:** [`src/components/home/site-header.tsx`](src/components/home/site-header.tsx:15)
- **Loại:** Top nav (desktop) + mobile menu dropdown
- **Semantic:** `<header>` + `<nav>` (KHÔNG có `aria-label`)
- **Desktop:** 5 `<Link>` navItems trong `<div>` pill (lg:flex)
- **Mobile:** `<details><summary>☰</summary>` + dropdown `<Link>` (lg:hidden)
- **Accessibility hiện tại:**
  - ✅ Có `<nav>`
  - ❌ Thiếu `aria-label` cho `<nav>` (nên là `aria-label="Chính"`)
  - ❌ Mobile menu dùng `<details>` — KHÔNG có `aria-expanded`, KHÔNG có `aria-controls`, KHÔNG trap focus
  - ❌ Nút `☰` thiếu `aria-label`
  - ❌ Thiếu `aria-current="page"` cho nav item active
- **Responsive:** Desktop (lg:flex) / Mobile (lg:hidden details dropdown) — KHÔNG có tablet breakpoint riêng
- **Số lượng:** 1 xuất hiện (homepage)
- **Primitive phù hợp?** ❌ KHÔNG — đây là primary nav, không có primitive nào (Primitive chỉ có Pagination/Breadcrumb/Tabs)

#### 1.4.2 SiteFooter

- **File:** [`src/components/home/site-footer.tsx`](src/components/home/site-footer.tsx:12)
- **Loại:** Footer link columns (4 cột)
- **Semantic:** `<footer>` + `<h3>` + `<Link>`/`<span>`
- **Accessibility:** ❌ Thiếu `<nav>` cho nhóm link, ❌ thiếu `aria-label`
- **Số lượng:** 1 xuất hiện
- **Primitive phù hợp?** ❌ KHÔNG — footer nav, không có primitive

#### 1.4.3 AdminSidebar (Desktop) + AdminMobileNav (Mobile)

- **File:** [`src/components/layouts/admin-sidebar.tsx`](src/components/layouts/admin-sidebar.tsx:15)
- **Loại:** Sidebar nav (desktop) + horizontal scroll nav (mobile)
- **Desktop:** `<aside>` + `<nav aria-label="Admin navigation">` + `<Link>` items (filter theo permission)
- **Mobile:** `<nav aria-label="Admin mobile navigation">` + `<Link>` horizontal scroll (lg:hidden)
- **Accessibility hiện tại:**
  - ✅ Có `<nav>` + `aria-label` (cả desktop & mobile)
  - ❌ Thiếu `aria-current="page"` cho item active
  - ✅ RBAC filter đúng
- **Responsive:** Desktop (lg:block aside) / Mobile (lg:hidden horizontal nav) — clean breakpoint
- **Số lượng:** 2 component (sidebar + mobile nav), dùng trong [`src/app/admin/layout.tsx`](src/app/admin/layout.tsx:23)
- **Primitive phù hợp?** ❌ KHÔNG — sidebar nav, không có primitive

#### 1.4.4 AccountShell (Sidebar + Mobile Nav + Header)

- **File:** [`src/components/layouts/account-shell.tsx`](src/components/layouts/account-shell.tsx:49)
- **Loại:** Shell layout cho Account + Landlord (dùng chung)
- **Desktop:** `<aside>` + `<nav aria-label="${title} navigation">` + `<Link>` items (active state qua `usePathname`)
- **Mobile:** `<nav aria-label="${title} mobile navigation">` + `<Link>` horizontal scroll (lg:hidden)
- **Header:** `<header>` sticky + role badge
- **Accessibility hiện tại:**
  - ✅ Có `<nav>` + `aria-label` dynamic (cả desktop & mobile)
  - ✅ Có active state visual (bg-slate-900)
  - ❌ Thiếu `aria-current="page"` cho item active (chỉ đổi style, không có ARIA)
  - ✅ Icon `aria-hidden="true"`
- **Responsive:** Desktop (lg:block aside w-72) / Mobile (lg:hidden horizontal nav) — clean breakpoint
- **Số lượng:** 1 component, dùng cho cả Account ([`src/app/account/layout.tsx`](src/app/account/layout.tsx:30)) và Landlord ([`src/app/landlord/layout.tsx`](src/app/landlord/layout.tsx:19))
- **Primitive phù hợp?** ❌ KHÔNG — sidebar nav, không có primitive

#### 1.4.5 AdminHeader

- **File:** [`src/components/layouts/admin-header.tsx`](src/components/layouts/admin-header.tsx:3)
- **Loại:** Top header (sticky) — KHÔNG có nav, chỉ display info
- **Số lượng:** 1 xuất hiện

#### 1.4.6 Room Detail — Mobile Sticky CTA Bar

- **File:** [`src/app/phong/[slug]/page.tsx`](src/app/phong/[slug]/page.tsx:221)
- **Loại:** Fixed bottom bar (mobile only, lg:hidden) — 2 CTA (Gọi chủ trọ / Chỉ đường)
- **Bản chất:** Action bar, KHÔNG phải navigation
- **Số lượng:** 1 xuất hiện

---

## 2. COVERAGE ASSESSMENT

```text
Pagination
  Safe:    0
  Risk:   11  (AdminPagination × 11 trang admin — UI change khi thêm số trang)
  Blocked: 0

Breadcrumb
  Safe:    0
  Risk:    2  ([slug] + phong/[slug] — UI tương đương, phải giữ JSON-LD riêng)
  Blocked: 1  (AdminBreadcrumb — string[] join, không có href, Primitive không tương đương)

Tabs
  Safe:    0
  Risk:    0
  Blocked: 0  (KHÔNG có tab thật trong codebase — 0 consumer tiềm năng)

Other Navigation (KHÔNG có primitive)
  SiteHeader:        1  (top nav + mobile menu)
  SiteFooter:        1  (footer link columns)
  AdminSidebar:      2  (desktop + mobile)
  AccountShell:      1  (sidebar + mobile + header, dùng cho Account + Landlord)
  AdminHeader:       1  (display only)
  Room Mobile CTA:   1  (action bar, không phải nav)
```

**Tổng consumer tiềm năng cho Navigation Primitive:**

| Primitive  | Consumer tiềm năng | Safe | Risk | Blocked |
| ---------- | ------------------ | ---- | ---- | ------- |
| Pagination | 11                 | 0    | 11   | 0       |
| Breadcrumb | 3                  | 0    | 2    | 1       |
| Tabs       | 0                  | 0    | 0    | 0       |

---

## 3. PRIMITIVE FITNESS

### 3.1 Pagination Primitive

```text
Production Ready
```

- ✅ API rõ ràng (`currentPage`, `totalPages`, `getPageHref`, `siblingCount`)
- ✅ Semantic `<nav aria-label="Phân trang">`
- ✅ `aria-current="page"`, `aria-label` cho prev/next
- ✅ Ellipsis logic đúng
- ⚠️ **Needs Refinement (minor):** Thiếu adapter cho pattern `basePath` + `searchParams` của admin. Cần wrapper `AdminPaginationAdapter` để consumer hiện tại không phải refactor 11 trang.

### 3.2 Breadcrumb Primitive

```text
Production Ready
```

- ✅ API rõ ràng (`items: { label, href? }`, `separator`)
- ✅ Semantic `<nav aria-label="breadcrumb">` + `<ol>` + `<li>`
- ✅ `aria-current="page"` cho mục cuối, separator `aria-hidden`
- ⚠️ **Needs Refinement (minor):** API dùng `label/href`, code hiện tại dùng `name/url`. Cần helper map `breadcrumbJsonLd` items → Primitive items (hoặc unified type).
- ⚠️ **SEO boundary:** Primitive chỉ lo UI. JSON-LD `BreadcrumbList` phải giữ ở [`src/lib/seo/index.tsx`](src/lib/seo/index.tsx:117). KHÔNG gộp.

### 3.3 Tabs Primitive

```text
Production Ready (nhưng không có demand)
```

- ✅ Full ARIA tabs pattern (`role="tablist"/"tab"/"tabpanel"`, `aria-selected`, `aria-controls`, `aria-labelledby`)
- ✅ Keyboard navigation (ArrowLeft/ArrowRight) + roving tabIndex
- ✅ API rõ ràng (`items: { value, label, content }`, `defaultValue`)
- ❌ **Blocked:** 0 consumer tiềm năng. Codebase không có tab UI thực sự. Migration ép buộc = tạo UI không tự nhiên.

---

## 4. ACCESSIBILITY AUDIT

### 4.1 Đang đúng

| Vị trí                                   | Đúng                                                                            |
| ---------------------------------------- | ------------------------------------------------------------------------------- |
| Pagination Primitive                     | `<nav aria-label>`, `aria-current="page"`, `aria-label` prev/next               |
| Breadcrumb Primitive                     | `<nav aria-label="breadcrumb">`, `aria-current="page"`, separator `aria-hidden` |
| Tabs Primitive                           | Full ARIA tabs + keyboard nav                                                   |
| Public Breadcrumb ([slug], phong/[slug]) | `<nav aria-label="Breadcrumb">`                                                 |
| AdminSidebar / AdminMobileNav            | `<nav aria-label>`                                                              |
| AccountShell                             | `<nav aria-label>` dynamic                                                      |
| Modal / Drawer                           | `role="dialog"`, `aria-modal`, `aria-labelledby`                                |

### 4.2 Đang thiếu

| Vị trí                                   | Thiếu                                                             | Primitive cải thiện được?                                 |
| ---------------------------------------- | ----------------------------------------------------------------- | --------------------------------------------------------- |
| AdminPagination                          | `<nav>`, `aria-label`, `aria-current`                             | ✅ Pagination Primitive                                   |
| Public Breadcrumb ([slug], phong/[slug]) | `aria-current="page"` mục cuối, separator `aria-hidden`           | ✅ Breadcrumb Primitive                                   |
| AdminBreadcrumb                          | `<nav>`, `aria-label`, `aria-current`, link                       | ❌ Blocked (Primitive cần href)                           |
| SiteHeader `<nav>`                       | `aria-label`, `aria-current="page"` active                        | ❌ Không có primitive                                     |
| SiteHeader mobile menu                   | `aria-expanded`, `aria-controls`, focus trap, `aria-label` cho ☰ | ❌ Không có primitive                                     |
| SiteFooter                               | `<nav>` + `aria-label` cho nhóm link                              | ❌ Không có primitive                                     |
| AdminSidebar / AccountShell              | `aria-current="page"` cho item active                             | ❌ Không có primitive                                     |
| NearMeSearch radius                      | `role="group"`, `aria-pressed`, `aria-label`                      | ❌ Tabs Primitive không phù hợp (segmented control ≠ tab) |

### 4.3 Primitive có cải thiện được không?

- **Pagination Primitive → AdminPagination:** ✅ Cải thiện `<nav>`, `aria-label`, `aria-current` (nhưng UI change: thêm số trang)
- **Breadcrumb Primitive → Public Breadcrumb:** ✅ Cải thiện `aria-current`, separator `aria-hidden` (UI tương đương)
- **Tabs Primitive:** ❌ Không có use case thực tế

---

## 5. SEO AUDIT

### 5.1 BreadcrumbList / JSON-LD / Schema.org

| Vị trí                     | JSON-LD type                                 | File                                                                 | Dependency                                                                                                                                          |
| -------------------------- | -------------------------------------------- | -------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| SEO Landing `[slug]`       | `BreadcrumbList` + `ItemList`                | [`src/app/[slug]/page.tsx`](src/app/[slug]/page.tsx:137)             | [`breadcrumbJsonLd`](src/lib/seo/index.tsx:117) + [`itemListJsonLd`](src/lib/seo/index.tsx:130)                                                     |
| Room Detail `phong/[slug]` | `BreadcrumbList` + `Residence`               | [`src/app/phong/[slug]/page.tsx`](src/app/phong/[slug]/page.tsx:117) | [`breadcrumbJsonLd`](src/lib/seo/index.tsx:117) + [`residenceJsonLd`](src/lib/seo/index.tsx:143)                                                    |
| Homepage                   | `Organization` + `WebSite` + `LocalBusiness` | (qua layout)                                                         | [`organizationJsonLd`](src/lib/seo/index.tsx:72) + [`websiteJsonLd`](src/lib/seo/index.tsx:87) + [`localBusinessJsonLd`](src/lib/seo/index.tsx:101) |

### 5.2 Rủi ro SEO khi migration Breadcrumb

⚠️ **CRITICAL — KHÔNG migration vội:**

1. **JSON-LD `BreadcrumbList` là dependency riêng** ở [`src/lib/seo/index.tsx`](src/lib/seo/index.tsx:117), KHÔNG nằm trong Breadcrumb Primitive.
2. Migration Breadcrumb UI **KHÔNG được** xóa/di chuyển JSON-LD.
3. Phải tách bạch: **UI Breadcrumb** (visible, cho user) ≠ **SEO BreadcrumbList** (JSON-LD, cho crawler).
4. Hai hệ thống dùng cùng source data `breadcrumbs: { name, url }` nhưng render khác nhau.
5. **Khuyến nghị:** Giữ JSON-LD nguyên vẹn. Chỉ thay phần `<nav>` visible bằng Primitive, map `name→label`, `url→href`.

### 5.3 Sitemap / Robots

- [`src/app/sitemap.ts`](src/app/sitemap.ts) — sitemap động, revalidate 5m
- [`src/app/robots.ts`](src/app/robots.ts) — robots
- KHÔNG liên quan Navigation Primitive, không ảnh hưởng migration.

---

## 6. RESPONSIVE AUDIT

### 6.1 Mobile Navigation

| Vị trí                        | Mobile pattern                    | Layout shift risk                               |
| ----------------------------- | --------------------------------- | ----------------------------------------------- |
| SiteHeader                    | `<details>` dropdown (lg:hidden)  | ⚠️ Medium — dropdown absolute, không trap focus |
| AdminSidebar → AdminMobileNav | horizontal scroll nav (lg:hidden) | ✅ Low — inline flow                            |
| AccountShell                  | horizontal scroll nav (lg:hidden) | ✅ Low — inline flow                            |
| Room Detail                   | fixed bottom CTA bar (lg:hidden)  | ✅ Low — fixed, không shift content             |
| Pagination Primitive          | flex wrap                         | ✅ Low                                          |
| Breadcrumb Primitive          | flex-wrap                         | ✅ Low                                          |
| Tabs Primitive                | flex (border-b)                   | ✅ Low                                          |

### 6.2 Tablet Navigation

- KHÔNG có breakpoint tablet riêng. Toàn bộ dùng `sm:` (640px) và `lg:` (1024px).
- Tablet (768px) rơi vào vùng giữa — sidebar đã ẩn (lg:hidden), mobile nav đã hiện.
- ✅ Không layout shift risk cho Primitive.

### 6.3 Desktop Navigation

| Vị trí               | Desktop pattern       |
| -------------------- | --------------------- |
| SiteHeader           | pill nav (lg:flex)    |
| AdminSidebar         | aside w-72 (lg:block) |
| AccountShell         | aside w-72 (lg:block) |
| Pagination Primitive | flex row              |
| Breadcrumb Primitive | flex-wrap row         |
| Tabs Primitive       | flex row (border-b)   |

### 6.4 Primitive tương đương responsive?

- **Pagination:** ✅ Tương đương (flex, wrap). Risk: thêm số trang có thể tràn trên mobile rất hẹp — cần test.
- **Breadcrumb:** ✅ Tương đương (flex-wrap).
- **Tabs:** ✅ Tương đương (flex), nhưng không có use case.

---

## 7. VALIDATION

```bash
npm run lint       # ✅ Exit 0
npm run typecheck  # ✅ Exit 0
npm run build      # ✅ Exit 0 — 67 static pages, Turbopack, 5.7s compile
```

Tất cả PASS. Codebase ổn định sau audit (zero change).

---

## 8. KHUYẾN NGHỊ — PHASE 4D.2 NÊN MIGRATION GÌ TRƯỚC?

### 8.1 Dữ liệu thực tế

```text
Pagination:  11 consumer tiềm năng (Risk: 11, Safe: 0, Blocked: 0)
Breadcrumb:   3 consumer tiềm năng (Risk: 2,  Safe: 0, Blocked: 1)
Tabs:         0 consumer tiềm năng (Risk: 0,  Safe: 0, Blocked: 0)
```

### 8.2 Phân tích

**Pagination — 11 consumer, tất cả Risk:**

- ✅ Coverage cao nhất (11 trang admin dùng cùng `AdminPagination`)
- ✅ Accessibility cải thiện rõ rệt (`<nav>`, `aria-current`)
- ⚠️ UI change (thêm số trang) — cần quyết định product
- ✅ Có thể viết adapter wrapper để 11 trang không phải refactor API
- **ROI cao nhất:** 1 adapter + 11 trang swap = coverage lớn

**Breadcrumb — 3 consumer, 2 Risk + 1 Blocked:**

- ✅ Accessibility cải thiện (`aria-current`, separator `aria-hidden`)
- ⚠️ SEO risk cao — phải giữ JSON-LD riêng, map `name/url → label/href`
- ❌ AdminBreadcrumb Blocked (Primitive không tương đương string[] join)
- **ROI trung bình:** 2 trang public, phải cẩn thận SEO

**Tabs — 0 consumer:**

- ❌ KHÔNG có tab thật trong codebase
- ❌ Migration ép buộc = tạo UI không tự nhiên
- **ROI thấp nhất:** primitive sẵn sàng nhưng không có demand

### 8.3 Kết luận

```text
Phase 4D.2 nên migration PAGINATION trước.

Lý do (dựa trên dữ liệu audit thực tế):
1. Coverage cao nhất: 11 consumer (vs Breadcrumb 3, Tabs 0)
2. Tất cả cùng dùng 1 component AdminPagination → 1 adapter + 11 swap
3. Accessibility cải thiện rõ rệt (<nav>, aria-label, aria-current)
4. Không có SEO risk (admin noindex)
5. Responsive safe (flex wrap)

Breadcrumb nên làm thứ 2 (Phase 4D.3), sau khi có quy trình tách bạch
UI Breadcrumb ≠ SEO BreadcrumbList.

Tabs KHÔNG nên migration trong 4D.x — không có use case thực tế.
Đợi đến khi có trang cần tab (vd: Room Detail thêm tab Tiện ích/Đánh giá/Bình luận).
```

---

## 9. RỦI RO ĐÃ PHÁT HIỆN (CHO PHASE 4D.2)

| #   | Rủi ro                                       | Vị trí                      | Mức    | Khuyến nghị                                                                                     |
| --- | -------------------------------------------- | --------------------------- | ------ | ----------------------------------------------------------------------------------------------- |
| R1  | UI change khi thêm số trang                  | AdminPagination → Primitive | Medium | Quyết định product: có thêm số trang admin không? Nếu không, viết adapter giữ UI prev/next      |
| R2  | SEO JSON-LD dependency                       | Breadcrumb public           | High   | KHÔNG gộp JSON-LD vào Primitive. Giữ [`breadcrumbJsonLd`](src/lib/seo/index.tsx:117) nguyên vẹn |
| R3  | API mismatch `name/url` vs `label/href`      | Breadcrumb public           | Low    | Helper map type                                                                                 |
| R4  | AdminBreadcrumb Blocked                      | `admin-breadcrumb.tsx`      | High   | Bỏ qua — Primitive không tương đương. Giữ implementation cũ hoặc redesign riêng                 |
| R5  | Tabs không có demand                         | Toàn codebase               | —      | Đợi use case thực tế                                                                            |
| R6  | SiteHeader mobile menu `<details>`           | `site-header.tsx`           | Medium | Ngoài scope 4D (không có primitive). Đề xuất phase riêng cho primary nav                        |
| R7  | Thiếu `aria-current="page"` ở sidebar active | AdminSidebar, AccountShell  | Low    | Ngoài scope 4D (không có primitive). Patch trực tiếp                                            |

---

## 10. PHẠM VI KHÔNG ĐỤNG (ZERO CHANGE)

Phase 4D.1 chỉ audit, KHÔNG sửa:

- ❌ UI / UX / Layout
- ❌ Business Logic / API / Database
- ❌ Authentication / Authorization / Middleware
- ❌ SEO / Analytics / RBAC
- ❌ Không thêm dependency / package / debug code / console log

**File duy nhất được tạo trong phase này:** `docs/PHASE_4D_1_GLOBAL_NAVIGATION_FOUNDATION_AUDIT.md` (báo cáo).

---

## 11. KẾT LUẬN

Phase 4D.1 hoàn thành audit Navigation Foundation với số liệu thực tế:

- **3 Navigation Primitive** đã sẵn sàng (Production Ready) nhưng **0 consumer** — tình trạng giống Section/Card trước khi migration.
- **Pagination** có coverage cao nhất (11), là ứng viên tối ưu cho Phase 4D.2.
- **Breadcrumb** có 2 consumer public + 1 blocked, cần cẩn thận SEO.
- **Tabs** không có use case — hoãn.
- **Other Navigation** (SiteHeader, SiteFooter, Sidebar, AccountShell) ngoài scope Navigation Primitive hiện có.

Quyết định Phase 4D.2 dựa trên **số liệu audit thực tế**, không giả định: **Pagination trước**.

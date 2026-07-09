# PHASE 3 — GLOBAL DESIGN SYSTEM FOUNDATION (ZERO UI CHANGE)

> Báo cáo cuối Phase. Foundation Phase — chỉ xây dựng hạ tầng dùng chung,
> tuyệt đối không thay đổi giao diện, chức năng hoặc hành vi hệ thống.

---

## Tổng quan

- **Mục tiêu:** Xây dựng nền tảng Design System thống nhất cho toàn bộ website,
  chuẩn bị cho các Phase nâng cấp UI/UX, SEO, Accessibility, Responsive và đa ngôn ngữ.
- **Ngôn ngữ chính:** Tiếng Việt (vi-VN).
- **Đa ngôn ngữ:** Kiến trúc sẵn sàng mở rộng sang English (chỉ chuẩn hóa, chưa triển khai).
- **Nguyên tắc:** Chỉ thêm hạ tầng. Không thay thế component cũ. Không áp dụng vào trang nào.

---

## File mới

### Design Tokens (`src/lib/design/`) — 13 file

| File             | Mô tả                                                                  |
| ---------------- | ---------------------------------------------------------------------- |
| `tokens.ts`      | Tổng hợp tất cả token vào `designTokens`                               |
| `colors.ts`      | Brand / Semantic / Neutral / Surface                                   |
| `typography.ts`  | Display → Button (12 bậc) + fontFamily/weight/lineHeight/letterSpacing |
| `spacing.ts`     | 4 → 96 (13 bước) + spacingPx                                           |
| `radius.ts`      | xs → full (7 bậc)                                                      |
| `shadow.ts`      | xs → xl (5 bậc)                                                        |
| `motion.ts`      | duration / delay / easing                                              |
| `breakpoints.ts` | xs → 2xl + containerMaxWidth                                           |
| `z-index.ts`     | base → tooltip (8 bậc)                                                 |
| `layout.ts`      | container / grid / gap / header / control                              |
| `icons.ts`       | iconNames + iconSize (lucide-react)                                    |
| `themes.ts`      | themeConfig + themeSurfaces (light, sẵn sàng dark)                     |
| `index.ts`       | Barrel export                                                          |

### UI Primitives (`src/components/ui/`) — 24 component + 1 barrel

| Nhóm       | Component                                                |
| ---------- | -------------------------------------------------------- |
| Form       | Button, Input, Textarea, Select, Checkbox, Radio, Switch |
| Display    | Badge, Tag, Avatar, Card                                 |
| Layout     | Container, Section, Divider                              |
| Feedback   | Alert, EmptyState, Skeleton, Spinner                     |
| Overlay    | Tooltip, Modal, Drawer                                   |
| Navigation | Breadcrumb, Pagination, Tabs, Accordion                  |
| Barrel     | `index.ts`                                               |

---

## File sửa

| File                  | Thay đổi                                                                                                                                 |
| --------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| `src/app/globals.css` | Chỉ THÊM CSS Variables (`--ds-*`) + `@theme inline` mapping + 2 `@utility` (ds-focus-ring, ds-sr-only). KHÔNG thay đổi nội dung hiện có. |

---

## Design Tokens đã tạo

- **Colors:** Brand (Primary `#2563EB`, Secondary `#1D4ED8`, Accent `#EA580C`),
  Semantic (Success `#16A34A`, Warning `#F59E0B`, Error `#DC2626`, Info `#2563EB`),
  Neutral (50→950), Surface (background/foreground/surface/card/border/muted/overlay).
- **Typography:** 12 bậc (Display, H1–H6, Body Large/Body/Body Small, Caption, Label, Button).
- **Spacing:** 13 bước (0, 4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80, 96).
- **Radius:** 7 bậc (xs, sm, md, lg, xl, 2xl, full).
- **Shadow:** 5 bậc (xs, sm, md, lg, xl).
- **Motion:** duration (fast/normal/slow), delay, easing (standard/spring).
- **Breakpoints:** xs, sm, md, lg, xl, 2xl + containerMaxWidth.
- **Z-Index:** base, dropdown, sticky, fixed, popover, modal, toast, tooltip.
- **Layout:** container, grid, gap, header, control.
- **Icons:** iconNames + iconSize (lucide-react).
- **Themes:** themeConfig + themeSurfaces (light, sẵn sàng dark).

---

## UI Primitives đã tạo

24 component nền, tất cả:

- Typed đầy đủ (TypeScript).
- Accessibility: focus-visible ring, ARIA, semantic HTML, keyboard navigation.
- Không thêm dependency (dùng cva, clsx, tailwind-merge, lucide-react đã có).
- SSR-safe (Modal/Drawer dùng `useSyncExternalStore`).
- KHÔNG thay thế component cũ, KHÔNG áp dụng vào trang nào.

---

## CSS Variables đã thêm

Namespace `--ds-*` (design system) — tránh xung đột với biến hiện có:

- Brand: `--ds-brand-primary`, `--ds-brand-secondary`, `--ds-brand-accent` (+ foreground).
- Semantic: `--ds-success`, `--ds-warning`, `--ds-error`, `--ds-info` (+ foreground).
- Surface: `--ds-surface`, `--ds-card`, `--ds-overlay`, `--ds-content-strong`, `--ds-content-secondary`.
- Radius: `--ds-radius-xs` → `--ds-radius-full`.
- Shadow: `--ds-shadow-xs` → `--ds-shadow-xl`.
- Z-Index: `--ds-z-dropdown` → `--ds-z-tooltip`.
- Motion: `--ds-duration-*`, `--ds-easing-*`.

Mapping sang Tailwind v4 `@theme inline` (JIT on-demand, không tăng output nếu không dùng).
Utility class: `ds-focus-ring`, `ds-sr-only`.

---

## Barrel Exports đã tạo

- `src/lib/design/index.ts` — entry point cho Design Tokens.
- `src/components/ui/index.ts` — entry point cho UI Primitives (không re-export component cũ).

Import chuẩn:

- `@/lib/design`
- `@/components/ui`
- `@/lib/utils`

---

## Có thay đổi UI?

=> **KHÔNG**

## Có thay đổi Business Logic?

=> **KHÔNG**

## Có thay đổi API?

=> **KHÔNG**

## Có thay đổi Database?

=> **KHÔNG**

## Có thay đổi Authentication?

=> **KHÔNG**

## Có thay đổi Middleware?

=> **KHÔNG**

## Có thay đổi SEO?

=> **KHÔNG**

## Có thay đổi Responsive?

=> **KHÔNG**

## Có thay đổi Analytics?

=> **KHÔNG**

---

## Kết quả Validation

- `npm run lint` ✅
- `npm run typecheck` ✅
- `npm run build` ✅ (67 static pages, 0 lỗi)

---

## Ghi chú

- Đây là **Foundation Phase**. Design Token và UI Primitives CHƯA được áp dụng
  vào bất kỳ trang nào (Homepage, Public, Search, Room Detail, Account, Landlord, Admin...).
- Các Phase sau sẽ dùng hạ tầng này để nâng cấp UI, SEO, Responsive và đa ngôn ngữ
  từng bước, an toàn, không gây regression.
- Kiến trúc sẵn sàng mở rộng: dark theme, English, compact mode.

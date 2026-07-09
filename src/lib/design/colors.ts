/**
 * Design Tokens — Colors
 *
 * Nguồn sự thật duy nhất (single source of truth) cho màu sắc toàn bộ website.
 * Giá trị được trích xuất từ UI hiện tại để đảm bảo KHÔNG thay đổi giao diện.
 *
 * Cấu trúc:
 * - Brand:    Primary / Secondary / Accent
 * - Semantic: Success / Warning / Error / Info
 * - Neutral:  50 → 900
 * - Surface:  Background / Foreground / Surface / Card / Border / Muted / Overlay
 *
 * Chỉ chứa constants. Không chứa logic.
 * Không thay đổi màu đang dùng.
 */

export const brandColors = {
  /** Màu thương hiệu chính — xanh dương (#2563EB) đang dùng cho CTA chính. */
  primary: {
    50: "#EFF6FF",
    100: "#DBEAFE",
    200: "#BFDBFE",
    300: "#93C5FD",
    400: "#60A5FA",
    500: "#3B82F6",
    600: "#2563EB",
    700: "#1D4ED8",
    800: "#1E40AF",
    900: "#1E3A8A",
    DEFAULT: "#2563EB",
    foreground: "#FFFFFF",
  },
  /** Màu thương hiệu phụ — xanh dương đậm cho hover/focus. */
  secondary: {
    50: "#F0F9FF",
    100: "#E0F2FE",
    200: "#BAE6FD",
    300: "#7DD3FC",
    400: "#38BDF8",
    500: "#0EA5E9",
    600: "#0284C7",
    700: "#0369A1",
    800: "#075985",
    900: "#0C4A6E",
    DEFAULT: "#1D4ED8",
    foreground: "#FFFFFF",
  },
  /** Màu nhấn — cam (#EA580C) đang dùng cho CTA phụ. */
  accent: {
    50: "#FFF7ED",
    100: "#FFEDD5",
    200: "#FED7AA",
    300: "#FDBA74",
    400: "#FB923C",
    500: "#F97316",
    600: "#EA580C",
    700: "#C2410C",
    800: "#9A3412",
    900: "#7C2D12",
    DEFAULT: "#EA580C",
    foreground: "#FFFFFF",
  },
} as const;

export const semanticColors = {
  /** Trạng thái thành công — xanh lá (#16A34A / #059669). */
  success: {
    50: "#F0FDF4",
    100: "#DCFCE7",
    200: "#BBF7D0",
    300: "#86EFAC",
    400: "#4ADE80",
    500: "#22C55E",
    600: "#16A34A",
    700: "#15803D",
    800: "#166534",
    900: "#14532D",
    DEFAULT: "#16A34A",
    foreground: "#FFFFFF",
  },
  /** Trạng thái cảnh báo — vàng/cam. */
  warning: {
    50: "#FFFBEB",
    100: "#FEF3C7",
    200: "#FDE68A",
    300: "#FCD34D",
    400: "#FBBF24",
    500: "#F59E0B",
    600: "#D97706",
    700: "#B45309",
    800: "#92400E",
    900: "#78350F",
    DEFAULT: "#F59E0B",
    foreground: "#1F2937",
  },
  /** Trạng thái lỗi — đỏ. */
  error: {
    50: "#FEF2F2",
    100: "#FEE2E2",
    200: "#FECACA",
    300: "#FCA5A5",
    400: "#F87171",
    500: "#EF4444",
    600: "#DC2626",
    700: "#B91C1C",
    800: "#991B1B",
    900: "#7F1D1D",
    DEFAULT: "#DC2626",
    foreground: "#FFFFFF",
  },
  /** Trạng thái thông tin — xanh dương. */
  info: {
    50: "#EFF6FF",
    100: "#DBEAFE",
    200: "#BFDBFE",
    300: "#93C5FD",
    400: "#60A5FA",
    500: "#3B82F6",
    600: "#2563EB",
    700: "#1D4ED8",
    800: "#1E40AF",
    900: "#1E3A8A",
    DEFAULT: "#2563EB",
    foreground: "#FFFFFF",
  },
} as const;

export const neutralColors = {
  50: "#F8FAFC",
  100: "#F1F5F9",
  200: "#E2E8F0",
  300: "#CBD5E1",
  400: "#94A3B8",
  500: "#64748B",
  600: "#475569",
  700: "#334155",
  800: "#1E293B",
  900: "#0F172A",
  950: "#020617",
} as const;

export const surfaceColors = {
  /** Nền trang — trắng. */
  background: "#FFFFFF",
  /** Chữ chính — gần đen (#0A0A0A / #111827). */
  foreground: "#0A0A0A",
  /** Nền bề mặt phụ. */
  surface: "#FFFFFF",
  /** Nền thẻ. */
  card: "#FFFFFF",
  /** Viền — xám nhạt (#E5E5E5). */
  border: "#E5E5E5",
  /** Nền im lặng — xám rất nhạt (#F5F5F5). */
  muted: "#F5F5F5",
  /** Chữ im lặng — xám trung bình (#737373). */
  "muted-foreground": "#737373",
  /** Lớp phủ modal/drawer. */
  overlay: "rgba(15, 23, 42, 0.5)",
  /** Chữ nội dung phụ (#4B5563). */
  "content-secondary": "#4B5563",
  /** Chữ tiêu đề (#111827). */
  "content-strong": "#111827",
} as const;

export type BrandColorScale = typeof brandColors.primary;
export type SemanticColorScale = typeof semanticColors.success;
export type NeutralColorScale = typeof neutralColors;
export type SurfaceColors = typeof surfaceColors;

export const colors = {
  brand: brandColors,
  semantic: semanticColors,
  neutral: neutralColors,
  surface: surfaceColors,
} as const;

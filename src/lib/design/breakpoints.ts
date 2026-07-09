/**
 * Design Tokens — Breakpoints
 *
 * Hệ thống breakpoint chuẩn. Giá trị được đồng bộ với Tailwind v4 mặc định
 * để đảm bảo KHÔNG thay đổi responsive hiện tại.
 *
 * Thang: xs, sm, md, lg, xl, 2xl
 *
 * Chỉ chứa constants. Không chứa logic.
 * Không thay đổi breakpoint đang dùng.
 */

export const breakpoints = {
  /** 475px — điện thoại lớn. */
  xs: "475px",
  /** 640px — điện thoại lớn / tablet dọc. */
  sm: "640px",
  /** 768px — tablet. */
  md: "768px",
  /** 1024px — laptop. */
  lg: "1024px",
  /** 1280px — desktop. */
  xl: "1280px",
  /** 1536px — màn hình lớn / 2K. */
  "2xl": "1536px",
} as const;

/** Container max-width chuẩn theo breakpoint. */
export const containerMaxWidth = {
  sm: "640px",
  md: "768px",
  lg: "1024px",
  xl: "1280px",
  "2xl": "1536px",
  /** 80rem — max-width 7xl đang dùng ở hero. */
  "7xl": "80rem",
} as const;

export type BreakpointToken = keyof typeof breakpoints;
export type ContainerMaxWidthToken = keyof typeof containerMaxWidth;

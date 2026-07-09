/**
 * Design Tokens — Typography
 *
 * Hệ thống typography chuẩn. KHÔNG thay đổi font đang sử dụng (Geist Sans/Mono)
 * và KHÔNG thay đổi kích thước hiện tại — chỉ chuẩn hóa thành token có tên.
 *
 * Bậc: Display, H1–H6, Body Large, Body, Body Small, Caption, Label, Button
 *
 * Chỉ chứa constants. Không chứa logic.
 */

export const fontFamily = {
  /** Font sans-serif mặc định — Geist Sans (giữ nguyên). */
  sans: "var(--font-geist-sans)",
  /** Font monospace — Geist Mono (giữ nguyên). */
  mono: "var(--font-geist-mono)",
  /** Font fallback hệ thống. */
  system: "Arial, Helvetica, sans-serif",
} as const;

export const fontWeight = {
  normal: 400,
  medium: 500,
  semibold: 600,
  bold: 700,
  extrabold: 800,
} as const;

export const lineHeight = {
  tight: 1.08,
  snug: 1.18,
  normal: 1.5,
  relaxed: 1.625,
  loose: 2,
} as const;

export const letterSpacing = {
  tight: "-0.02em",
  normal: "0",
  wide: "0.025em",
  wider: "0.05em",
} as const;

/**
 * Bậc typography. Giá trị fontSize/lineHeight được trích xuất từ UI hiện tại
 * (hero-section) để đảm bảo KHÔNG thay đổi giao diện.
 */
export const typography = {
  display: {
    fontSize: "64px",
    lineHeight: "1.08",
    fontWeight: 800,
    letterSpacing: "-0.02em",
  },
  h1: {
    fontSize: "54px",
    lineHeight: "1.08",
    fontWeight: 800,
    letterSpacing: "-0.02em",
  },
  h2: {
    fontSize: "42px",
    lineHeight: "1.18",
    fontWeight: 700,
    letterSpacing: "-0.02em",
  },
  h3: {
    fontSize: "32px",
    lineHeight: "1.2",
    fontWeight: 700,
    letterSpacing: "-0.01em",
  },
  h4: {
    fontSize: "24px",
    lineHeight: "1.3",
    fontWeight: 700,
    letterSpacing: "0",
  },
  h5: {
    fontSize: "20px",
    lineHeight: "1.4",
    fontWeight: 600,
    letterSpacing: "0",
  },
  h6: {
    fontSize: "18px",
    lineHeight: "1.4",
    fontWeight: 600,
    letterSpacing: "0",
  },
  "body-large": {
    fontSize: "18px",
    lineHeight: "1.75",
    fontWeight: 400,
    letterSpacing: "0",
  },
  body: {
    fontSize: "16px",
    lineHeight: "1.75",
    fontWeight: 400,
    letterSpacing: "0",
  },
  "body-small": {
    fontSize: "14px",
    lineHeight: "1.5",
    fontWeight: 400,
    letterSpacing: "0",
  },
  caption: {
    fontSize: "12px",
    lineHeight: "1.4",
    fontWeight: 400,
    letterSpacing: "0.025em",
  },
  label: {
    fontSize: "14px",
    lineHeight: "1.4",
    fontWeight: 600,
    letterSpacing: "0",
  },
  button: {
    fontSize: "14px",
    lineHeight: "1.4",
    fontWeight: 700,
    letterSpacing: "0",
  },
} as const;

export type TypographyToken = keyof typeof typography;
export type TypographyStyle = (typeof typography)[TypographyToken];

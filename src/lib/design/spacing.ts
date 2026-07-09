/**
 * Design Tokens — Spacing
 *
 * Hệ thống khoảng cách chuẩn (4px base unit) dùng chung cho toàn bộ website.
 * Giá trị tính bằng pixel, có thể chuyển sang rem qua hàm tiện ích (nếu cần).
 *
 * Chuẩn hóa: 4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80, 96
 *
 * Chỉ chứa constants. Không chứa logic.
 * Không thay đổi spacing đang dùng.
 */

export const spacing = {
  /** 4px — khoảng cách nhỏ nhất. */
  0: 0,
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  8: 32,
  10: 40,
  12: 48,
  16: 64,
  20: 80,
  24: 96,
} as const;

/** Bước spacing cơ bản (px). */
export const spacingUnit = 4;

/** Chuyển spacing token sang chuỗi CSS (px). */
export const spacingPx = {
  0: "0px",
  1: "4px",
  2: "8px",
  3: "12px",
  4: "16px",
  5: "20px",
  6: "24px",
  8: "32px",
  10: "40px",
  12: "48px",
  16: "64px",
  20: "80px",
  24: "96px",
} as const;

export type SpacingToken = keyof typeof spacing;
export type SpacingPx = typeof spacingPx;

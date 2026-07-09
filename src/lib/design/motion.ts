/**
 * Design Tokens — Motion
 *
 * Hệ thống chuyển động chuẩn: duration, delay, easing.
 * Giá trị được giữ tinh tế để đảm bảo KHÔNG thay đổi animation hiện tại.
 *
 * Thang duration: fast, normal, slow
 *
 * Chỉ chứa constants. Không chứa logic.
 * Không thay đổi animation đang dùng.
 */

export const duration = {
  /** 150ms — chuyển động nhanh (hover, focus). */
  fast: "150ms",
  /** 200ms — chuyển động tiêu chuẩn. */
  normal: "200ms",
  /** 300ms — chuyển động chậm (modal, drawer). */
  slow: "300ms",
} as const;

export const delay = {
  none: "0ms",
  short: "50ms",
  normal: "100ms",
  long: "200ms",
} as const;

export const easing = {
  /** Đường cong tiêu chuẩn (ease-out). */
  standard: "cubic-bezier(0.4, 0, 0.2, 1)",
  /** Đường cong vào nhanh ra chậm. */
  "ease-in": "cubic-bezier(0.4, 0, 1, 1)",
  /** Đường cong vào chậm ra nhanh. */
  "ease-out": "cubic-bezier(0, 0, 0.2, 1)",
  /** Đường cong vào ra đều. */
  "ease-in-out": "cubic-bezier(0.4, 0, 0.2, 1)",
  /** Đường cong nảy nhẹ. */
  spring: "cubic-bezier(0.34, 1.56, 0.64, 1)",
} as const;

export const motion = {
  duration,
  delay,
  easing,
} as const;

export type DurationToken = keyof typeof duration;
export type DelayToken = keyof typeof delay;
export type EasingToken = keyof typeof easing;

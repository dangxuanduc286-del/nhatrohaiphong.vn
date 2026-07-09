/**
 * Design Tokens — Z-Index
 *
 * Hệ thống z-index chuẩn để tránh xung đột lớp phủ.
 *
 * Thang: dropdown, sticky, fixed, modal, popover, toast, tooltip
 *
 * Chỉ chứa constants. Không chứa logic.
 */

export const zIndex = {
  /** 0 — lớp nền mặc định. */
  base: 0,
  /** 10 — dropdown menu. */
  dropdown: 10,
  /** 20 — phần tử sticky. */
  sticky: 20,
  /** 30 — phần tử fixed (header). */
  fixed: 30,
  /** 40 — popover. */
  popover: 40,
  /** 50 — modal/drawer. */
  modal: 50,
  /** 60 — toast notification. */
  toast: 60,
  /** 70 — tooltip (luôn trên cùng). */
  tooltip: 70,
} as const;

export type ZIndexToken = keyof typeof zIndex;

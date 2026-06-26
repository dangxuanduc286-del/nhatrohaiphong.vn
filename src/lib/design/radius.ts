/**
 * Design Tokens — Radius
 *
 * Hệ thống bo góc chuẩn. Giá trị mặc định (--radius: 0.75rem) được giữ nguyên
 * để đảm bảo KHÔNG thay đổi giao diện.
 *
 * Thang: xs, sm, md, lg, xl, 2xl, full
 *
 * Chỉ chứa constants. Không chứa logic.
 * Không thay đổi radius đang dùng.
 */

export const radius = {
  /** 2px — bo góc cực nhỏ. */
  xs: "2px",
  /** calc(0.75rem - 4px) — bo góc nhỏ (giữ nguyên công thức hiện tại). */
  sm: "calc(0.75rem - 4px)",
  /** calc(0.75rem - 2px) — bo góc trung bình. */
  md: "calc(0.75rem - 2px)",
  /** 0.75rem — bo góc lớn (giá trị --radius mặc định). */
  lg: "0.75rem",
  /** 1rem — bo góc rất lớn. */
  xl: "1rem",
  /** 1.5rem — bo góc cực lớn (dùng cho card/hero). */
  "2xl": "1.5rem",
  /** 9999px — bo tròn hoàn toàn. */
  full: "9999px",
} as const;

/** Giá trị --radius mặc định hiện tại (0.75rem). */
export const radiusBase = "0.75rem";

export type RadiusToken = keyof typeof radius;

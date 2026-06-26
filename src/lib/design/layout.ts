/**
 * Design Tokens — Layout
 *
 * Hệ thống layout chuẩn: container, grid, gap, max-width.
 * Giá trị được trích xuất từ UI hiện tại (max-w-7xl) để đảm bảo KHÔNG thay đổi.
 *
 * Chỉ chứa constants. Không chứa logic.
 * Không thay đổi layout đang dùng.
 */

export const layout = {
  /** Chiều rộng container tối đa (80rem = 1280px, đang dùng max-w-7xl). */
  containerMaxWidth: "80rem",
  /** Padding container theo breakpoint. */
  containerPadding: {
    base: "1rem",
    sm: "1.5rem",
    lg: "2rem",
  },
  /** Số cột grid chuẩn. */
  gridColumns: {
    base: 1,
    sm: 2,
    md: 3,
    lg: 4,
  },
  /** Gap grid chuẩn. */
  gridGap: {
    sm: "0.5rem",
    base: "0.75rem",
    md: "1rem",
    lg: "1.5rem",
    xl: "2rem",
  },
  /** Chiều cao header/footer. */
  headerHeight: "4rem",
  footerHeight: "auto",
  /** Chiều cao tối thiểu nút (min-h-12 đang dùng). */
  controlMinHeight: "3rem",
} as const;

export type LayoutToken = typeof layout;
export type ContainerPaddingToken = keyof typeof layout.containerPadding;
export type GridGapToken = keyof typeof layout.gridGap;

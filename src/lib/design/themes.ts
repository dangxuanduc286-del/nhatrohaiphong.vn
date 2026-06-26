/**
 * Design Tokens — Themes
 *
 * Định nghĩa theme tokens. Phase này chỉ chuẩn bị kiến trúc — KHÔNG triển khai
 * chuyển đổi theme. Mặc định light theme (giá trị hiện tại).
 *
 * Kiến trúc sẵn sàng mở rộng: dark theme, high-contrast, compact.
 *
 * Chỉ chứa constants. Không chứa logic.
 * Không thay đổi giao diện.
 */

export type ThemeMode = "light" | "dark";

export const themeConfig = {
  /** Theme mặc định — light (giá trị hiện tại). */
  defaultMode: "light" as ThemeMode,
  /** Các theme được hỗ trợ (Phase này chỉ light). */
  modes: ["light"] as ThemeMode[],
  /** Có bật dark mode không (Phase này: false). */
  darkModeEnabled: false,
} as const;

/**
 * Ánh xạ surface token → CSS variable cho từng theme.
 * Phase này chỉ light. Dark sẽ thêm ở Phase sau.
 */
export const themeSurfaces = {
  light: {
    background: "var(--background)",
    foreground: "var(--foreground)",
    surface: "var(--background)",
    card: "var(--background)",
    border: "var(--border)",
    muted: "var(--muted)",
    "muted-foreground": "var(--muted-foreground)",
    overlay: "var(--overlay)",
  },
} as const;

/** Surface tokens cho một theme cụ thể (Phase này chỉ light). */
export type ThemeSurfaces = (typeof themeSurfaces)["light"];

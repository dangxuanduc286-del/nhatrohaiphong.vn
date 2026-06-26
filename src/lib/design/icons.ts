/**
 * Design Tokens — Icons
 *
 * Thư viện icon chuẩn. Project dùng lucide-react (đã khai báo trong components.json).
 * File này chỉ tập hợp tên icon dùng chung để DRY — KHÔNG thêm dependency.
 *
 * Chỉ chứa constants. Không chứa logic.
 */

/**
 * Tên icon lucide-react dùng chung (string literal type).
 * Import thực tế vẫn từ "lucide-react" để tree-shaking.
 */
export const iconNames = {
  // Hành động
  search: "Search",
  filter: "Filter",
  edit: "Pencil",
  delete: "Trash2",
  save: "Save",
  close: "X",
  check: "Check",
  plus: "Plus",
  minus: "Minus",
  arrowRight: "ArrowRight",
  arrowLeft: "ArrowLeft",
  arrowUp: "ArrowUp",
  arrowDown: "ArrowDown",
  chevronRight: "ChevronRight",
  chevronLeft: "ChevronLeft",
  chevronDown: "ChevronDown",
  chevronUp: "ChevronUp",
  // Trạng thái
  info: "Info",
  warning: "TriangleAlert",
  error: "CircleAlert",
  success: "CircleCheck",
  // Điều hướng
  home: "Home",
  menu: "Menu",
  user: "User",
  settings: "Settings",
  logout: "LogOut",
  // Nội dung
  mapPin: "MapPin",
  phone: "Phone",
  mail: "Mail",
  calendar: "Calendar",
  eye: "Eye",
  eyeOff: "EyeOff",
  // Tải
  loader: "LoaderCircle",
  spinner: "Loader",
} as const;

/** Kích thước icon chuẩn (px). */
export const iconSize = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 20,
  xl: 24,
  "2xl": 32,
} as const;

export type IconName = keyof typeof iconNames;
export type IconSizeToken = keyof typeof iconSize;

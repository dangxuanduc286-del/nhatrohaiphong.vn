/**
 * UI Primitives — Barrel Export
 *
 * Entry point cho UI Primitives nền tảng.
 * Import chuẩn: `import { Button, Card, Input } from "@/components/ui"`.
 *
 * Lưu ý: File này KHÔNG re-export các component cũ (admin-action-button,
 * admin-data-table) để tránh xung đột tên và giữ ranh giới rõ ràng giữa
 * primitive mới và component hiện có.
 *
 * Chỉ re-export. Không chứa logic.
 */

// Form primitives
export * from "./button";
export * from "./input";
export * from "./textarea";
export * from "./select";
export * from "./checkbox";
export * from "./radio";
export * from "./switch";

// Display primitives
export * from "./badge";
export * from "./tag";
export * from "./avatar";
export * from "./card";

// Layout primitives
export * from "./container";
export * from "./section";
export * from "./divider";

// Feedback primitives
export * from "./alert";
export * from "./empty-state";
export * from "./skeleton";
export * from "./spinner";

// Overlay primitives
export * from "./tooltip";
export * from "./modal";
export * from "./drawer";

// Navigation primitives
export * from "./breadcrumb";
export * from "./pagination";
export * from "./tabs";
export * from "./accordion";

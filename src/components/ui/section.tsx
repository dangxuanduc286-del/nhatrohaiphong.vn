import * as React from "react";

import { cn } from "@/lib/utils";

/**
 * UI Primitive — Section
 *
 * Nền tảng section dùng chung. Bọc một vùng nội dung với padding dọc chuẩn.
 * KHÔNG thay thế component cũ.
 *
 * Accessibility: semantic <section>, aria-label tùy chọn.
 */

export interface SectionProps extends React.HTMLAttributes<HTMLElement> {
  /** Khoảng padding dọc. */
  spacing?: "sm" | "md" | "lg";
  /** Có nền muted không. */
  muted?: boolean;
}

export function Section({ className, spacing = "md", muted, ...props }: SectionProps) {
  const spacingClass = {
    sm: "py-6 sm:py-8",
    md: "py-8 sm:py-14 lg:py-16",
    lg: "py-12 sm:py-20 lg:py-24",
  }[spacing];

  return <section className={cn(spacingClass, muted && "bg-[#F5F5F5]", className)} {...props} />;
}

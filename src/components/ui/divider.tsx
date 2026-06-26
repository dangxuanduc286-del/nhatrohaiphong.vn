import * as React from "react";

import { cn } from "@/lib/utils";

/**
 * UI Primitive — Divider
 *
 * Nền tảng đường phân cách dùng chung. Hỗ trợ hướng ngang/dọc.
 * KHÔNG thay thế component cũ.
 *
 * Accessibility: role="separator" cho đường phân cách ngữ nghĩa.
 */

export interface DividerProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Hướng divider. */
  orientation?: "horizontal" | "vertical";
  /** Có chữ không (semantic separator). */
  decorative?: boolean;
}

export function Divider({
  className,
  orientation = "horizontal",
  decorative = true,
  ...props
}: DividerProps) {
  return (
    <div
      role={decorative ? "none" : "separator"}
      aria-orientation={decorative ? undefined : orientation}
      className={cn(
        "bg-[#E5E5E5]",
        orientation === "horizontal" ? "h-px w-full" : "h-full w-px",
        className,
      )}
      {...props}
    />
  );
}

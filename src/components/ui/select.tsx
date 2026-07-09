"use client";

import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

import { cn } from "@/lib/utils";

/**
 * UI Primitive — Select
 *
 * Nền tảng ô chọn dùng chung (native select). Dùng cva để định nghĩa selectSize
 * (cho các Phase nâng cấp UI sau). Variant dùng tên `selectSize` để tránh xung
 * đột với prop `size` (number) của native select.
 *
 * Phase 4A (ZERO UI CHANGE): khi không truyền `selectSize`, Select render nguyên
 * vẹn `className` truyền vào — tương đương `<select>` raw. Khi truyền
 * `selectSize`, cva áp dụng đầy đủ base + size (Phase nâng cấp UI sau).
 */

export const selectVariants = cva(
  "flex w-full rounded-lg border bg-white text-sm text-[#111827] shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
  {
    variants: {
      selectSize: {
        default: "h-10 px-3 py-2",
        sm: "h-9 px-2 text-xs",
        lg: "h-12 px-4 text-base",
      },
    },
    defaultVariants: {
      selectSize: "default",
    },
  },
);

export interface SelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement>, VariantProps<typeof selectVariants> {}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, selectSize, ...props }, ref) => {
    // Bypass: không truyền selectSize → render raw className (ZERO UI CHANGE).
    // Có selectSize → áp dụng cva đầy đủ (Phase nâng cấp UI sau).
    const resolvedClassName = selectSize
      ? cn(selectVariants({ selectSize, className }), "border-[#E5E5E5]")
      : className;
    return <select ref={ref} className={resolvedClassName} {...props} />;
  },
);
Select.displayName = "Select";

export type SelectSize = VariantProps<typeof selectVariants>["selectSize"];

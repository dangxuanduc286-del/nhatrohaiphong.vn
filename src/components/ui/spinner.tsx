import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

import { cn } from "@/lib/utils";

/**
 * UI Primitive — Spinner
 *
 * Nền tảng biểu tượng tải dùng chung. Dùng CSS animation (không thêm dependency).
 * KHÔNG thay thế component cũ.
 *
 * Accessibility: role="status", aria-label, sr-only text tùy chọn.
 */

export const spinnerVariants = cva(
  "inline-block animate-spin rounded-full border-solid border-current border-t-transparent",
  {
    variants: {
      size: {
        sm: "h-4 w-4 border-2",
        md: "h-6 w-6 border-2",
        lg: "h-8 w-8 border-[3px]",
      },
      variant: {
        default: "text-[#2563EB]",
        muted: "text-[#737373]",
        white: "text-white",
      },
    },
    defaultVariants: {
      size: "md",
      variant: "default",
    },
  },
);

export interface SpinnerProps
  extends React.HTMLAttributes<HTMLSpanElement>, VariantProps<typeof spinnerVariants> {
  /** Nhãn cho screen reader. */
  label?: string;
}

export function Spinner({
  className,
  size,
  variant,
  label = "Đang tải...",
  ...props
}: SpinnerProps) {
  return (
    <span role="status" className={cn("inline-flex items-center", className)} {...props}>
      <span className={cn(spinnerVariants({ size, variant }))} aria-hidden="true" />
      <span className="sr-only">{label}</span>
    </span>
  );
}

export type SpinnerSize = VariantProps<typeof spinnerVariants>["size"];
export type SpinnerVariant = VariantProps<typeof spinnerVariants>["variant"];

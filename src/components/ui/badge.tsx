import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

import { cn } from "@/lib/utils";

/**
 * UI Primitive — Badge
 *
 * Nền tảng nhãn trạng thái dùng chung. Dùng cva định nghĩa variants.
 * KHÔNG thay thế component cũ (AdminStatusBadge).
 *
 * Accessibility: semantic <span>, aria-label tùy chọn.
 */

export const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2 py-1 text-xs font-semibold transition-colors",
  {
    variants: {
      variant: {
        default: "bg-slate-100 text-slate-700",
        primary: "bg-blue-100 text-blue-800",
        success: "bg-emerald-100 text-emerald-800",
        warning: "bg-amber-100 text-amber-800",
        error: "bg-rose-100 text-rose-800",
        info: "bg-blue-100 text-blue-800",
        outline: "border border-[#E5E5E5] text-[#111827]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>, VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export type BadgeVariant = VariantProps<typeof badgeVariants>["variant"];

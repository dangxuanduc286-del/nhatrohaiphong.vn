import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

import { cn } from "@/lib/utils";

/**
 * UI Primitive — Tag
 *
 * Nền tảng thẻ nhãn dùng chung (khác Badge: Tag thường có thể xóa, bo góc vuông hơn).
 * KHÔNG thay thế component cũ.
 *
 * Accessibility: semantic <span>, aria-label tùy chọn.
 */

export const tagVariants = cva(
  "inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-medium transition-colors",
  {
    variants: {
      variant: {
        default: "bg-slate-100 text-slate-700",
        primary: "bg-blue-50 text-[#2563EB]",
        accent: "bg-orange-50 text-[#EA580C]",
        success: "bg-emerald-50 text-[#059669]",
        outline: "border border-[#E5E5E5] bg-white text-[#111827]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface TagProps
  extends React.HTMLAttributes<HTMLSpanElement>, VariantProps<typeof tagVariants> {}

export function Tag({ className, variant, ...props }: TagProps) {
  return <span className={cn(tagVariants({ variant }), className)} {...props} />;
}

export type TagVariant = VariantProps<typeof tagVariants>["variant"];

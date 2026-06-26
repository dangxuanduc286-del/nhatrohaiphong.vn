"use client";

import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

/**
 * UI Primitive — Button
 *
 * Nền tảng nút bấm dùng chung. Dùng class-variance-authority (cva) để định nghĩa
 * variants (cho các Phase nâng cấp UI sau).
 *
 * Phase 4A (ZERO UI CHANGE): khi không truyền `variant`/`size`, Button render
 * nguyên vẹn `className` truyền vào — tương đương `<button>` raw, không thêm
 * base style nào. Khi truyền `variant`/`size`, cva áp dụng đầy đủ base + variant
 * (dành cho Phase nâng cấp UI sau).
 *
 * Accessibility (chỉ bật khi dùng variant): focus-visible ring, disabled state,
 * semantic <button>. Không dùng @radix-ui/react-slot — asChild không hỗ trợ.
 */

export const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-[#2563EB] text-white shadow-sm hover:bg-[#1D4ED8]",
        secondary: "bg-white border border-[#EA580C] text-[#EA580C] shadow-sm hover:bg-orange-50",
        outline: "border border-[#E5E5E5] bg-white text-[#111827] shadow-sm hover:bg-slate-50",
        ghost: "text-[#111827] hover:bg-slate-100",
        link: "text-[#2563EB] underline-offset-4 hover:underline",
        destructive: "bg-[#DC2626] text-white shadow-sm hover:bg-red-700",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3 text-xs",
        lg: "h-12 rounded-2xl px-5 text-sm font-extrabold",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    // Bypass: không truyền variant/size → render raw className (ZERO UI CHANGE).
    // Có variant/size → áp dụng cva đầy đủ (Phase nâng cấp UI sau).
    const resolvedClassName =
      variant || size ? buttonVariants({ variant, size, className }) : className;
    return <button className={resolvedClassName} ref={ref} {...props} />;
  },
);
Button.displayName = "Button";

export type ButtonVariant = VariantProps<typeof buttonVariants>["variant"];
export type ButtonSize = VariantProps<typeof buttonVariants>["size"];

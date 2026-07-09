"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

/**
 * UI Primitive — Input
 *
 * Nền tảng ô nhập liệu dùng chung. Passthrough thuần: chỉ forward ref + props,
 * không thêm base style nào. `className` truyền vào render y hệt `<input>` raw
 * (ZERO UI CHANGE). Accessibility (focus-visible ring, aria-invalid) sẽ được
 * bổ sung ở Phase nâng cấp UI sau để không thay đổi focus behavior hiện tại.
 */

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = "text", ...props }, ref) => (
    <input type={type} ref={ref} className={cn(className)} {...props} />
  ),
);
Input.displayName = "Input";

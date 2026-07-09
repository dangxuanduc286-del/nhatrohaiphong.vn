"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

/**
 * UI Primitive — Textarea
 *
 * Nền tảng ô nhập liệu đa dòng dùng chung. Passthrough thuần: chỉ forward ref
 * + props, không thêm base style nào. `className` truyền vào render y hệt
 * `<textarea>` raw (ZERO UI CHANGE). Accessibility (focus-visible ring,
 * aria-invalid) sẽ được bổ sung ở Phase nâng cấp UI sau.
 */

export type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>;

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => <textarea ref={ref} className={cn(className)} {...props} />,
);
Textarea.displayName = "Textarea";

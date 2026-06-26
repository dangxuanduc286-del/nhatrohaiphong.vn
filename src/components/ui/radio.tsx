"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

/**
 * UI Primitive — Radio
 *
 * Nền tảng nút radio dùng chung (native input radio). KHÔNG thay thế component cũ.
 * Không dùng @radix-ui/react-radio-group (không thêm dependency).
 *
 * Accessibility: focus-visible ring, aria-invalid support, label association.
 */

export type RadioProps = React.InputHTMLAttributes<HTMLInputElement> & {
  /** id dùng để kết nối với <label htmlFor>. */
  labelId?: string;
};

export const Radio = React.forwardRef<HTMLInputElement, RadioProps>(
  ({ className, type = "radio", labelId, ...props }, ref) => {
    return (
      <input
        type={type}
        ref={ref}
        id={labelId}
        aria-invalid={props["aria-invalid"] ?? undefined}
        className={cn(
          "h-4 w-4 shrink-0 border border-[#E5E5E5] bg-white text-[#2563EB] shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 accent-[#2563EB]",
          className,
        )}
        {...props}
      />
    );
  },
);
Radio.displayName = "Radio";

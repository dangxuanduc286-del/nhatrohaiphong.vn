"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

/**
 * UI Primitive — Switch
 *
 * Nền tảng công tắc bật/tắt dùng chung. Dùng native button + aria-checked
 * (không thêm dependency). KHÔNG thay thế component cũ.
 *
 * Accessibility: role="switch", aria-checked, focus-visible ring, keyboard (Space/Enter).
 */

export interface SwitchProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean;
  /** Nhãn cho screen reader. */
  "aria-label"?: string;
  "aria-labelledby"?: string;
  id?: string;
  name?: string;
  value?: string;
  className?: string;
}

export const Switch = React.forwardRef<HTMLButtonElement, SwitchProps>(
  ({ checked, onCheckedChange, disabled, className, id, name, value, ...ariaProps }, ref) => {
    const handleKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
      if (event.key === " " || event.key === "Enter") {
        event.preventDefault();
        onCheckedChange(!checked);
      }
    };

    return (
      <button
        ref={ref}
        type="button"
        role="switch"
        id={id}
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onCheckedChange(!checked)}
        onKeyDown={handleKeyDown}
        className={cn(
          "peer inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          checked ? "bg-[#2563EB]" : "bg-[#E5E5E5]",
          className,
        )}
        {...ariaProps}
      >
        <input type="hidden" name={name} value={value} />
        <span
          className={cn(
            "pointer-events-none block h-5 w-5 rounded-full bg-white shadow-sm ring-0 transition-transform",
            checked ? "translate-x-5" : "translate-x-0",
          )}
        />
      </button>
    );
  },
);
Switch.displayName = "Switch";

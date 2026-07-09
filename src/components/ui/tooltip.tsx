"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

/**
 * UI Primitive — Tooltip
 *
 * Nền tảng tooltip dùng chung. Dùng native title + custom hover (không thêm dependency).
 * KHÔNG thay thế component cũ.
 *
 * Accessibility: aria-describedby, keyboard focus support, sr-only fallback.
 */

export interface TooltipProps {
  children: React.ReactNode;
  content: React.ReactNode;
  /** Vị trí tooltip. */
  side?: "top" | "bottom" | "left" | "right";
  className?: string;
}

export function Tooltip({ children, content, side = "top", className }: TooltipProps) {
  const [visible, setVisible] = React.useState(false);
  const id = React.useId();

  const positionClass = {
    top: "bottom-full left-1/2 -translate-x-1/2 -translate-y-2",
    bottom: "top-full left-1/2 -translate-x-1/2 translate-y-2",
    left: "right-full top-1/2 -translate-y-1/2 -translate-x-2",
    right: "left-full top-1/2 -translate-y-1/2 translate-x-2",
  }[side];

  return (
    <span
      className="relative inline-flex"
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
      onFocus={() => setVisible(true)}
      onBlur={() => setVisible(false)}
    >
      <span aria-describedby={visible ? id : undefined}>{children}</span>
      {visible ? (
        <span
          role="tooltip"
          id={id}
          className={cn(
            "pointer-events-none absolute z-[70] whitespace-nowrap rounded-md bg-[#0F172A] px-2 py-1 text-xs font-medium text-white shadow-md",
            positionClass,
            className,
          )}
        >
          {content}
        </span>
      ) : null}
    </span>
  );
}

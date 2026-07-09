"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

/**
 * UI Primitive — Accordion
 *
 * Nền tảng accordion dùng chung. Dùng native button + region (không thêm dependency).
 * KHÔNG thay thế component cũ.
 *
 * Accessibility: aria-expanded, aria-controls, role="region", keyboard (Enter/Space).
 */

export interface AccordionItem {
  value: string;
  title: string;
  content: React.ReactNode;
}

export interface AccordionProps {
  items: AccordionItem[];
  /** Cho phép mở nhiều cùng lúc không. */
  multiple?: boolean;
  className?: string;
}

export function Accordion({ items, multiple = false, className }: AccordionProps) {
  const [openValues, setOpenValues] = React.useState<Set<string>>(new Set());

  const toggle = (value: string) => {
    setOpenValues((prev) => {
      const next = new Set(prev);
      if (next.has(value)) {
        next.delete(value);
      } else {
        if (!multiple) next.clear();
        next.add(value);
      }
      return next;
    });
  };

  return (
    <div className={cn("divide-y divide-[#E5E5E5] border-y border-[#E5E5E5]", className)}>
      {items.map((item) => {
        const isOpen = openValues.has(item.value);
        const contentId = `accordion-content-${item.value}`;
        const buttonId = `accordion-button-${item.value}`;
        return (
          <div key={item.value}>
            <h3>
              <button
                type="button"
                id={buttonId}
                aria-expanded={isOpen}
                aria-controls={contentId}
                onClick={() => toggle(item.value)}
                className="flex w-full items-center justify-between py-4 text-left text-sm font-semibold text-[#111827] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB] focus-visible:ring-offset-2"
              >
                <span>{item.title}</span>
                <span
                  aria-hidden="true"
                  className={cn("text-[#737373] transition-transform", isOpen && "rotate-180")}
                >
                  ⌄
                </span>
              </button>
            </h3>
            {isOpen ? (
              <div
                role="region"
                id={contentId}
                aria-labelledby={buttonId}
                className="pb-4 text-sm text-[#4B5563]"
              >
                {item.content}
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}

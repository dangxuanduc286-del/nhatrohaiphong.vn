"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

/**
 * UI Primitive — Tabs
 *
 * Nền tảng tab dùng chung. Dùng native button + state (không thêm dependency).
 * KHÔNG thay thế component cũ.
 *
 * Accessibility: role="tablist"/"tab"/"tabpanel", aria-selected, aria-controls,
 * keyboard arrow navigation.
 */

export interface TabItem {
  value: string;
  label: string;
  content: React.ReactNode;
}

export interface TabsProps {
  items: TabItem[];
  /** Giá trị tab mặc định. */
  defaultValue?: string;
  className?: string;
}

export function Tabs({ items, defaultValue, className }: TabsProps) {
  const [active, setActive] = React.useState(defaultValue ?? items[0]?.value);
  const tabListRef = React.useRef<HTMLDivElement>(null);

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    const tabs = Array.from(tabListRef.current?.querySelectorAll('[role="tab"]') ?? []);
    const currentIndex = tabs.findIndex((tab) => tab.getAttribute("aria-selected") === "true");
    let nextIndex = currentIndex;

    if (event.key === "ArrowRight") nextIndex = (currentIndex + 1) % tabs.length;
    else if (event.key === "ArrowLeft") nextIndex = (currentIndex - 1 + tabs.length) % tabs.length;
    else return;

    event.preventDefault();
    (tabs[nextIndex] as HTMLElement)?.focus();
    const nextValue = items[nextIndex]?.value;
    if (nextValue) setActive(nextValue);
  };

  return (
    <div className={cn("w-full", className)}>
      <div
        ref={tabListRef}
        role="tablist"
        onKeyDown={handleKeyDown}
        className="flex gap-1 border-b border-[#E5E5E5]"
      >
        {items.map((item) => {
          const isActive = item.value === active;
          return (
            <button
              key={item.value}
              type="button"
              role="tab"
              id={`tab-${item.value}`}
              aria-selected={isActive}
              aria-controls={`tabpanel-${item.value}`}
              tabIndex={isActive ? 0 : -1}
              onClick={() => setActive(item.value)}
              className={cn(
                "rounded-t-lg px-4 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB] focus-visible:ring-offset-2",
                isActive
                  ? "border-b-2 border-[#2563EB] text-[#2563EB]"
                  : "text-[#737373] hover:text-[#111827]",
              )}
            >
              {item.label}
            </button>
          );
        })}
      </div>
      {items.map((item) =>
        item.value === active ? (
          <div
            key={item.value}
            role="tabpanel"
            id={`tabpanel-${item.value}`}
            aria-labelledby={`tab-${item.value}`}
            className="pt-4"
          >
            {item.content}
          </div>
        ) : null,
      )}
    </div>
  );
}

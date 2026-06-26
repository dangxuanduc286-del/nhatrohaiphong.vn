import * as React from "react";

import { cn } from "@/lib/utils";

/**
 * UI Primitive — Breadcrumb
 *
 * Nền tảng breadcrumb dùng chung. KHÔNG thay thế component cũ.
 *
 * Accessibility: nav + aria-label="breadcrumb", aria-current="page" cho mục hiện tại.
 */

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export interface BreadcrumbProps extends React.HTMLAttributes<HTMLElement> {
  items: BreadcrumbItem[];
  /** Ký tự phân cách. */
  separator?: React.ReactNode;
}

export function Breadcrumb({ items, separator = "/", className, ...props }: BreadcrumbProps) {
  return (
    <nav aria-label="breadcrumb" className={cn("text-sm", className)} {...props}>
      <ol className="flex flex-wrap items-center gap-1.5 text-[#737373]">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <li key={`${item.label}-${index}`} className="inline-flex items-center gap-1.5">
              {item.href && !isLast ? (
                <a href={item.href} className="hover:text-[#2563EB] hover:underline">
                  {item.label}
                </a>
              ) : (
                <span
                  aria-current={isLast ? "page" : undefined}
                  className={isLast ? "font-medium text-[#111827]" : undefined}
                >
                  {item.label}
                </span>
              )}
              {!isLast ? (
                <span aria-hidden="true" className="text-[#CBD5E1]">
                  {separator}
                </span>
              ) : null}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

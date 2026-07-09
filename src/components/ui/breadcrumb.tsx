import * as React from "react";

import { cn } from "@/lib/utils";

/**
 * UI Primitive — Breadcrumb
 *
 * Nền tảng breadcrumb dùng chung.
 *
 * Accessibility: nav + aria-label="breadcrumb", aria-current="page" cho mục hiện tại,
 * separator aria-hidden="true".
 *
 * Props:
 * - items: danh sách breadcrumb item { label, href? }. Mục có href render link,
 *   mục không href render span. Mục cuối có href vẫn render link (giữ behavior
 *   clickable) và nhận aria-current="page".
 * - separator: ký tự phân cách (default "/").
 * - linkComponent: component render link (vd: next/link Link) để giữ client-side
 *   navigation + prefetch. Default "a" (anchor thuần).
 */

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export interface BreadcrumbProps extends React.HTMLAttributes<HTMLElement> {
  items: BreadcrumbItem[];
  /** Ký tự phân cách. */
  separator?: React.ReactNode;
  /** Component render link (vd: next/link Link). Default: "a". */
  linkComponent?: React.ElementType;
}

export function Breadcrumb({
  items,
  separator = "/",
  className,
  linkComponent,
  ...props
}: BreadcrumbProps) {
  const Link = linkComponent ?? "a";
  return (
    <nav aria-label="breadcrumb" className={cn("text-sm", className)} {...props}>
      <ol className="flex flex-wrap gap-2">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <li key={`${item.label}-${index}`} className="flex items-center gap-2">
              {item.href ? (
                <Link
                  href={item.href}
                  className="hover:text-[#2563EB]"
                  aria-current={isLast ? "page" : undefined}
                >
                  {item.label}
                </Link>
              ) : (
                <span aria-current={isLast ? "page" : undefined}>{item.label}</span>
              )}
              {!isLast ? <span aria-hidden="true">{separator}</span> : null}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

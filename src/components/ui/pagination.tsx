import * as React from "react";

import { cn } from "@/lib/utils";

/**
 * UI Primitive — Pagination
 *
 * Nền tảng phân trang dùng chung. KHÔNG thay thế component cũ.
 *
 * Accessibility: nav + aria-label, aria-current="page" cho trang hiện tại.
 */

export interface PaginationProps extends React.HTMLAttributes<HTMLElement> {
  /** Trang hiện tại (1-based). */
  currentPage: number;
  /** Tổng số trang. */
  totalPages: number;
  /** Hàm tạo href cho trang. */
  getPageHref: (page: number) => string;
  /** Số trang hiển thị hai bên trang hiện tại. */
  siblingCount?: number;
}

export function Pagination({
  currentPage,
  totalPages,
  getPageHref,
  siblingCount = 1,
  className,
  ...props
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const range: (number | "...")[] = [];
  const start = Math.max(2, currentPage - siblingCount);
  const end = Math.min(totalPages - 1, currentPage + siblingCount);

  range.push(1);
  if (start > 2) range.push("...");
  for (let i = start; i <= end; i++) range.push(i);
  if (end < totalPages - 1) range.push("...");
  if (totalPages > 1) range.push(totalPages);

  return (
    <nav
      aria-label="Phân trang"
      className={cn("flex items-center gap-1 text-sm", className)}
      {...props}
    >
      {currentPage > 1 ? (
        <a
          href={getPageHref(currentPage - 1)}
          aria-label="Trang trước"
          className="inline-flex h-9 min-w-9 items-center justify-center rounded-lg border border-[#E5E5E5] px-3 text-[#111827] hover:bg-slate-50"
        >
          ‹
        </a>
      ) : null}
      {range.map((item, index) =>
        item === "..." ? (
          <span
            key={`ellipsis-${index}`}
            className="inline-flex h-9 min-w-9 items-center justify-center px-2 text-[#737373]"
          >
            …
          </span>
        ) : (
          <a
            key={item}
            href={getPageHref(item)}
            aria-current={item === currentPage ? "page" : undefined}
            className={cn(
              "inline-flex h-9 min-w-9 items-center justify-center rounded-lg border px-3",
              item === currentPage
                ? "border-[#2563EB] bg-[#2563EB] text-white"
                : "border-[#E5E5E5] text-[#111827] hover:bg-slate-50",
            )}
          >
            {item}
          </a>
        ),
      )}
      {currentPage < totalPages ? (
        <a
          href={getPageHref(currentPage + 1)}
          aria-label="Trang sau"
          className="inline-flex h-9 min-w-9 items-center justify-center rounded-lg border border-[#E5E5E5] px-3 text-[#111827] hover:bg-slate-50"
        >
          ›
        </a>
      ) : null}
    </nav>
  );
}

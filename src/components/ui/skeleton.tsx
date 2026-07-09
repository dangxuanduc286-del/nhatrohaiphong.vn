import * as React from "react";

import { cn } from "@/lib/utils";

/**
 * UI Primitive — Skeleton
 *
 * Nền tảng placeholder loading dùng chung. Hiệu ứng pulse giữ tinh tế.
 * KHÔNG thay thế component cũ (skeleton-card).
 *
 * Accessibility: aria-hidden (trang trí), không đọc bởi screen reader.
 */

export type SkeletonProps = React.HTMLAttributes<HTMLDivElement>;

export function Skeleton({ className, ...props }: SkeletonProps) {
  return (
    <div
      aria-hidden="true"
      className={cn("animate-pulse rounded-lg bg-slate-200", className)}
      {...props}
    />
  );
}

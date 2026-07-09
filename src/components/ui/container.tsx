import * as React from "react";

import { cn } from "@/lib/utils";

/**
 * UI Primitive — Container
 *
 * Nền tảng container dùng chung. Căn giữa nội dung với max-width chuẩn (80rem = max-w-7xl)
 * và padding responsive — đồng bộ với UI hiện tại. KHÔNG thay thế component cũ.
 *
 * Accessibility: semantic <div>.
 */

export interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Có bỏ padding ngang không. */
  flush?: boolean;
}

export function Container({ className, flush, ...props }: ContainerProps) {
  return (
    <div
      className={cn("mx-auto w-full max-w-7xl", !flush && "px-4 sm:px-6 lg:px-8", className)}
      {...props}
    />
  );
}

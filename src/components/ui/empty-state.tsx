import * as React from "react";

import { cn } from "@/lib/utils";

/**
 * UI Primitive — EmptyState
 *
 * Nền tảng trạng thái rỗng dùng chung. Hiển thị khi không có dữ liệu.
 * KHÔNG thay thế component cũ.
 *
 * Accessibility: semantic <div>, aria-label tùy chọn, heading level do consumer.
 */

export interface EmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Tiêu đề trạng thái rỗng. */
  title: string;
  /** Mô tả phụ. */
  description?: string;
  /** Hành động (nút/link) hiển thị bên dưới. */
  action?: React.ReactNode;
  /** Icon minh họa. */
  icon?: React.ReactNode;
}

export function EmptyState({
  title,
  description,
  action,
  icon,
  className,
  ...props
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-3 px-4 py-10 text-center",
        className,
      )}
      {...props}
    >
      {icon ? (
        <div className="text-[#737373]" aria-hidden="true">
          {icon}
        </div>
      ) : null}
      <div className="space-y-1">
        <p className="text-sm font-semibold text-[#111827]">{title}</p>
        {description ? <p className="text-sm text-[#737373]">{description}</p> : null}
      </div>
      {action ? <div className="mt-2">{action}</div> : null}
    </div>
  );
}

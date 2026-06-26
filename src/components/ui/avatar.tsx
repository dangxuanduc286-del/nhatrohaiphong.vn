import * as React from "react";

import { cn } from "@/lib/utils";

/**
 * UI Primitive — Avatar
 *
 * Nền tảng ảnh đại diện dùng chung. Hỗ trợ fallback chữ cái đầu.
 * KHÔNG thay thế component cũ.
 *
 * Accessibility: alt text, role img, fallback aria-hidden.
 */

export interface AvatarProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  /** Tên dùng để tạo fallback chữ cái đầu khi không có ảnh/lỗi ảnh. */
  name?: string;
  /** Kích thước (px). */
  size?: number;
  /** Lớp bọc ngoài. */
  containerClassName?: string;
}

export function Avatar({
  src,
  alt,
  name,
  size = 40,
  className,
  containerClassName,
  onError,
  ...props
}: AvatarProps) {
  const [hasError, setHasError] = React.useState(false);
  const initials = React.useMemo(() => {
    if (!name) return "";
    return name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part.charAt(0).toUpperCase())
      .join("");
  }, [name]);

  const handleError = (event: React.SyntheticEvent<HTMLImageElement>) => {
    setHasError(true);
    onError?.(event);
  };

  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-slate-100 text-slate-600",
        containerClassName,
      )}
      style={{ width: size, height: size }}
    >
      {src && !hasError ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={alt ?? name ?? "avatar"}
          onError={handleError}
          className={cn("h-full w-full object-cover", className)}
          {...props}
        />
      ) : (
        <span
          aria-hidden={name ? undefined : true}
          aria-label={name ? `Avatar của ${name}` : undefined}
          className="text-sm font-semibold"
          style={{ fontSize: Math.max(12, size * 0.4) }}
        >
          {initials || "?"}
        </span>
      )}
    </span>
  );
}

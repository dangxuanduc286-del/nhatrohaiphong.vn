import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

import { cn } from "@/lib/utils";

/**
 * UI Primitive — Alert
 *
 * Nền tảng thông báo dùng chung. Dùng cva định nghĩa variants.
 * KHÔNG thay thế component cũ.
 *
 * Accessibility: role="alert" cho error/warning, semantic <div>.
 */

export const alertVariants = cva(
  "relative w-full rounded-lg border p-4 text-sm transition-colors",
  {
    variants: {
      variant: {
        default: "border-[#E5E5E5] bg-white text-[#111827]",
        info: "border-blue-200 bg-blue-50 text-blue-900",
        success: "border-emerald-200 bg-emerald-50 text-emerald-900",
        warning: "border-amber-200 bg-amber-50 text-amber-900",
        error: "border-rose-200 bg-rose-50 text-rose-900",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface AlertProps
  extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof alertVariants> {
  /** Có phải alert nghiêm trọng (role=alert) không. */
  assertive?: boolean;
}

export function Alert({ className, variant, assertive, ...props }: AlertProps) {
  return (
    <div
      role={assertive ? "alert" : "status"}
      className={cn(alertVariants({ variant }), className)}
      {...props}
    />
  );
}

export function AlertTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h5 className={cn("mb-1 font-semibold leading-none tracking-tight", className)} {...props} />
  );
}

export function AlertDescription({
  className,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn("text-sm leading-relaxed opacity-90", className)} {...props} />;
}

export type AlertVariant = VariantProps<typeof alertVariants>["variant"];

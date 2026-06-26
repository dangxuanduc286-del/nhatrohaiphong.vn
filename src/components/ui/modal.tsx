"use client";

import * as React from "react";
import { createPortal } from "react-dom";

import { cn } from "@/lib/utils";

/**
 * UI Primitive — Modal
 *
 * Nền tảng hộp thoại dùng chung. Dùng React portal + native dialog pattern
 * (không thêm dependency). KHÔNG thay thế component cũ.
 *
 * Accessibility: role="dialog", aria-modal, aria-labelledby, Esc để đóng,
 * click overlay để đóng.
 *
 * SSR-safe: dùng useSyncExternalStore để phát hiện client mount thay vì
 * setState trong effect (tránh cascading render).
 */

const emptySubscribe = () => () => {};

function useIsClientMounted() {
  return React.useSyncExternalStore(
    emptySubscribe,
    () => true, // client snapshot
    () => false, // server snapshot
  );
}

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  /** Tiêu đề (id cho aria-labelledby). */
  title?: string;
  /** Có đóng khi click overlay không. */
  closeOnOverlay?: boolean;
  className?: string;
}

export function Modal({
  open,
  onClose,
  children,
  title,
  closeOnOverlay = true,
  className,
}: ModalProps) {
  const isMounted = useIsClientMounted();
  const titleId = React.useId();

  React.useEffect(() => {
    if (!open) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  if (!isMounted || !open) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[50] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? titleId : undefined}
    >
      <div
        className="absolute inset-0 bg-[#0F172A]/50"
        onClick={closeOnOverlay ? onClose : undefined}
        aria-hidden="true"
      />
      <div
        className={cn(
          "relative z-10 w-full max-w-lg rounded-2xl bg-white p-6 shadow-lg",
          className,
        )}
      >
        {title ? (
          <h2 id={titleId} className="mb-4 text-lg font-semibold text-[#111827]">
            {title}
          </h2>
        ) : null}
        {children}
      </div>
    </div>,
    document.body,
  );
}

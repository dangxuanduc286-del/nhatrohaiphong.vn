"use client";

import * as React from "react";
import { createPortal } from "react-dom";

import { cn } from "@/lib/utils";

/**
 * UI Primitive — Drawer
 *
 * Nền tảng ngăn kéo dùng chung. Dùng React portal (không thêm dependency).
 * KHÔNG thay thế component cũ.
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

export interface DrawerProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
  /** Bên drawer trượt ra. */
  side?: "left" | "right";
  className?: string;
}

export function Drawer({ open, onClose, children, title, side = "right", className }: DrawerProps) {
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
      className="fixed inset-0 z-[50] flex"
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? titleId : undefined}
    >
      <div className="absolute inset-0 bg-[#0F172A]/50" onClick={onClose} aria-hidden="true" />
      <div
        className={cn(
          "relative z-10 h-full w-full max-w-sm bg-white p-6 shadow-lg",
          side === "right" ? "ml-auto" : "mr-auto",
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

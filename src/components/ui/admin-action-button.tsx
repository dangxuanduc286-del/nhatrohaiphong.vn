"use client";

import { useFormStatus } from "react-dom";

type AdminActionButtonProps = {
  label: string;
  message: string;
  className?: string;
};

export function AdminActionButton({ label, message, className }: AdminActionButtonProps) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className={className ?? "rounded-lg border px-2 py-1 text-xs font-semibold hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"}
      onClick={(event) => {
        if (!confirm(message)) event.preventDefault();
      }}
    >
      {pending ? "Đang xử lý..." : label}
    </button>
  );
}

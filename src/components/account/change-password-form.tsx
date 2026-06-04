"use client";

import { FormEvent, useState, useTransition } from "react";

export function ChangePasswordForm() {
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    setMessage(null);
    setError(null);
    startTransition(async () => {
      const response = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: formData.get("currentPassword"),
          password: formData.get("password"),
        }),
      });
      if (!response.ok) {
        setError("Không thể đổi mật khẩu. Vui lòng kiểm tra mật khẩu hiện tại.");
        return;
      }
      form.reset();
      setMessage("Đã đổi mật khẩu thành công.");
    });
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 rounded-3xl border bg-white p-5 shadow-sm sm:p-6"
    >
      <div>
        <h2 className="text-xl font-bold">Đổi mật khẩu</h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          Sử dụng API auth hiện có, không thay đổi cookie/JWT/session.
        </p>
      </div>
      <label className="block text-sm font-medium text-slate-700">
        Mật khẩu hiện tại
        <input
          name="currentPassword"
          type="password"
          autoComplete="current-password"
          required
          className="mt-1 min-h-12 w-full rounded-xl border px-3 py-3 text-base outline-none focus:border-blue-600 sm:text-sm"
        />
      </label>
      <label className="block text-sm font-medium text-slate-700">
        Mật khẩu mới
        <input
          name="password"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          className="mt-1 min-h-12 w-full rounded-xl border px-3 py-3 text-base outline-none focus:border-blue-600 sm:text-sm"
        />
      </label>
      {error ? (
        <p className="rounded-xl bg-red-50 px-3 py-2 text-sm font-medium text-red-700">{error}</p>
      ) : null}
      {message ? (
        <p className="rounded-xl bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-700">
          {message}
        </p>
      ) : null}
      <button
        disabled={isPending}
        className="min-h-12 rounded-xl bg-blue-700 px-5 py-3 text-sm font-bold text-white hover:bg-blue-800 disabled:opacity-60"
      >
        {isPending ? "Đang lưu..." : "Đổi mật khẩu"}
      </button>
    </form>
  );
}

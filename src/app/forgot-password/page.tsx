"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";

type ForgotPasswordResponse = {
  error?: {
    message?: string;
    issues?: Array<{ message?: string }>;
  };
};

function getErrorMessage(payload: ForgotPasswordResponse) {
  return payload.error?.message ?? payload.error?.issues?.[0]?.message ?? "Không thể gửi yêu cầu khôi phục. Vui lòng thử lại.";
}

export default function ForgotPasswordPage() {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccess(false);
    setIsSubmitting(true);

    const formData = new FormData(event.currentTarget);
    const response = await fetch("/api/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        identifier: formData.get("identifier"),
      }),
    });
    const payload = (await response.json()) as ForgotPasswordResponse;
    setIsSubmitting(false);

    if (!response.ok) {
      setError(getErrorMessage(payload));
      return;
    }

    setSuccess(true);
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12">
      <section className="w-full max-w-md rounded-3xl border bg-white p-6 shadow-sm">
        <div className="text-center">
          <Link href="/" className="text-2xl font-extrabold tracking-tight text-blue-600">Nhatrohaiphong.vn</Link>
          <h1 className="mt-6 text-3xl font-bold text-slate-900">Quên mật khẩu</h1>
          <p className="mt-2 text-sm leading-6 text-slate-600">Nhập email hoặc số điện thoại để nhận hướng dẫn khôi phục mật khẩu.</p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <label className="block text-sm font-medium text-slate-700">
            Email hoặc số điện thoại
            <input name="identifier" type="text" autoComplete="username" required placeholder="Nhập email hoặc số điện thoại" className="mt-1 w-full rounded-xl border px-3 py-3 text-sm outline-none focus:border-blue-600" />
          </label>

          {error ? <p className="rounded-xl bg-red-50 p-3 text-sm font-medium text-red-700">{error}</p> : null}
          {success ? <p className="rounded-xl bg-green-50 p-3 text-sm font-medium text-green-700">Nếu tài khoản tồn tại, hệ thống sẽ gửi hướng dẫn khôi phục mật khẩu.</p> : null}

          <button type="submit" disabled={isSubmitting} className="w-full rounded-xl bg-blue-700 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60">
            {isSubmitting ? "Đang gửi..." : "Gửi yêu cầu khôi phục"}
          </button>
        </form>

        <div className="mt-6 text-center text-sm">
          <Link href="/login" className="font-medium text-blue-700 hover:text-blue-800">Quay lại đăng nhập</Link>
        </div>
      </section>
    </main>
  );
}

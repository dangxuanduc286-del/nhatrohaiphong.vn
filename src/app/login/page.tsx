"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, Suspense, useState } from "react";

import { trackEvent } from "@/components/analytics/event-tracker";

type AuthResponse = {
  data?: {
    accessToken?: string;
  };
  error?: {
    message?: string;
  };
};

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const formData = new FormData(event.currentTarget);
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        identifier: formData.get("identifier"),
        password: formData.get("password"),
      }),
    });
    const payload = (await response.json()) as AuthResponse;

    setIsSubmitting(false);

    if (!response.ok) {
      trackEvent("client_error", { location: "login_form", category: "login_failed" });
      setError(payload.error?.message ?? "Không thể đăng nhập. Vui lòng thử lại.");
      return;
    }

    const next = searchParams.get("next") ?? "/landlord";
    const safeNext = next.startsWith("/") && !next.startsWith("//") ? next : "/landlord";
    trackEvent("landlord_login_success", { location: "login_form", next: safeNext });
    router.push(safeNext);
    router.refresh();
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12">
      <section className="w-full max-w-md rounded-3xl border bg-white p-6 shadow-sm">
        <div className="text-center">
          <Link href="/" className="text-2xl font-extrabold tracking-tight text-blue-600">Nhatrohaiphong.vn</Link>
          <h1 className="mt-6 text-3xl font-bold text-slate-900">Đăng nhập</h1>
          <p className="mt-2 text-sm text-slate-600">Đăng nhập để quản lý tin đăng và tài khoản.</p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <label className="block text-sm font-medium text-slate-700">
            Email hoặc số điện thoại
            <input name="identifier" type="text" autoComplete="username" required placeholder="Nhập email hoặc số điện thoại" className="mt-1 w-full rounded-xl border px-3 py-3 text-sm outline-none focus:border-blue-600" />
          </label>
          <label className="block text-sm font-medium text-slate-700">
            Mật khẩu
            <input name="password" type="password" autoComplete="current-password" required className="mt-1 w-full rounded-xl border px-3 py-3 text-sm outline-none focus:border-blue-600" />
          </label>

          {error ? <p className="rounded-xl bg-red-50 p-3 text-sm font-medium text-red-700">{error}</p> : null}

          <button type="submit" disabled={isSubmitting} className="w-full rounded-xl bg-blue-700 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60">
            {isSubmitting ? "Đang đăng nhập..." : "Đăng nhập"}
          </button>
        </form>

        <div className="mt-6 flex items-center justify-between text-sm">
          <Link href="/forgot-password" className="font-medium text-blue-700 hover:text-blue-800">Quên mật khẩu?</Link>
          <Link href="/register" className="font-medium text-blue-700 hover:text-blue-800">Đăng ký</Link>
        </div>
      </section>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12"><section className="w-full max-w-md rounded-3xl border bg-white p-6 shadow-sm"><div className="h-8 animate-pulse rounded bg-slate-200" /><div className="mt-6 h-10 animate-pulse rounded bg-slate-200" /><div className="mt-8 space-y-4"><div className="h-12 animate-pulse rounded-xl bg-slate-100" /><div className="h-12 animate-pulse rounded-xl bg-slate-100" /><div className="h-12 animate-pulse rounded-xl bg-slate-200" /></div></section></main>}>
      <LoginForm />
    </Suspense>
  );
}

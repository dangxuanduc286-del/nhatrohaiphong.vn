"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

import { Button, Input } from "@/components/ui";

type AuthResponse = {
  error?: {
    message?: string;
    issues?: Array<{ message?: string }>;
  };
};

function getErrorMessage(payload: AuthResponse) {
  return (
    payload.error?.message ??
    payload.error?.issues?.[0]?.message ??
    "Không thể đăng ký. Vui lòng thử lại."
  );
}

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") ?? "").trim();
    const phone = String(formData.get("phone") ?? "").trim();

    if (!email && !phone) {
      setError("Vui lòng nhập email hoặc số điện thoại");
      return;
    }

    setIsSubmitting(true);
    const response = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fullName: formData.get("fullName"),
        email,
        phone,
        password: formData.get("password"),
        role: "USER",
      }),
    });
    const payload = (await response.json()) as AuthResponse;
    setIsSubmitting(false);

    if (!response.ok) {
      setError(getErrorMessage(payload));
      return;
    }

    router.push("/");
    router.refresh();
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12">
      <section className="w-full max-w-md rounded-3xl border bg-white p-6 shadow-sm">
        <div className="text-center">
          <Link href="/" className="text-2xl font-extrabold tracking-tight text-blue-600">
            Nhatrohaiphong.vn
          </Link>
          <h1 className="mt-6 text-3xl font-bold text-slate-900">Đăng ký tài khoản</h1>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Tạo tài khoản USER để tìm phòng, lưu tin yêu thích và gửi yêu cầu nâng cấp Chủ trọ khi
            cần đăng phòng.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <label className="block text-sm font-medium text-slate-700">
            Họ tên
            <Input
              name="fullName"
              type="text"
              autoComplete="name"
              placeholder="Nguyễn Văn A"
              className="mt-1 w-full rounded-xl border px-3 py-3 text-sm outline-none focus:border-blue-600"
            />
          </label>
          <label className="block text-sm font-medium text-slate-700">
            Email
            <Input
              name="email"
              type="email"
              autoComplete="email"
              placeholder="ten@email.com"
              className="mt-1 w-full rounded-xl border px-3 py-3 text-sm outline-none focus:border-blue-600"
            />
          </label>
          <label className="block text-sm font-medium text-slate-700">
            Số điện thoại
            <Input
              name="phone"
              type="tel"
              autoComplete="tel"
              placeholder="0564162222"
              className="mt-1 w-full rounded-xl border px-3 py-3 text-sm outline-none focus:border-blue-600"
            />
          </label>
          <label className="block text-sm font-medium text-slate-700">
            Mật khẩu
            <Input
              name="password"
              type="password"
              autoComplete="new-password"
              required
              minLength={8}
              className="mt-1 w-full rounded-xl border px-3 py-3 text-sm outline-none focus:border-blue-600"
            />
          </label>

          {error ? (
            <p className="rounded-xl bg-red-50 p-3 text-sm font-medium text-red-700">{error}</p>
          ) : null}

          <div className="rounded-2xl bg-blue-50 p-4 text-sm text-blue-800">
            <p className="font-semibold">Sau khi đăng ký:</p>
            <ol className="mt-2 list-decimal space-y-1 pl-5">
              <li>Tìm phòng và xem chi tiết tin đăng.</li>
              <li>Lưu tin yêu thích hoặc lịch sử xem.</li>
              <li>Gửi yêu cầu nâng cấp Chủ trọ nếu bạn muốn đăng phòng.</li>
            </ol>
          </div>

          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-xl bg-blue-700 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? "Đang tạo tài khoản..." : "Tạo tài khoản"}
          </Button>
        </form>

        <div className="mt-6 text-center text-sm text-slate-600">
          Đã có tài khoản?{" "}
          <Link href="/login" className="font-medium text-blue-700 hover:text-blue-800">
            Đăng nhập
          </Link>
        </div>
      </section>
    </main>
  );
}

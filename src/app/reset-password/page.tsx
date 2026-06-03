"use client";

import Link from "next/link";

export default function ResetPasswordPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12">
      <section className="w-full max-w-md rounded-3xl border bg-white p-6 text-center shadow-sm">
        <Link href="/" className="text-2xl font-extrabold tracking-tight text-blue-600">Nhatrohaiphong.vn</Link>
        <h1 className="mt-6 text-3xl font-bold text-slate-900">Đặt lại mật khẩu</h1>
        <p className="mt-3 text-sm leading-6 text-slate-600">Trang đặt lại mật khẩu sẽ sử dụng API hiện có tại /api/auth/reset-password.</p>
        <Link href="/login" className="mt-6 inline-flex rounded-xl bg-blue-700 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-800">Quay lại đăng nhập</Link>
      </section>
    </main>
  );
}

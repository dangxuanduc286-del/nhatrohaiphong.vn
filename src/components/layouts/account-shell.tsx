"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { useState, useTransition } from "react";

type AccountShellItem = {
  label: string;
  href: string;
  icon: ReactNode;
  exact?: boolean;
};

type AccountShellProps = {
  title: string;
  eyebrow: string;
  userName: string;
  role: string;
  items: readonly AccountShellItem[];
  children: ReactNode;
};

function isActive(pathname: string, item: AccountShellItem) {
  if (item.exact) return pathname === item.href;
  return pathname === item.href || pathname.startsWith(`${item.href}/`);
}

function navClassName(active: boolean) {
  return [
    "flex min-h-11 items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition",
    active
      ? "bg-slate-900 text-white shadow-sm"
      : "text-slate-700 hover:bg-slate-100 hover:text-slate-950",
  ].join(" ");
}

function mobileNavClassName(active: boolean) {
  return [
    "inline-flex min-h-11 shrink-0 items-center gap-2 rounded-full border px-3 py-2 text-xs font-semibold transition",
    active
      ? "border-slate-900 bg-slate-900 text-white"
      : "border-slate-200 bg-white text-slate-700 hover:bg-slate-100 hover:text-slate-950",
  ].join(" ");
}

export function AccountShell({
  title,
  eyebrow,
  userName,
  role,
  items,
  children,
}: AccountShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleLogout() {
    setError(null);
    startTransition(async () => {
      try {
        await fetch("/api/auth/logout", { method: "POST" });
        router.push("/login");
        router.refresh();
      } catch {
        setError("Không thể đăng xuất. Vui lòng thử lại.");
      }
    });
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950">
      <div className="flex min-h-screen">
        <aside className="hidden w-72 shrink-0 border-r bg-white p-4 lg:block">
          <Link href="/" className="mb-6 block text-lg font-bold hover:text-blue-700">
            Nhatrohaiphong.vn
          </Link>
          <nav className="space-y-1" aria-label={`${title} navigation`}>
            {items.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={navClassName(isActive(pathname, item))}
              >
                <span className="text-base" aria-hidden="true">
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </Link>
            ))}
            <button
              type="button"
              onClick={handleLogout}
              disabled={isPending}
              className="flex min-h-11 w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm font-medium text-red-700 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <span className="text-base" aria-hidden="true">
                ⇥
              </span>
              <span>{isPending ? "Đang đăng xuất..." : "Đăng xuất"}</span>
            </button>
          </nav>
          {error ? (
            <p className="mt-3 rounded-xl bg-red-50 px-3 py-2 text-xs font-medium text-red-700">
              {error}
            </p>
          ) : null}
        </aside>

        <div className="min-w-0 flex-1">
          <header className="sticky top-0 z-10 border-b bg-white/90 px-4 py-3 backdrop-blur">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-xs uppercase tracking-wide text-slate-500">{eyebrow}</p>
                <h1 className="truncate text-lg font-semibold">{title}</h1>
              </div>
              <div className="flex min-w-0 items-center gap-2">
                <Link
                  href="/"
                  className="hidden min-h-9 items-center rounded-full border px-3 text-xs font-semibold text-slate-700 hover:bg-slate-100 sm:inline-flex"
                >
                  Trang chủ
                </Link>
                <div className="hidden max-w-40 truncate text-right text-xs text-slate-500 sm:block">
                  {userName}
                </div>
                <div className="rounded-full bg-slate-900 px-3 py-1 text-xs font-medium text-white">
                  {role}
                </div>
              </div>
            </div>
          </header>

          <nav
            className="flex gap-2 overflow-x-auto border-b bg-white px-4 py-2 lg:hidden"
            aria-label={`${title} mobile navigation`}
          >
            {items.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={mobileNavClassName(isActive(pathname, item))}
              >
                <span aria-hidden="true">{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            ))}
            <button
              type="button"
              onClick={handleLogout}
              disabled={isPending}
              className="inline-flex min-h-11 shrink-0 items-center gap-2 rounded-full border border-red-200 bg-white px-3 py-2 text-xs font-semibold text-red-700 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <span aria-hidden="true">⇥</span>
              <span>{isPending ? "Đang thoát" : "Đăng xuất"}</span>
            </button>
          </nav>

          <main className="p-4 sm:p-6 lg:p-8">{children}</main>
        </div>
      </div>
    </div>
  );
}

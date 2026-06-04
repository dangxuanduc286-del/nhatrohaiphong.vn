import Link from "next/link";

import { adminNavigation } from "@/config/admin-navigation";
import type { AdminPermission } from "@/server/admin/rbac";

type AdminNavProps = {
  permissions: string[];
};

function canView(permission: AdminPermission, permissions: string[]) {
  return permissions.includes(permission);
}

export function AdminSidebar({ permissions }: AdminNavProps) {
  const items = adminNavigation.filter((item) => canView(item.permission, permissions));

  return (
    <aside className="hidden w-72 shrink-0 border-r bg-white p-4 lg:block">
      <Link href="/" className="mb-6 block text-lg font-bold hover:text-blue-700">
        Admin Core
      </Link>
      <nav className="space-y-1" aria-label="Admin navigation">
        <Link
          href="/"
          className="block min-h-11 rounded-xl px-3 py-2.5 text-sm text-slate-700 hover:bg-slate-100"
        >
          Trang chủ
        </Link>
        {items.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="block min-h-11 rounded-xl px-3 py-2.5 text-sm text-slate-700 hover:bg-slate-100"
          >
            {item.label}
          </Link>
        ))}
        <form action="/api/auth/logout" method="post">
          <button className="block min-h-11 w-full rounded-xl px-3 py-2.5 text-left text-sm text-red-700 hover:bg-red-50">
            Đăng xuất
          </button>
        </form>
      </nav>
    </aside>
  );
}

export function AdminMobileNav({ permissions }: AdminNavProps) {
  const items = adminNavigation.filter((item) => canView(item.permission, permissions));

  return (
    <nav
      className="flex gap-2 overflow-x-auto border-b bg-white px-4 py-2 lg:hidden"
      aria-label="Admin mobile navigation"
    >
      <Link
        href="/"
        className="flex min-h-11 shrink-0 items-center rounded-full border px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100"
      >
        Trang chủ
      </Link>
      {items.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className="flex min-h-11 shrink-0 items-center rounded-full border px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100"
        >
          {item.label}
        </Link>
      ))}
      <form action="/api/auth/logout" method="post" className="shrink-0">
        <button className="min-h-11 rounded-full border border-red-200 px-4 py-2 text-xs font-medium text-red-700 hover:bg-red-50">
          Đăng xuất
        </button>
      </form>
    </nav>
  );
}

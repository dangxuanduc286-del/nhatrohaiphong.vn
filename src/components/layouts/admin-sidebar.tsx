import Link from "next/link";

import { adminNavigation } from "@/config/admin-navigation";

export function AdminSidebar() {
  return (
    <aside className="hidden w-72 shrink-0 border-r bg-white p-4 lg:block">
      <div className="mb-6 text-lg font-bold">Admin Core</div>
      <nav className="space-y-1" aria-label="Admin navigation">
        {adminNavigation.map((item) => (
          <Link key={item.href} href={item.href} className="block rounded-md px-3 py-2 text-sm text-slate-700 hover:bg-slate-100">
            {item.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}

export function AdminMobileNav() {
  return (
    <nav className="flex gap-2 overflow-x-auto border-b bg-white px-4 py-2 lg:hidden" aria-label="Admin mobile navigation">
      {adminNavigation.map((item) => (
        <Link key={item.href} href={item.href} className="shrink-0 rounded-full border px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100">
          {item.label}
        </Link>
      ))}
    </nav>
  );
}

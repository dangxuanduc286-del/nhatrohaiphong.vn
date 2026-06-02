import Link from "next/link";
import type { ReactNode } from "react";

import { requireLandlordPage } from "@/server/landlord/utils";

const landlordNav = [
  { label: "Dashboard", href: "/landlord" },
  { label: "Wallet", href: "/landlord/wallet" },
  { label: "Billing", href: "/landlord/billing" },
  { label: "Checkout", href: "/landlord/checkout" },
] as const;

export default async function LandlordLayout({ children }: { children: ReactNode }) {
  const auth = await requireLandlordPage();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950">
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-5 sm:px-6 lg:px-8">
          <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Landlord Dashboard</p>
              <h1 className="text-2xl font-bold">Monetization & Billing</h1>
            </div>
            <div className="rounded-full bg-slate-100 px-4 py-2 text-sm text-slate-700">{auth.user?.fullName ?? auth.user?.email ?? "Landlord"}</div>
          </div>
          <nav className="flex flex-wrap gap-2">
            {landlordNav.map((item) => (
              <Link key={item.href} href={item.href} className="rounded-full border bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:border-blue-300 hover:text-blue-700">
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">{children}</main>
    </div>
  );
}

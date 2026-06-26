import Link from "next/link";

import type { PostRoomCta } from "./types";

const navItems = [
  { label: "Tìm phòng", href: "/phong-tro-hai-phong" },
  { label: "Khu vực", href: "#khu-vuc" },
  { label: "Gần KCN", href: "#tien-ich" },
  { label: "Gần trường", href: "#tien-ich" },
  { label: "Gần bệnh viện", href: "#tien-ich" },
];

const mobileMenuItems = ["Tìm phòng", "Khu vực", "Gần KCN", "Gần trường", "Gần bệnh viện"];

export function SiteHeader({ postRoomCta }: { postRoomCta: PostRoomCta }) {
  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/85 px-4 shadow-[0_1px_12px_rgba(15,23,42,0.04)] backdrop-blur-xl sm:px-6 lg:px-8">
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-3">
        <Link
          href="/"
          className="shrink-0 text-lg font-extrabold tracking-tight text-[#2563EB] sm:text-xl"
        >
          Nhatrohaiphong.vn
        </Link>
        <div className="hidden items-center gap-1 rounded-full bg-slate-50 p-1 text-sm font-semibold text-[#374151] lg:flex">
          {navItems.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="rounded-full px-4 py-2 hover:bg-white hover:text-[#2563EB]"
            >
              {item.label}
            </Link>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/phong-tro-hai-phong"
            data-analytics-event="cta_find_room_click"
            data-analytics-location="home_header"
            data-analytics-label="Tìm phòng ngay"
            className="hidden min-h-11 items-center justify-center rounded-2xl border border-[#2563EB] bg-white px-4 text-sm font-bold text-[#2563EB] shadow-sm sm:inline-flex"
          >
            Tìm phòng ngay
          </Link>
          <Link
            href={postRoomCta.href}
            data-analytics-event="cta_post_room_click"
            data-analytics-location="home_header"
            data-analytics-label={postRoomCta.label}
            className="hidden min-h-11 items-center justify-center rounded-2xl bg-[#EA580C] px-4 text-sm font-bold text-white shadow-sm sm:inline-flex"
          >
            {postRoomCta.label}
          </Link>
          <Link
            href="/login"
            className="hidden min-h-11 items-center justify-center rounded-2xl border border-slate-200 bg-white px-4 text-sm font-semibold text-[#111827] lg:inline-flex"
          >
            Đăng nhập
          </Link>
          <details className="relative lg:hidden">
            <summary className="flex h-11 w-11 cursor-pointer list-none items-center justify-center rounded-2xl border border-slate-200 bg-white text-xl font-bold">
              ☰
            </summary>
            <div className="absolute right-0 top-12 w-72 rounded-3xl border border-slate-200 bg-white p-3 shadow-xl">
              {mobileMenuItems.map((item) => (
                <Link
                  key={item}
                  href={
                    item === "Tìm phòng"
                      ? "/phong-tro-hai-phong"
                      : item === "Khu vực"
                        ? "#khu-vuc"
                        : "#tien-ich"
                  }
                  className="block rounded-2xl px-4 py-3 text-sm font-semibold text-[#374151] hover:bg-slate-50"
                >
                  {item}
                </Link>
              ))}
              <Link
                href={postRoomCta.href}
                className="mt-2 flex min-h-11 items-center justify-center rounded-2xl bg-[#EA580C] px-4 text-sm font-bold text-white"
              >
                {postRoomCta.label}
              </Link>
              <Link
                href="/login"
                className="mt-2 flex min-h-11 items-center justify-center rounded-2xl border border-slate-200 text-sm font-semibold"
              >
                Đăng nhập
              </Link>
            </div>
          </details>
        </div>
      </nav>
    </header>
  );
}

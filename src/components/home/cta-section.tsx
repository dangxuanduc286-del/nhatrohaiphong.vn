import Link from "next/link";

import type { PostRoomCta } from "./types";

export function CtaSection({ postRoomCta }: { postRoomCta: PostRoomCta }) {
  return (
    <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-16">
      <div className="overflow-hidden rounded-3xl bg-[#111827] p-6 text-white shadow-xl sm:p-8 lg:flex lg:items-center lg:justify-between">
        <div>
          <p className="text-sm font-bold uppercase tracking-wide text-orange-200">
            Sẵn sàng bắt đầu?
          </p>
          <h2 className="mt-2 text-3xl font-extrabold">
            Tìm phòng nhanh hơn hoặc đăng phòng miễn phí hôm nay
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-200">
            Tập trung vào hai hành động chính: người thuê xem phòng đang trống, chủ trọ đăng tin để
            tăng cơ hội tiếp cận.
          </p>
        </div>
        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:mt-0">
          <Link
            href="/phong-tro-hai-phong"
            className="inline-flex min-h-12 items-center justify-center rounded-2xl bg-white px-5 text-sm font-extrabold text-[#2563EB]"
          >
            Tìm phòng ngay
          </Link>
          <Link
            href={postRoomCta.href}
            className="inline-flex min-h-12 items-center justify-center rounded-2xl bg-[#EA580C] px-5 text-sm font-extrabold text-white"
          >
            {postRoomCta.label}
          </Link>
        </div>
      </div>
    </section>
  );
}

export function StickyCta({ postRoomCta }: { postRoomCta: PostRoomCta }) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-30 border-t border-slate-200 bg-white/95 p-3 shadow-2xl backdrop-blur sm:hidden">
      <div className="grid grid-cols-2 gap-3">
        <Link
          href="/phong-tro-hai-phong"
          className="inline-flex min-h-12 items-center justify-center rounded-2xl bg-[#2563EB] text-sm font-extrabold text-white"
        >
          Tìm phòng
        </Link>
        <Link
          href={postRoomCta.href}
          className="inline-flex min-h-12 items-center justify-center rounded-2xl bg-[#EA580C] text-sm font-extrabold text-white"
        >
          {postRoomCta.mobileLabel}
        </Link>
      </div>
    </div>
  );
}

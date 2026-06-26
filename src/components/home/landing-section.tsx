import Image from "next/image";
import Link from "next/link";

import { getAreaImage } from "./formatters";

type LandingPage = {
  title: string;
  path: string;
  content: string | null;
  district: { rooms: { id: string }[] } | null;
};

export function LandingSection({ landingPages }: { landingPages: LandingPage[] }) {
  return (
    <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-16">
      <div>
        <p className="text-sm font-bold uppercase tracking-wide text-[#2563EB]">Khu vực nổi bật</p>
        <h2 className="mt-2 text-3xl font-extrabold text-[#111827]">Gợi ý tìm kiếm phổ biến</h2>
      </div>
      {landingPages.length ? (
        <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {landingPages.map((page, index) => (
            <Link
              key={page.path}
              href={page.path}
              className="group overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-lg"
            >
              <div className="relative aspect-[16/9] overflow-hidden bg-slate-200">
                <Image
                  src={getAreaImage(index + 2)}
                  alt={page.title}
                  fill
                  sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                  className="object-cover transition group-hover:scale-105"
                />
              </div>
              <div className="p-5">
                <h3 className="text-lg font-bold text-[#111827]">📍 {page.title}</h3>
                <p className="mt-2 line-clamp-2 text-sm leading-6 text-[#64748B]">
                  {page.content ?? "Phòng trọ đang cho thuê tại Hải Phòng"}
                </p>
                <p className="mt-3 text-sm font-bold text-[#2563EB]">
                  {page.district?.rooms.length
                    ? `${page.district.rooms.length.toLocaleString("vi-VN")} phòng`
                    : "Chưa có dữ liệu phù hợp"}
                </p>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="mt-6 rounded-3xl border border-dashed border-slate-300 bg-white p-8 text-center">
          <h2 className="text-2xl font-bold">Chưa có dữ liệu phù hợp</h2>
          <Link
            href="/phong-tro-hai-phong"
            className="mt-5 inline-flex min-h-12 items-center rounded-2xl bg-[#2563EB] px-5 text-sm font-bold text-white"
          >
            Xem tất cả phòng
          </Link>
        </div>
      )}
    </section>
  );
}

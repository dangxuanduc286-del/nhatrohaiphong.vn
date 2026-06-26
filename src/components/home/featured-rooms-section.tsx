import Image from "next/image";
import Link from "next/link";

import { formatArea, formatCurrency, formatPostedAt, safeImage } from "./formatters";
import { SkeletonCard } from "./skeleton-card";

type FeaturedRoom = {
  id: string;
  title: string;
  slug: string;
  price: { toString(): string };
  area: { toString(): string };
  address: string;
  createdAt: Date;
  district: { name: string };
  ward: { name: string };
  images: { url: string; altText: string | null }[];
};

export function FeaturedRoomsSection({ rooms }: { rooms: FeaturedRoom[] }) {
  const hasFeaturedRooms = rooms.length > 0;

  return (
    <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-16">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-bold uppercase tracking-wide text-[#2563EB]">
            Phòng thật, xem ngay
          </p>
          <h2 className="mt-2 text-3xl font-extrabold text-[#111827]">Phòng nổi bật</h2>
        </div>
        <Link
          href="/phong-tro-hai-phong"
          className="inline-flex min-h-12 items-center justify-center rounded-2xl bg-[#2563EB] px-5 text-sm font-bold text-white shadow-sm"
        >
          Xem tất cả
        </Link>
      </div>
      {hasFeaturedRooms ? (
        <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {rooms.map((room, index) => (
            <Link
              key={room.id}
              href={`/phong/${room.slug}`}
              className="group overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-lg"
            >
              <div className="relative aspect-[4/3] overflow-hidden bg-slate-200">
                <Image
                  src={safeImage(room.images[0]?.url, index)}
                  alt={room.images[0]?.altText ?? room.title}
                  fill
                  sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                  className="object-cover transition duration-500 group-hover:scale-105"
                />
                <div className="absolute left-3 top-3 flex gap-2">
                  <span className="rounded-full bg-white/95 px-3 py-1 text-xs font-extrabold text-[#111827] shadow-sm">
                    Mới đăng
                  </span>
                  {index < 2 ? (
                    <span className="rounded-full bg-[#EA580C] px-3 py-1 text-xs font-extrabold text-white shadow-sm">
                      Hot
                    </span>
                  ) : null}
                  <span className="rounded-full bg-emerald-600 px-3 py-1 text-xs font-extrabold text-white shadow-sm">
                    Xác minh
                  </span>
                </div>
              </div>
              <div className="p-5">
                <div className="text-2xl font-extrabold text-[#EA580C]">
                  {formatCurrency(room.price)}
                </div>
                <h3 className="mt-2 line-clamp-2 min-h-12 text-lg font-bold leading-6 text-[#111827]">
                  {room.title}
                </h3>
                <div className="mt-3 grid gap-1 text-sm text-[#475569]">
                  <span className="font-bold">{formatArea(room.area)}</span>
                  <span>{room.district.name} - Hải Phòng</span>
                  <span className="line-clamp-1">{room.address}</span>
                </div>
                <p className="mt-3 text-sm text-[#94A3B8]">{formatPostedAt(room.createdAt)}</p>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="mt-6 rounded-3xl border border-dashed border-slate-300 bg-white p-8 text-center shadow-sm">
          <h2 className="text-2xl font-bold text-[#111827]">Chưa có dữ liệu phù hợp</h2>
          <p className="mt-2 text-sm text-[#64748B]">
            Bạn có thể xem toàn bộ phòng đang được cập nhật.
          </p>
          <Link
            href="/phong-tro-hai-phong"
            className="mt-5 inline-flex min-h-12 items-center justify-center rounded-2xl bg-[#2563EB] px-5 text-sm font-bold text-white"
          >
            Xem tất cả phòng
          </Link>
        </div>
      )}
      {!hasFeaturedRooms ? (
        <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <SkeletonCard type="room" />
          <SkeletonCard type="room" />
          <SkeletonCard type="room" />
          <SkeletonCard type="room" />
        </div>
      ) : null}
    </section>
  );
}

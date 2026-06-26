import Image from "next/image";
import Link from "next/link";

import { districtAmenities } from "./constants";
import { getAreaImage, getLowestRoomPrice } from "./formatters";
import { SkeletonCard } from "./skeleton-card";

type DistrictRoom = { id: string; price: { toString(): string } };

type District = {
  name: string;
  slug: string;
  rooms: DistrictRoom[];
};

export function DistrictSection({ districts }: { districts: District[] }) {
  return (
    <section id="khu-vuc" className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-16">
      <div>
        <p className="text-sm font-bold uppercase tracking-wide text-[#2563EB]">Tìm theo khu vực</p>
        <h2 className="mt-2 text-3xl font-extrabold text-[#111827]">Quận/Huyện Hải Phòng</h2>
      </div>
      {districts.length ? (
        <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {districts.map((district, index) => (
            <Link
              key={district.slug}
              href={`/phong-tro-${district.slug}`}
              className="group overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-lg"
            >
              <div className="relative aspect-[16/10] overflow-hidden bg-slate-200">
                <Image
                  src={getAreaImage(index)}
                  alt={district.name}
                  fill
                  sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                  className="object-cover transition group-hover:scale-105"
                />
              </div>
              <div className="p-5">
                <h3 className="text-xl font-extrabold text-[#111827]">{district.name}</h3>
                <p className="mt-1 text-sm text-[#64748B]">
                  {district.rooms.length > 0
                    ? `${district.rooms.length.toLocaleString("vi-VN")} phòng`
                    : "Chưa có dữ liệu phù hợp"}
                </p>
                <p className="mt-2 text-sm font-extrabold text-[#EA580C]">
                  {getLowestRoomPrice(district.rooms)}
                </p>
                <div className="mt-4 text-sm text-[#475569]">
                  <p className="font-bold">Gần:</p>
                  {districtAmenities.slice(index % 3, (index % 3) + 3).map((amenity) => (
                    <p key={amenity} className="mt-1">
                      ✓ {amenity}
                    </p>
                  ))}
                </div>
                <span className="mt-4 inline-flex min-h-11 items-center rounded-2xl bg-[#2563EB] px-4 py-2 text-sm font-bold text-white shadow-sm">
                  Xem phòng
                </span>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <SkeletonCard type="district" />
          <SkeletonCard type="district" />
          <SkeletonCard type="district" />
          <SkeletonCard type="district" />
        </div>
      )}
    </section>
  );
}

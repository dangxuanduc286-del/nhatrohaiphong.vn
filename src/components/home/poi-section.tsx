import Link from "next/link";

import { poiLabels } from "./constants";
import { SkeletonCard } from "./skeleton-card";

type Poi = {
  name: string;
  slug: string;
  category: string;
};

export function PoiSection({ pois }: { pois: Poi[] }) {
  return (
    <section id="tien-ich" className="bg-[#F8FAFC] px-4 py-10 sm:px-6 lg:px-8 lg:py-16">
      <div className="mx-auto max-w-7xl">
        <div>
          <p className="text-sm font-bold uppercase tracking-wide text-[#2563EB]">Gần tiện ích</p>
          <h2 className="mt-2 text-3xl font-extrabold text-[#111827]">Tiện ích quan trọng</h2>
        </div>
        {pois.length ? (
          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {pois.map((poi) => {
              const meta = poiLabels[poi.category] ?? {
                label: "Địa điểm",
                icon: "📍",
                tone: "bg-slate-100 text-[#475569]",
              };
              return (
                <Link
                  key={poi.slug}
                  href={`/api/search/poi?poi=${poi.slug}&category=${poi.category}`}
                  className="rounded-3xl border border-slate-200 bg-white p-5 text-[#111827] shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-lg"
                >
                  <span
                    className={`inline-flex rounded-2xl px-3 py-2 text-sm font-bold ${meta.tone}`}
                  >
                    {meta.icon} {meta.label}
                  </span>
                  <span className="mt-4 block text-lg font-extrabold">{poi.name}</span>
                  <span className="mt-2 block text-sm text-[#64748B]">Chưa có dữ liệu phù hợp</span>
                  <span className="mt-4 block text-sm font-bold text-[#2563EB]">Xem phòng</span>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <SkeletonCard type="poi" />
            <SkeletonCard type="poi" />
            <SkeletonCard type="poi" />
          </div>
        )}
      </div>
    </section>
  );
}

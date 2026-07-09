import { Container } from "@/components/ui";

import { conversionTrustItems } from "./constants";

interface StatsSectionProps {
  roomCount: number;
  landlordCount: number;
  districtCount: number;
}

export function StatsSection({ roomCount, landlordCount, districtCount }: StatsSectionProps) {
  const showMetrics = roomCount > 0 || landlordCount > 0 || districtCount > 0;
  if (!showMetrics) return null;

  return (
    <section className="border-y border-slate-200 bg-white px-4 py-5 sm:px-6 lg:px-8">
      <Container
        flush
        className="grid gap-3 text-sm font-bold text-[#374151] sm:grid-cols-3 lg:grid-cols-6"
      >
        <span className="rounded-2xl bg-blue-50 px-4 py-3 text-[#2563EB]">
          {roomCount.toLocaleString("vi-VN")} phòng đang trống
        </span>
        <span className="rounded-2xl bg-orange-50 px-4 py-3 text-[#EA580C]">
          {landlordCount.toLocaleString("vi-VN")} chủ trọ
        </span>
        <span className="rounded-2xl bg-slate-50 px-4 py-3">
          {districtCount.toLocaleString("vi-VN")} khu vực
        </span>
        {conversionTrustItems.map((item) => (
          <span key={item} className="rounded-2xl bg-slate-50 px-4 py-3">
            ✓ {item}
          </span>
        ))}
      </Container>
    </section>
  );
}

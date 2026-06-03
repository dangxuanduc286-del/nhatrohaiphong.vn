import { calculateDistanceKm } from "@/server/geo/distance";

type PoiDistance = {
  id: string;
  name: string;
  category: string;
  latitude: { toString(): string } | number;
  longitude: { toString(): string } | number;
};

type PoiDistanceListProps = {
  roomLatitude: number | null;
  roomLongitude: number | null;
  pois: PoiDistance[];
};

const categoryLabels: Record<string, string> = {
  UNIVERSITY: "Trường học",
  HOSPITAL: "Bệnh viện",
  INDUSTRIAL_PARK: "Khu công nghiệp",
  SHOPPING_MALL: "Trung tâm thương mại",
};

function toNumber(value: { toString(): string } | number) {
  return typeof value === "number" ? value : Number(value.toString());
}

export function PoiDistanceList({ roomLatitude, roomLongitude, pois }: PoiDistanceListProps) {
  if (roomLatitude === null || roomLongitude === null || pois.length === 0) {
    return null;
  }

  const distances = pois
    .map((poi) => ({
      ...poi,
      distanceKm: calculateDistanceKm({ latitude: roomLatitude, longitude: roomLongitude }, { latitude: toNumber(poi.latitude), longitude: toNumber(poi.longitude) }),
    }))
    .filter((poi) => poi.distanceKm !== null)
    .sort((a, b) => (a.distanceKm ?? 0) - (b.distanceKm ?? 0))
    .slice(0, 8);

  if (distances.length === 0) {
    return null;
  }

  return (
    <section className="rounded-2xl border bg-white p-6 shadow-sm transition-all hover:shadow-lg">
      <h2 className="text-3xl font-bold text-[#111827]">Khoảng cách tiện ích gần phòng</h2>
      <div className="mt-5 grid gap-6 sm:grid-cols-2">
        {distances.map((poi) => (
          <div key={poi.id} className="rounded-2xl border p-6 shadow-sm transition-all hover:shadow-lg">
            <div className="text-lg font-semibold text-[#111827]">{poi.name}</div>
            <div className="mt-1 text-sm font-normal text-[#6B7280]">{categoryLabels[poi.category] ?? poi.category}</div>
            <div className="mt-3 text-lg font-semibold text-[#2563EB]">{poi.distanceKm?.toLocaleString("vi-VN")} km</div>
          </div>
        ))}
      </div>
    </section>
  );
}

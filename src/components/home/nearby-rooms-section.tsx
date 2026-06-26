import dynamic from "next/dynamic";

const NearMeSearch = dynamic(
  () => import("@/components/search/near-me-search").then((mod) => mod.NearMeSearch),
  {
    loading: () => (
      <div
        className="min-h-64 rounded-2xl border bg-white shadow-sm"
        aria-label="Đang tải tìm phòng gần tôi"
      />
    ),
  },
);

export function NearbyRoomsSection() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <NearMeSearch />
    </section>
  );
}

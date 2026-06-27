import dynamic from "next/dynamic";

import { Card } from "@/components/ui";

const NearMeSearch = dynamic(
  () => import("@/components/search/near-me-search").then((mod) => mod.NearMeSearch),
  {
    loading: () => <Card className="min-h-64" aria-label="Đang tải tìm phòng gần tôi" />,
  },
);

export function NearbyRoomsSection() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <NearMeSearch />
    </section>
  );
}

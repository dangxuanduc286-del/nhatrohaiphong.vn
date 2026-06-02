import { notFound } from "next/navigation";

import { PoiDistanceList } from "@/components/rooms/poi-distance-list";
import { RoomMap } from "@/components/rooms/room-map";
import { db } from "@/lib/db";
import { createSeoMetadata, residenceJsonLd, JsonLdScript } from "@/lib/seo";

export const revalidate = 300;

function toNumber(value: { toString(): string } | number | null) {
  return value === null ? null : Number(value.toString());
}

async function loadRoom(slug: string) {
  return db.room.findFirst({
    where: { slug, deletedAt: null, status: "AVAILABLE" },
    include: {
      district: { include: { city: true } },
      ward: true,
      building: { include: { property: true } },
      images: { where: { deletedAt: null }, orderBy: [{ isPrimary: "desc" }, { sortOrder: "asc" }] },
      amenities: { include: { amenity: true } },
    },
  });
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const room = await loadRoom(slug);

  if (!room) {
    return createSeoMetadata({ title: "Không tìm thấy phòng", description: "Phòng trọ không tồn tại hoặc chưa khả dụng.", path: `/phong/${slug}`, noIndex: true });
  }

  return createSeoMetadata({
    title: room.title,
    description: room.description ?? `Phòng trọ tại ${room.address}, ${room.ward.name}, ${room.district.name}.`,
    path: `/phong/${room.slug}`,
    image: room.images[0]?.url,
    keywords: [room.title, room.ward.name, room.district.name, "phòng trọ Hải Phòng"],
  });
}

export default async function RoomDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const room = await loadRoom(slug);

  if (!room) {
    notFound();
  }

  const latitude = toNumber(room.latitude);
  const longitude = toNumber(room.longitude);
  const pois =
    latitude !== null && longitude !== null
      ? await db.pointOfInterest.findMany({
          where: { deletedAt: null, category: { in: ["UNIVERSITY", "HOSPITAL", "INDUSTRIAL_PARK", "SHOPPING_MALL"] } },
          select: { id: true, name: true, category: true, latitude: true, longitude: true },
          take: 80,
        })
      : [];
  const jsonLd = residenceJsonLd([{ name: room.title, url: `/phong/${room.slug}`, address: room.address, price: Number(room.price.toString()) }]);

  return (
    <main className="min-h-screen bg-slate-50">
      <JsonLdScript data={jsonLd} />
      <section className="bg-white">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[1fr_360px] lg:px-8">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-blue-700">Chi tiết phòng trọ</p>
            <h1 className="mt-4 text-3xl font-bold tracking-tight text-slate-950 sm:text-5xl">{room.title}</h1>
            <p className="mt-4 text-lg leading-8 text-slate-600">{room.description ?? room.address}</p>
            <div className="mt-6 flex flex-wrap gap-2 text-sm text-slate-600">
              <span className="rounded-full bg-slate-100 px-3 py-1">{room.district.name}</span>
              <span className="rounded-full bg-slate-100 px-3 py-1">{room.ward.name}</span>
              <span className="rounded-full bg-slate-100 px-3 py-1">{room.area.toString()} m²</span>
              <span className="rounded-full bg-slate-100 px-3 py-1">{room.capacity} người</span>
            </div>
          </div>
          <aside className="rounded-2xl border bg-slate-50 p-5">
            <div className="text-sm text-slate-500">Giá thuê</div>
            <div className="mt-2 text-3xl font-bold text-blue-700">{Number(room.price.toString()).toLocaleString("vi-VN")} đ</div>
            <div className="mt-5 grid gap-3 text-sm text-slate-700">
              <div className="flex justify-between gap-4"><span>Đặt cọc</span><strong>{room.deposit ? `${Number(room.deposit.toString()).toLocaleString("vi-VN")} đ` : "Liên hệ"}</strong></div>
              <div className="flex justify-between gap-4"><span>Tòa nhà</span><strong>{room.building.name}</strong></div>
              <div className="flex justify-between gap-4"><span>Trạng thái</span><strong>{room.status}</strong></div>
            </div>
          </aside>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-6 px-4 py-10 sm:px-6 lg:px-8">
        <RoomMap title={room.title} address={room.address} latitude={latitude} longitude={longitude} />
        <PoiDistanceList roomLatitude={latitude} roomLongitude={longitude} pois={pois} />
        <section className="rounded-2xl border bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold text-slate-950">Tiện ích</h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {room.amenities.length ? room.amenities.map((item) => <span key={item.amenityId} className="rounded-full bg-blue-50 px-3 py-1 text-sm text-blue-700">{item.amenity.name}</span>) : <span className="text-sm text-slate-600">Đang cập nhật tiện ích.</span>}
          </div>
        </section>
      </section>
    </main>
  );
}

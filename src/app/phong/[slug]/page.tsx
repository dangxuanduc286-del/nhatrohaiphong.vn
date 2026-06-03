import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { AnalyticsView } from "@/components/analytics/event-tracker";
import { PoiDistanceList } from "@/components/rooms/poi-distance-list";
import { RoomMap } from "@/components/rooms/room-map";
import { db } from "@/lib/db";
import { createSeoMetadata, breadcrumbJsonLd, residenceJsonLd, JsonLdScript } from "@/lib/seo";

export const revalidate = 300;

function toNumber(value: { toString(): string } | number | null) {
  return value === null ? null : Number(value.toString());
}

function formatCurrency(value: { toString(): string } | number | null) {
  return value === null ? "Liên hệ" : `${Number(value.toString()).toLocaleString("vi-VN")} đ`;
}

function googleDirectionsUrl(latitude: number, longitude: number) {
  return `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`;
}

async function loadRoom(slug: string) {
  return db.room.findFirst({
    where: { slug, deletedAt: null, status: "AVAILABLE" },
    include: {
      district: { include: { city: true } },
      ward: true,
      building: { include: { property: { include: { owner: true } } } },
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

  const cityName = room.district.city?.name ?? "Hải Phòng";

  return createSeoMetadata({
    title: room.title,
    description: room.description ?? `Phòng trọ tại ${room.address}, ${room.ward.name}, ${room.district.name}, ${cityName}. Xem giá thuê, diện tích, tiện ích và liên hệ chủ trọ trực tiếp.`,
    path: `/phong/${room.slug}`,
    image: room.images[0]?.url,
    keywords: [room.title, room.ward.name, room.district.name, cityName, `phòng trọ ${room.district.name}`, `nhà trọ ${cityName}`],
  });
}

async function loadRelatedRooms(room: NonNullable<Awaited<ReturnType<typeof loadRoom>>>) {
  return db.room.findMany({
    where: {
      id: { not: room.id },
      deletedAt: null,
      status: "AVAILABLE",
      OR: [{ wardId: room.wardId }, { districtId: room.districtId }],
    },
    select: {
      id: true,
      title: true,
      slug: true,
      address: true,
      price: true,
      area: true,
      ward: { select: { name: true } },
      district: { select: { name: true } },
    },
    orderBy: [{ wardId: "desc" }, { updatedAt: "desc" }],
    take: 6,
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
  const ownerPhone = room.building.property.owner.phone;
  const directionsUrl = latitude !== null && longitude !== null ? googleDirectionsUrl(latitude, longitude) : null;
  const relatedRoomsPromise = loadRelatedRooms(room);
  const districtLandingPath = `/phong-tro-${room.district.slug}`;
  const districtLandingPromise = db.landingPage.findFirst({
    where: { deletedAt: null, isPublished: true, path: districtLandingPath },
    select: { path: true },
  });
  const pois =
    latitude !== null && longitude !== null
      ? await db.pointOfInterest.findMany({
          where: { deletedAt: null, category: { in: ["UNIVERSITY", "HOSPITAL", "INDUSTRIAL_PARK", "SHOPPING_MALL"] } },
          select: { id: true, name: true, category: true, latitude: true, longitude: true },
          take: 80,
        })
      : [];
  const [relatedRooms, districtLanding] = await Promise.all([relatedRoomsPromise, districtLandingPromise]);
  const cityName = room.district.city?.name ?? "Hải Phòng";
  const citySlug = room.district.city?.slug;
  const breadcrumbs = [
    { name: "Trang chủ", url: "/" },
    { name: cityName, url: citySlug === "hai-phong" ? "/phong-tro-hai-phong" : "/" },
    ...(districtLanding ? [{ name: room.district.name, url: districtLanding.path }] : []),
    { name: room.title, url: `/phong/${room.slug}` },
  ];
  const jsonLd = [
    breadcrumbJsonLd(breadcrumbs),
    ...residenceJsonLd([{ name: room.title, url: `/phong/${room.slug}`, address: `${room.address}, ${room.ward.name}, ${room.district.name}`, price: Number(room.price.toString()) }]),
  ];
  const galleryImages = room.images.length ? room.images : [{ url: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80", altText: room.title }];

  return (
    <main className="min-h-screen bg-[#F9FAFB] pb-24 text-[#111827] lg:pb-0">
      <AnalyticsView eventName="room_view" payload={{ location: "room_detail_page", roomSlug: room.slug, district: room.district.name, ward: room.ward.name }} />
      <JsonLdScript data={jsonLd} />
      <section className="bg-white">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-20">
          <div className="grid gap-3 lg:grid-cols-[1.4fr_0.6fr]">
            <div className="overflow-hidden rounded-2xl bg-slate-200 shadow-sm transition-all hover:shadow-lg">
              <Image src={galleryImages[0].url} alt={galleryImages[0].altText ?? room.title} width={1200} height={720} className="h-72 w-full object-cover sm:h-[28rem]" />
            </div>
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-1">
              {galleryImages.slice(1, 3).map((image) => (
                <div key={image.url} className="overflow-hidden rounded-2xl bg-slate-200 shadow-sm transition-all hover:shadow-lg">
                  <Image src={image.url} alt={image.altText ?? room.title} width={600} height={360} className="h-36 w-full object-cover sm:h-[13.6rem]" />
                </div>
              ))}
              {galleryImages.length === 1 ? (
                <div className="rounded-2xl border border-dashed bg-slate-50 p-6 text-sm font-normal text-[#9CA3AF]">Ảnh thực tế đang được chủ trọ cập nhật thêm.</div>
              ) : null}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-6 px-4 py-12 sm:px-6 lg:grid-cols-[1fr_380px] lg:px-8 lg:py-20">
        <div className="space-y-6">
          <section className="rounded-2xl border bg-white p-6 shadow-sm transition-all hover:shadow-lg">
            <div className="flex flex-wrap gap-2 text-sm font-normal uppercase tracking-wide">
              <span className="rounded-full bg-orange-50 px-3 py-1 text-[#EA580C]">Đã xác minh</span>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-[#6B7280]">Mới đăng</span>
              <span className="rounded-full bg-blue-50 px-3 py-1 text-[#2563EB]">Gần tiện ích</span>
            </div>
            <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-[#111827] sm:text-4xl lg:text-5xl">{room.title}</h1>
            <p className="mt-4 text-base font-normal leading-7 text-[#6B7280]">{room.description ?? room.address}</p>
            <div className="mt-5 grid gap-3 sm:grid-cols-4">
              <div className="rounded-2xl bg-blue-50 p-6"><span className="text-sm font-normal text-[#2563EB]">Giá thuê</span><strong className="mt-1 block text-xl font-semibold text-[#EA580C]">{formatCurrency(room.price)}</strong></div>
              <div className="rounded-2xl bg-slate-50 p-6"><span className="text-sm font-normal text-[#6B7280]">Diện tích</span><strong className="mt-1 block text-xl font-semibold text-[#111827]">{room.area.toString()} m²</strong></div>
              <div className="rounded-2xl bg-slate-50 p-6"><span className="text-sm font-normal text-[#6B7280]">Sức chứa</span><strong className="mt-1 block text-xl font-semibold text-[#111827]">{room.capacity} người</strong></div>
              <div className="rounded-2xl bg-slate-50 p-6"><span className="text-sm font-normal text-[#6B7280]">Đặt cọc</span><strong className="mt-1 block text-xl font-semibold text-[#111827]">{formatCurrency(room.deposit)}</strong></div>
            </div>
            <p className="mt-5 rounded-2xl bg-slate-50 p-6 text-sm font-normal text-[#6B7280]">📍 {room.address}, {room.ward.name}, {room.district.name}</p>
          </section>

          <nav aria-label="Breadcrumb" className="rounded-2xl border bg-white p-4 text-sm font-normal text-[#9CA3AF] shadow-sm">
            <ol className="flex flex-wrap gap-2">
              {breadcrumbs.map((item, index) => (
                <li key={`${item.url}-${index}`} className="flex items-center gap-2">
                  {index > 0 ? <span>/</span> : null}
                  <Link className="hover:text-[#2563EB]" href={item.url}>{item.name}</Link>
                </li>
              ))}
            </ol>
          </nav>

          <section className="rounded-2xl border bg-white p-6 shadow-sm transition-all hover:shadow-lg">
            <h2 className="text-3xl font-bold text-[#111827]">Tiện ích</h2>
            <div className="mt-4 flex flex-wrap gap-2">
              {room.amenities.length ? room.amenities.map((item) => <span key={item.amenityId} className="rounded-full bg-blue-50 px-4 py-2 text-sm font-normal text-[#2563EB]">{item.amenity.name}</span>) : <span className="text-sm font-normal text-[#6B7280]">Đang cập nhật tiện ích.</span>}
            </div>
          </section>

          <RoomMap title={room.title} address={room.address} latitude={latitude} longitude={longitude} />
          <PoiDistanceList roomLatitude={latitude} roomLongitude={longitude} pois={pois} />

          <section className="rounded-2xl border bg-white p-6 shadow-sm transition-all hover:shadow-lg">
            <div className="flex items-end justify-between gap-4">
              <div>
                <h2 className="text-3xl font-bold text-[#111827]">Phòng liên quan gần khu vực</h2>
                <p className="mt-2 text-sm font-normal text-[#6B7280]">Liên kết nội bộ tới phòng cùng phường hoặc cùng quận, chỉ lấy từ phòng đang khả dụng.</p>
              </div>
              {districtLanding ? <Link href={districtLanding.path} className="hidden min-h-11 items-center rounded-2xl border px-4 text-sm font-semibold text-[#2563EB] sm:inline-flex">Xem khu vực</Link> : null}
            </div>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              {relatedRooms.length ? relatedRooms.map((item) => (
                <Link key={item.id} href={`/phong/${item.slug}`} data-analytics-event="related_room_click" data-analytics-location="room_detail_related" data-analytics-label={item.title} className="rounded-2xl border p-5 transition-all hover:border-blue-200 hover:shadow-lg">
                  <span className="text-lg font-semibold text-[#111827]">{item.title}</span>
                  <span className="mt-2 line-clamp-2 block text-sm font-normal text-[#6B7280]">{item.address}, {item.ward.name}, {item.district.name}</span>
                  <span className="mt-3 flex flex-wrap gap-2 text-sm font-normal text-[#6B7280]"><span className="rounded-full bg-slate-100 px-3 py-1">{item.area.toString()} m²</span><span className="rounded-full bg-orange-50 px-3 py-1 text-[#EA580C]">{formatCurrency(item.price)}/tháng</span></span>
                </Link>
              )) : <p className="rounded-2xl bg-slate-50 p-5 text-sm font-normal text-[#6B7280] md:col-span-2">Khu vực này đang được cập nhật thêm phòng liên quan.</p>}
            </div>
          </section>
        </div>

        <aside className="h-fit rounded-2xl border bg-white p-6 shadow-sm transition-all hover:shadow-lg lg:sticky lg:top-6">
          <div className="text-sm font-normal uppercase tracking-wide text-[#6B7280]">Liên hệ chủ trọ</div>
          <div className="mt-2 text-3xl font-bold text-[#EA580C]">{formatCurrency(room.price)}</div>
          <div className="mt-5 space-y-3 text-sm font-normal text-[#6B7280]">
            <div className="flex justify-between gap-4"><span>Tòa nhà</span><strong className="text-right">{room.building.name}</strong></div>
            <div className="flex justify-between gap-4"><span>Khu vực</span><strong>{room.district.name}</strong></div>
            <div className="flex justify-between gap-4"><span>Trạng thái</span><strong>Sẵn phòng</strong></div>
          </div>
          <div className="mt-6 grid gap-3">
            {ownerPhone ? <a href={`tel:${ownerPhone}`} data-analytics-event="contact_click" data-analytics-location="room_detail_sidebar" data-analytics-label={room.slug} className="inline-flex min-h-12 items-center justify-center rounded-2xl bg-[#EA580C] px-5 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:shadow-lg">📞 Gọi chủ trọ</a> : <span className="inline-flex min-h-12 items-center justify-center rounded-2xl bg-slate-100 px-5 py-3 text-sm font-normal text-[#9CA3AF]">📞 Chủ trọ chưa công khai SĐT</span>}
            {directionsUrl ? <a href={directionsUrl} target="_blank" rel="noreferrer" data-analytics-event="directions_click" data-analytics-location="room_detail_sidebar" data-analytics-label={room.slug} className="inline-flex min-h-12 items-center justify-center rounded-2xl bg-[#2563EB] px-5 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:shadow-lg">📍 Chỉ đường</a> : <span className="inline-flex min-h-12 items-center justify-center rounded-2xl border px-5 py-3 text-sm font-normal text-[#9CA3AF]">📍 Chưa có tọa độ</span>}
          </div>
        </aside>
      </section>

      <div className="fixed inset-x-0 bottom-0 z-20 border-t bg-white/95 p-3 shadow-2xl backdrop-blur lg:hidden">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-3">
          {ownerPhone ? <a href={`tel:${ownerPhone}`} data-analytics-event="contact_click" data-analytics-location="room_detail_mobile_sticky" data-analytics-label={room.slug} className="inline-flex min-h-12 items-center justify-center rounded-2xl bg-[#EA580C] text-sm font-semibold text-white">📞 Gọi chủ trọ</a> : <span className="inline-flex min-h-12 items-center justify-center rounded-2xl bg-slate-100 text-sm font-normal text-[#9CA3AF]">Chưa có SĐT</span>}
          {directionsUrl ? <a href={directionsUrl} target="_blank" rel="noreferrer" data-analytics-event="directions_click" data-analytics-location="room_detail_mobile_sticky" data-analytics-label={room.slug} className="inline-flex min-h-12 items-center justify-center rounded-2xl bg-[#2563EB] text-sm font-semibold text-white">📍 Chỉ đường</a> : <span className="inline-flex min-h-12 items-center justify-center rounded-2xl border text-sm font-normal text-[#9CA3AF]">Chưa có tọa độ</span>}
        </div>
      </div>
    </main>
  );
}

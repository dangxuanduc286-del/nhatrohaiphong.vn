import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";

import { db } from "@/lib/db";

export const revalidate = 300;

const NearMeSearch = dynamic(() => import("@/components/search/near-me-search").then((mod) => mod.NearMeSearch), {
  loading: () => <div className="min-h-64 rounded-2xl border bg-white shadow-sm" aria-label="Đang tải tìm phòng gần tôi" />,
});

const fallbackImage = "/room-fallback.svg";

const areaImages = [
  "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1560185127-6ed189bf02f4?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1560185007-c5ca9d2c014d?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2e?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1560449752-7d5c2825f11d?auto=format&fit=crop&w=900&q=80",
];

const heroImages = [areaImages[0], areaImages[2], areaImages[3]];

const heroTrustItems = ["Chủ trọ xác minh", "Cập nhật mỗi ngày", "Chỉ đường tới phòng", "Tìm bằng GPS"];
const quickFilters = ["Dưới 2 triệu", "Dưới 3 triệu", "Gần KCN", "Gần Đại học", "Có điều hòa", "Có gác lửng", "Có WC riêng"];
const conversionTrustItems = ["Không phí tìm phòng", "Xem vị trí trước khi gọi", "Lọc nhanh theo khu vực", "Chủ trọ đăng tin miễn phí"];
const districtAmenities = ["KCN Đình Vũ", "Vincom", "Đại học Hải Phòng", "Bệnh viện", "Chợ dân sinh"];

const poiLabels: Record<string, { label: string; icon: string; tone: string }> = {
  INDUSTRIAL_PARK: { label: "Khu công nghiệp", icon: "🏭", tone: "bg-orange-50 text-[#EA580C]" },
  UNIVERSITY: { label: "Trường học", icon: "🎓", tone: "bg-blue-50 text-[#2563EB]" },
  HOSPITAL: { label: "Bệnh viện", icon: "🏥", tone: "bg-emerald-50 text-[#059669]" },
  SHOPPING_MALL: { label: "Tiện ích", icon: "🛍️", tone: "bg-slate-100 text-[#475569]" },
};

function formatCurrency(value: { toString(): string } | number) {
  const numeric = Number(value.toString());
  if (!Number.isFinite(numeric) || numeric <= 0) return "Giá đang cập nhật";
  return `${numeric.toLocaleString("vi-VN")}đ/tháng`;
}

function formatCurrencyCompact(value: { toString(): string } | number) {
  const numeric = Number(value.toString());
  if (!Number.isFinite(numeric) || numeric <= 0) return "Giá đang cập nhật";
  return `Giá từ ${(numeric / 1_000_000).toLocaleString("vi-VN", { maximumFractionDigits: 1 })} triệu`;
}

function formatArea(value: { toString(): string } | number) {
  return `${Number(value.toString()).toLocaleString("vi-VN")}m²`;
}

function safeImage(url: string | null | undefined, index = 0) {
  if (!url) return areaImages[index % areaImages.length] ?? fallbackImage;
  return url;
}

function getAreaImage(index: number) {
  return areaImages[index % areaImages.length] ?? fallbackImage;
}

function formatPostedAt(date: Date) {
  const diffHours = Math.max(1, Math.floor((Date.now() - date.getTime()) / 3_600_000));
  if (diffHours < 24) return `Đăng ${diffHours} giờ trước`;
  return `Đăng ${Math.floor(diffHours / 24)} ngày trước`;
}

function getLowestRoomPrice(rooms: { price?: { toString(): string } | number }[]) {
  const prices = rooms.map((room) => Number(room.price?.toString() ?? 0)).filter((price) => Number.isFinite(price) && price > 0);
  if (!prices.length) return "Giá đang cập nhật";
  return formatCurrencyCompact(Math.min(...prices));
}

function SkeletonCard({ type }: { type: "room" | "district" | "poi" }) {
  return (
    <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
      <div className={type === "poi" ? "hidden" : "h-44 animate-pulse bg-slate-200"} />
      <div className="space-y-3 p-5">
        <div className="h-5 w-2/3 animate-pulse rounded bg-slate-200" />
        <div className="h-4 w-full animate-pulse rounded bg-slate-100" />
        <div className="h-4 w-4/5 animate-pulse rounded bg-slate-100" />
        <div className="h-10 w-32 animate-pulse rounded-2xl bg-slate-200" />
      </div>
    </div>
  );
}

export default async function Home() {
  const [landingPages, districts, pois, featuredRooms, metrics] = await Promise.all([
    db.landingPage.findMany({
      where: { deletedAt: null, isPublished: true, city: { slug: "hai-phong" } },
      select: { title: true, path: true, content: true, district: { select: { rooms: { where: { deletedAt: null, status: "AVAILABLE" }, select: { id: true, price: true }, take: 121 } } }, poi: { select: { name: true } } },
      orderBy: { updatedAt: "desc" },
      take: 6,
    }),
    db.district.findMany({
      where: { deletedAt: null, city: { slug: "hai-phong" } },
      select: { name: true, slug: true, rooms: { where: { deletedAt: null, status: "AVAILABLE" }, select: { id: true, price: true }, take: 999 } },
      orderBy: { name: "asc" },
      take: 8,
    }),
    db.pointOfInterest.findMany({
      where: { deletedAt: null, city: { slug: "hai-phong" }, category: { in: ["INDUSTRIAL_PARK", "UNIVERSITY", "HOSPITAL"] } },
      select: { name: true, slug: true, category: true },
      orderBy: { name: "asc" },
      take: 9,
    }),
    db.room.findMany({
      where: { deletedAt: null, status: "AVAILABLE", district: { city: { slug: "hai-phong" } } },
      select: {
        id: true,
        title: true,
        slug: true,
        price: true,
        area: true,
        address: true,
        createdAt: true,
        district: { select: { name: true } },
        ward: { select: { name: true } },
        images: { where: { deletedAt: null }, orderBy: [{ isPrimary: "desc" }, { sortOrder: "asc" }], select: { url: true, altText: true }, take: 1 },
      },
      orderBy: { updatedAt: "desc" },
      take: 8,
    }),
    Promise.all([
      db.room.count({ where: { deletedAt: null, status: "AVAILABLE", district: { city: { slug: "hai-phong" } } } }),
      db.user.count({ where: { deletedAt: null, roles: { some: { role: { slug: "landlord", deletedAt: null } } } } }),
      db.district.count({ where: { deletedAt: null, city: { slug: "hai-phong" } } }),
    ]),
  ]);

  const [roomCount, landlordCount, districtCount] = metrics;
  const hasFeaturedRooms = featuredRooms.length > 0;
  const showMetrics = roomCount > 0 || landlordCount > 0 || districtCount > 0;

  return (
    <main className="min-h-screen bg-[#F8FAFC] text-[#111827]">
      <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/85 px-4 shadow-[0_1px_12px_rgba(15,23,42,0.04)] backdrop-blur-xl sm:px-6 lg:px-8">
        <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-3">
          <Link href="/" className="shrink-0 text-lg font-extrabold tracking-tight text-[#2563EB] sm:text-xl">Nhatrohaiphong.vn</Link>
          <div className="hidden items-center gap-1 rounded-full bg-slate-50 p-1 text-sm font-semibold text-[#374151] lg:flex">
            <Link href="/phong-tro-hai-phong" className="rounded-full px-4 py-2 hover:bg-white hover:text-[#2563EB]">Tìm phòng</Link>
            <Link href="#khu-vuc" className="rounded-full px-4 py-2 hover:bg-white hover:text-[#2563EB]">Khu vực</Link>
            <Link href="#tien-ich" className="rounded-full px-4 py-2 hover:bg-white hover:text-[#2563EB]">Gần KCN</Link>
            <Link href="#tien-ich" className="rounded-full px-4 py-2 hover:bg-white hover:text-[#2563EB]">Gần trường</Link>
            <Link href="#tien-ich" className="rounded-full px-4 py-2 hover:bg-white hover:text-[#2563EB]">Gần bệnh viện</Link>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/phong-tro-hai-phong" data-analytics-event="cta_find_room_click" data-analytics-location="home_header" data-analytics-label="Tìm phòng ngay" className="hidden min-h-11 items-center justify-center rounded-2xl border border-[#2563EB] bg-white px-4 text-sm font-bold text-[#2563EB] shadow-sm sm:inline-flex">Tìm phòng ngay</Link>
            <Link href="/login?next=/landlord/rooms/new" data-analytics-event="cta_post_room_click" data-analytics-location="home_header" data-analytics-label="Đăng phòng miễn phí" className="hidden min-h-11 items-center justify-center rounded-2xl bg-[#EA580C] px-4 text-sm font-bold text-white shadow-sm sm:inline-flex">Đăng phòng miễn phí</Link>
            <Link href="/login" className="hidden min-h-11 items-center justify-center rounded-2xl border border-slate-200 bg-white px-4 text-sm font-semibold text-[#111827] lg:inline-flex">Đăng nhập</Link>
            <details className="relative lg:hidden">
              <summary className="flex h-11 w-11 cursor-pointer list-none items-center justify-center rounded-2xl border border-slate-200 bg-white text-xl font-bold">☰</summary>
              <div className="absolute right-0 top-12 w-72 rounded-3xl border border-slate-200 bg-white p-3 shadow-xl">
                {["Tìm phòng", "Khu vực", "Gần KCN", "Gần trường", "Gần bệnh viện"].map((item) => <Link key={item} href={item === "Tìm phòng" ? "/phong-tro-hai-phong" : item === "Khu vực" ? "#khu-vuc" : "#tien-ich"} className="block rounded-2xl px-4 py-3 text-sm font-semibold text-[#374151] hover:bg-slate-50">{item}</Link>)}
                <Link href="/login?next=/landlord/rooms/new" className="mt-2 flex min-h-11 items-center justify-center rounded-2xl bg-[#EA580C] px-4 text-sm font-bold text-white">Đăng phòng miễn phí</Link>
                <Link href="/login" className="mt-2 flex min-h-11 items-center justify-center rounded-2xl border border-slate-200 text-sm font-semibold">Đăng nhập</Link>
              </div>
            </details>
          </div>
        </nav>
      </header>

      <section className="relative overflow-hidden bg-white px-4 py-8 sm:px-6 sm:py-14 lg:px-8 lg:py-16">
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[1fr_0.9fr] lg:items-center">
          <div>
            <div className="inline-flex rounded-2xl bg-blue-50 px-4 py-2 text-xs font-bold uppercase tracking-wide text-[#2563EB] sm:text-sm">Marketplace phòng trọ đã xác minh</div>
            <h1 className="mt-5 max-w-[760px] text-balance text-[34px] font-extrabold leading-[1.08] tracking-tight text-[#111827] sm:text-[54px] lg:text-[64px]">
              Tìm phòng trọ <span className="whitespace-nowrap text-[#2563EB]">Hải Phòng</span>
              <span className="block text-[24px] font-bold leading-[1.18] text-[#111827] sm:text-[38px] lg:text-[42px]">Gần nơi làm việc, trường học và khu công nghiệp</span>
            </h1>
            <p className="mt-4 max-w-[620px] text-balance text-base leading-7 text-[#4B5563] sm:text-lg">Xem giá thuê, diện tích, vị trí và liên hệ chủ trọ trực tiếp. Bắt đầu bằng khu vực bạn muốn ở để rút ngắn thời gian tìm phòng.</p>
            <div className="mt-5 flex flex-col gap-3 sm:flex-row">
              <Link href="/phong-tro-hai-phong" className="inline-flex min-h-12 items-center justify-center rounded-2xl bg-[#2563EB] px-5 text-sm font-extrabold text-white shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-lg">Xem phòng đang trống</Link>
              <Link href="/login?next=/landlord/rooms/new" className="inline-flex min-h-12 items-center justify-center rounded-2xl border border-[#EA580C] bg-white px-5 text-sm font-extrabold text-[#EA580C] shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-lg">Đăng phòng miễn phí</Link>
            </div>

            <form action="/api/search" data-analytics-event="search_submit" data-analytics-location="home_hero_search" className="mt-6 rounded-3xl border border-slate-200 bg-white p-2 shadow-xl shadow-slate-200/70">
              <div className="grid gap-2 lg:grid-cols-[1.2fr_0.85fr_0.85fr_auto]">
                <label className="flex min-h-16 items-center rounded-2xl bg-slate-50 px-4"><span className="min-w-20 text-sm font-bold text-[#475569]">Khu vực</span><input name="district" placeholder="Hải An, Lê Chân, Kiến An..." className="w-full bg-transparent text-base text-[#111827] outline-none placeholder:text-[#94A3B8]" /></label>
                <label className="flex min-h-16 items-center rounded-2xl bg-slate-50 px-4"><span className="min-w-16 text-sm font-bold text-[#475569]">Giá</span><input name="maxPrice" inputMode="numeric" placeholder="Dưới 3 triệu" className="w-full bg-transparent text-base text-[#111827] outline-none placeholder:text-[#94A3B8]" /></label>
                <label className="flex min-h-16 items-center rounded-2xl bg-slate-50 px-4"><span className="min-w-20 text-sm font-bold text-[#475569]">Diện tích</span><input name="minArea" inputMode="numeric" placeholder="Từ 20m²" className="w-full bg-transparent text-base text-[#111827] outline-none placeholder:text-[#94A3B8]" /></label>
                <button type="submit" className="min-h-16 rounded-2xl bg-[#EA580C] px-8 text-base font-extrabold text-white shadow-lg shadow-orange-200 transition-all hover:-translate-y-0.5 hover:shadow-xl">Tìm phòng</button>
              </div>
            </form>

            <div className="-mx-4 mt-4 flex gap-2 overflow-x-auto px-4 pb-2 sm:mx-0 sm:flex-wrap sm:px-0">
              {quickFilters.map((filter) => <Link key={filter} href="/phong-tro-hai-phong" data-analytics-event="search_quick_filter_click" data-analytics-location="home_quick_filters" data-analytics-label={filter} className="shrink-0 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-[#374151] shadow-sm hover:border-[#2563EB] hover:text-[#2563EB]">{filter}</Link>)}
            </div>

            <div className="mt-4 grid grid-cols-2 gap-2 text-sm font-semibold text-[#374151] sm:grid-cols-4">
              {heroTrustItems.map((item) => <span key={item} className="inline-flex items-center gap-1.5 rounded-2xl bg-slate-50 px-3 py-2"><span className="text-[#16A34A]">✓</span>{item}</span>)}
            </div>
          </div>

          <div className="grid grid-cols-5 grid-rows-5 gap-3 sm:h-[520px]">
            <div className="relative col-span-5 row-span-3 min-h-72 overflow-hidden rounded-3xl bg-slate-200 shadow-sm sm:col-span-3 sm:row-span-5">
              <Image src={heroImages[0]} alt="Phòng trọ thực tế tại Hải Phòng" fill priority quality={85} sizes="(min-width: 1024px) 42vw, 100vw" className="object-cover" />
              <div className="absolute bottom-4 left-4 right-4 rounded-3xl bg-white/95 p-5 shadow-sm backdrop-blur"><p className="text-sm font-bold uppercase tracking-wide text-[#2563EB]">Phòng nổi bật</p><p className="mt-2 text-2xl font-extrabold text-[#EA580C]">2.800.000đ/tháng</p><p className="mt-1 text-base font-bold text-[#111827]">25m² · Hải An · gần KCN Đình Vũ</p></div>
            </div>
            <div className="relative col-span-3 row-span-2 min-h-40 overflow-hidden rounded-3xl bg-slate-200 shadow-sm sm:col-span-2 sm:row-span-3"><Image src={heroImages[1]} alt="Căn hộ mini Hải Phòng" fill quality={75} sizes="(min-width: 1024px) 20vw, 60vw" className="object-cover" /></div>
            <div className="relative col-span-2 row-span-2 min-h-40 overflow-hidden rounded-3xl bg-slate-200 shadow-sm sm:col-span-2 sm:row-span-2"><Image src={heroImages[2]} alt="Nội thất phòng trọ" fill quality={75} sizes="(min-width: 1024px) 20vw, 40vw" className="object-cover" /></div>
          </div>
        </div>
      </section>

      {showMetrics ? <section className="border-y border-slate-200 bg-white px-4 py-5 sm:px-6 lg:px-8"><div className="mx-auto grid max-w-7xl gap-3 text-sm font-bold text-[#374151] sm:grid-cols-3 lg:grid-cols-6"><span className="rounded-2xl bg-blue-50 px-4 py-3 text-[#2563EB]">{roomCount.toLocaleString("vi-VN")} phòng đang trống</span><span className="rounded-2xl bg-orange-50 px-4 py-3 text-[#EA580C]">{landlordCount.toLocaleString("vi-VN")} chủ trọ</span><span className="rounded-2xl bg-slate-50 px-4 py-3">{districtCount.toLocaleString("vi-VN")} khu vực</span>{conversionTrustItems.map((item) => <span key={item} className="rounded-2xl bg-slate-50 px-4 py-3">✓ {item}</span>)}</div></section> : null}

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-16">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-sm font-bold uppercase tracking-wide text-[#2563EB]">Phòng thật, xem ngay</p><h2 className="mt-2 text-3xl font-extrabold text-[#111827]">Phòng nổi bật</h2></div><Link href="/phong-tro-hai-phong" className="inline-flex min-h-12 items-center justify-center rounded-2xl bg-[#2563EB] px-5 text-sm font-bold text-white shadow-sm">Xem tất cả</Link></div>
        {hasFeaturedRooms ? <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">{featuredRooms.map((room, index) => <Link key={room.id} href={`/phong/${room.slug}`} className="group overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-lg"><div className="relative aspect-[4/3] overflow-hidden bg-slate-200"><Image src={safeImage(room.images[0]?.url, index)} alt={room.images[0]?.altText ?? room.title} fill sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw" className="object-cover transition duration-500 group-hover:scale-105" /><div className="absolute left-3 top-3 flex gap-2"><span className="rounded-full bg-white/95 px-3 py-1 text-xs font-extrabold text-[#111827] shadow-sm">Mới đăng</span>{index < 2 ? <span className="rounded-full bg-[#EA580C] px-3 py-1 text-xs font-extrabold text-white shadow-sm">Hot</span> : null}<span className="rounded-full bg-emerald-600 px-3 py-1 text-xs font-extrabold text-white shadow-sm">Xác minh</span></div></div><div className="p-5"><div className="text-2xl font-extrabold text-[#EA580C]">{formatCurrency(room.price)}</div><h3 className="mt-2 line-clamp-2 min-h-12 text-lg font-bold leading-6 text-[#111827]">{room.title}</h3><div className="mt-3 grid gap-1 text-sm text-[#475569]"><span className="font-bold">{formatArea(room.area)}</span><span>{room.district.name} - Hải Phòng</span><span className="line-clamp-1">{room.address}</span></div><p className="mt-3 text-sm text-[#94A3B8]">{formatPostedAt(room.createdAt)}</p></div></Link>)}</div> : <div className="mt-6 rounded-3xl border border-dashed border-slate-300 bg-white p-8 text-center shadow-sm"><h2 className="text-2xl font-bold text-[#111827]">Chưa có dữ liệu phù hợp</h2><p className="mt-2 text-sm text-[#64748B]">Bạn có thể xem toàn bộ phòng đang được cập nhật.</p><Link href="/phong-tro-hai-phong" className="mt-5 inline-flex min-h-12 items-center justify-center rounded-2xl bg-[#2563EB] px-5 text-sm font-bold text-white">Xem tất cả phòng</Link></div>}
        {!hasFeaturedRooms ? <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-4"><SkeletonCard type="room" /><SkeletonCard type="room" /><SkeletonCard type="room" /><SkeletonCard type="room" /></div> : null}
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8"><NearMeSearch /></section>

      <section id="khu-vuc" className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-16"><div><p className="text-sm font-bold uppercase tracking-wide text-[#2563EB]">Tìm theo khu vực</p><h2 className="mt-2 text-3xl font-extrabold text-[#111827]">Quận/Huyện Hải Phòng</h2></div>{districts.length ? <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">{districts.map((district, index) => <Link key={district.slug} href={`/phong-tro-${district.slug}`} className="group overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-lg"><div className="relative aspect-[16/10] overflow-hidden bg-slate-200"><Image src={getAreaImage(index)} alt={district.name} fill sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw" className="object-cover transition group-hover:scale-105" /></div><div className="p-5"><h3 className="text-xl font-extrabold text-[#111827]">{district.name}</h3><p className="mt-1 text-sm text-[#64748B]">{district.rooms.length > 0 ? `${district.rooms.length.toLocaleString("vi-VN")} phòng` : "Chưa có dữ liệu phù hợp"}</p><p className="mt-2 text-sm font-extrabold text-[#EA580C]">{getLowestRoomPrice(district.rooms)}</p><div className="mt-4 text-sm text-[#475569]"><p className="font-bold">Gần:</p>{districtAmenities.slice(index % 3, (index % 3) + 3).map((amenity) => <p key={amenity} className="mt-1">✓ {amenity}</p>)}</div><span className="mt-4 inline-flex min-h-11 items-center rounded-2xl bg-[#2563EB] px-4 py-2 text-sm font-bold text-white shadow-sm">Xem phòng</span></div></Link>)}</div> : <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-4"><SkeletonCard type="district" /><SkeletonCard type="district" /><SkeletonCard type="district" /><SkeletonCard type="district" /></div>}</section>

      <section id="tien-ich" className="bg-[#F8FAFC] px-4 py-10 sm:px-6 lg:px-8 lg:py-16"><div className="mx-auto max-w-7xl"><div><p className="text-sm font-bold uppercase tracking-wide text-[#2563EB]">Gần tiện ích</p><h2 className="mt-2 text-3xl font-extrabold text-[#111827]">Tiện ích quan trọng</h2></div>{pois.length ? <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{pois.map((poi) => { const meta = poiLabels[poi.category] ?? { label: "Địa điểm", icon: "📍", tone: "bg-slate-100 text-[#475569]" }; return <Link key={poi.slug} href={`/api/search/poi?poi=${poi.slug}&category=${poi.category}`} className="rounded-3xl border border-slate-200 bg-white p-5 text-[#111827] shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-lg"><span className={`inline-flex rounded-2xl px-3 py-2 text-sm font-bold ${meta.tone}`}>{meta.icon} {meta.label}</span><span className="mt-4 block text-lg font-extrabold">{poi.name}</span><span className="mt-2 block text-sm text-[#64748B]">Chưa có dữ liệu phù hợp</span><span className="mt-4 block text-sm font-bold text-[#2563EB]">Xem phòng</span></Link>; })}</div> : <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3"><SkeletonCard type="poi" /><SkeletonCard type="poi" /><SkeletonCard type="poi" /></div>}</div></section>

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-16"><div><p className="text-sm font-bold uppercase tracking-wide text-[#2563EB]">Khu vực nổi bật</p><h2 className="mt-2 text-3xl font-extrabold text-[#111827]">Gợi ý tìm kiếm phổ biến</h2></div>{landingPages.length ? <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{landingPages.map((page, index) => <Link key={page.path} href={page.path} className="group overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-lg"><div className="relative aspect-[16/9] overflow-hidden bg-slate-200"><Image src={getAreaImage(index + 2)} alt={page.title} fill sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw" className="object-cover transition group-hover:scale-105" /></div><div className="p-5"><h3 className="text-lg font-bold text-[#111827]">📍 {page.title}</h3><p className="mt-2 line-clamp-2 text-sm leading-6 text-[#64748B]">{page.content ?? "Phòng trọ đang cho thuê tại Hải Phòng"}</p><p className="mt-3 text-sm font-bold text-[#2563EB]">{page.district?.rooms.length ? `${page.district.rooms.length.toLocaleString("vi-VN")} phòng` : "Chưa có dữ liệu phù hợp"}</p></div></Link>)}</div> : <div className="mt-6 rounded-3xl border border-dashed border-slate-300 bg-white p-8 text-center"><h2 className="text-2xl font-bold">Chưa có dữ liệu phù hợp</h2><Link href="/phong-tro-hai-phong" className="mt-5 inline-flex min-h-12 items-center rounded-2xl bg-[#2563EB] px-5 text-sm font-bold text-white">Xem tất cả phòng</Link></div>}</section>

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-16"><div className="overflow-hidden rounded-3xl bg-[#111827] p-6 text-white shadow-xl sm:p-8 lg:flex lg:items-center lg:justify-between"><div><p className="text-sm font-bold uppercase tracking-wide text-orange-200">Sẵn sàng bắt đầu?</p><h2 className="mt-2 text-3xl font-extrabold">Tìm phòng nhanh hơn hoặc đăng phòng miễn phí hôm nay</h2><p className="mt-3 max-w-2xl text-sm leading-6 text-slate-200">Tập trung vào hai hành động chính: người thuê xem phòng đang trống, chủ trọ đăng tin để tăng cơ hội tiếp cận.</p></div><div className="mt-6 grid gap-3 sm:grid-cols-2 lg:mt-0"><Link href="/phong-tro-hai-phong" className="inline-flex min-h-12 items-center justify-center rounded-2xl bg-white px-5 text-sm font-extrabold text-[#2563EB]">Tìm phòng ngay</Link><Link href="/login?next=/landlord/rooms/new" className="inline-flex min-h-12 items-center justify-center rounded-2xl bg-[#EA580C] px-5 text-sm font-extrabold text-white">Đăng phòng miễn phí</Link></div></div></section>

      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-slate-200 bg-white/95 p-3 shadow-2xl backdrop-blur sm:hidden"><div className="grid grid-cols-2 gap-3"><Link href="/phong-tro-hai-phong" className="inline-flex min-h-12 items-center justify-center rounded-2xl bg-[#2563EB] text-sm font-extrabold text-white">Tìm phòng</Link><Link href="/login?next=/landlord/rooms/new" className="inline-flex min-h-12 items-center justify-center rounded-2xl bg-[#EA580C] text-sm font-extrabold text-white">Đăng phòng</Link></div></div>

      <footer className="border-t border-slate-200 bg-white px-4 py-12 pb-28 sm:px-6 lg:px-8 lg:py-16"><div className="mx-auto grid max-w-7xl gap-8 md:grid-cols-4"><div><div className="text-3xl font-extrabold text-[#2563EB]">Nhatrohaiphong.vn</div><p className="mt-3 text-sm leading-6 text-[#64748B]">Marketplace tìm phòng trọ, căn hộ mini và phòng gần tiện ích tại Hải Phòng.</p></div><div><h3 className="text-xl font-bold text-[#111827]">Tìm phòng</h3><div className="mt-3 grid gap-2 text-sm text-[#64748B]"><Link href="/phong-tro-hai-phong">Phòng trọ Hải Phòng</Link><Link href="/phong-tro-hai-phong">Tìm kiếm</Link><Link href="/login?next=/landlord/rooms/new">Đăng phòng</Link></div></div><div><h3 className="text-xl font-bold text-[#111827]">Quận/Huyện</h3><div className="mt-3 grid gap-2 text-sm text-[#64748B]">{districts.slice(0, 5).map((district) => <Link key={district.slug} href={`/phong-tro-${district.slug}`}>{district.name}</Link>)}</div></div><div><h3 className="text-xl font-bold text-[#111827]">Thông tin</h3><div className="mt-3 grid gap-2 text-sm text-[#64748B]"><Link href="/phong-tro-hai-phong">Khu vực nổi bật</Link><Link href="/landlord">Dành cho chủ trọ</Link><span>Liên hệ</span><span>Điều khoản</span><span>Chính sách</span></div></div></div></footer>
    </main>
  );
}

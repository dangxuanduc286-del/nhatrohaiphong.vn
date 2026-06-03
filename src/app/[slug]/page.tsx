import Link from "next/link";
import { notFound } from "next/navigation";

import { AnalyticsView } from "@/components/analytics/event-tracker";
import { db } from "@/lib/db";
import { absoluteUrl, breadcrumbJsonLd, canonicalPath, createSeoMetadata, faqJsonLd, itemListJsonLd, JsonLdScript, residenceJsonLd } from "@/lib/seo";
import { getLandingPageSearch } from "@/server/search/service";

type LandingPageData = Awaited<ReturnType<typeof loadLandingPage>>;

type RelatedLink = {
  label: string;
  href: string;
  description: string;
};

export const revalidate = 300;

function buildLandingDescription(page: NonNullable<LandingPageData>) {
  const location = page.district?.name ?? page.city?.name ?? page.poi?.name ?? "Hải Phòng";
  const total = page.search.total;
  const noun = total > 0 ? `${total} phòng trọ đang sẵn sàng` : "phòng trọ đang cập nhật";
  return `Tìm ${noun} tại ${location}. Cập nhật nhà trọ, phòng cho thuê theo khu vực, tiện ích, mức giá và vị trí thực tế.`;
}

async function loadLandingPage(path: string) {
  const canonical = canonicalPath(path);
  const data = await getLandingPageSearch({ path: canonical, limit: 1 });
  const page = data.items[0];

  if (!page || canonicalPath(page.path) !== canonical) {
    return null;
  }

  return page;
}

async function getRelatedLinks(page: NonNullable<LandingPageData>): Promise<RelatedLink[]> {
  const [districtPages, poiPages] = await Promise.all([
    db.landingPage.findMany({
      where: {
        deletedAt: null,
        isPublished: true,
        id: { not: page.id },
        cityId: page.cityId,
        districtId: page.districtId ? { not: null } : undefined,
      },
      select: { title: true, path: true, district: { select: { name: true } } },
      orderBy: { updatedAt: "desc" },
      take: 8,
    }),
    db.landingPage.findMany({
      where: {
        deletedAt: null,
        isPublished: true,
        id: { not: page.id },
        cityId: page.cityId,
        poiId: { not: null },
      },
      select: { title: true, path: true, poi: { select: { name: true, category: true } } },
      orderBy: { updatedAt: "desc" },
      take: 8,
    }),
  ]);

  return [
    ...districtPages.map((item) => ({
      label: item.title,
      href: item.path,
      description: item.district?.name ? `Khu vực ${item.district.name}` : "Khu vực liên quan",
    })),
    ...poiPages.map((item) => ({
      label: item.title,
      href: item.path,
      description: item.poi?.name ? `Gần ${item.poi.name}` : "Địa điểm liên quan",
    })),
  ].slice(0, 12);
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  const path = `/${resolvedParams.slug}`;
  const page = await loadLandingPage(path);

  if (!page) {
    return createSeoMetadata({ title: "Không tìm thấy", description: "Landing page không tồn tại hoặc chưa được xuất bản.", path, noIndex: true });
  }

  const seo = page.seoSettings[0];
  return createSeoMetadata({
    title: seo?.metaTitle ?? page.title,
    description: seo?.metaDescription ?? buildLandingDescription(page),
    path: seo?.canonicalUrl ?? page.path,
    keywords: seo?.keywords?.length ? seo.keywords : [page.title, page.city?.name, page.district?.name, page.poi?.name].filter((value): value is string => Boolean(value)),
  });
}

export default async function LandingPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  const path = `/${resolvedParams.slug}`;
  const page = await loadLandingPage(path);

  if (!page) {
    notFound();
  }

  const relatedLinks = await getRelatedLinks(page);
  const breadcrumbs = [
    { name: "Trang chủ", url: "/" },
    { name: page.city?.name ?? "Hải Phòng", url: page.city?.slug === "hai-phong" ? "/phong-tro-hai-phong" : page.path },
    ...(page.district ? [{ name: page.district.name, url: page.path }] : []),
    ...(page.poi ? [{ name: page.poi.name, url: page.path }] : []),
  ];
  const rooms = page.search.items;
  const jsonLd = [
    breadcrumbJsonLd(breadcrumbs),
    itemListJsonLd(rooms.map((room) => ({ name: room.title, url: `/phong/${room.slug}` }))),
    ...residenceJsonLd(rooms.map((room) => ({ name: room.title, url: `/phong/${room.slug}`, address: room.address, price: room.price }))),
    faqJsonLd(page.faqs.map((faq) => ({ question: faq.question, answer: faq.answer }))),
  ].filter((item): item is NonNullable<typeof item> => Boolean(item));

  return (
    <main className="min-h-screen bg-[#F9FAFB] text-[#111827]">
      <AnalyticsView eventName="seo_landing_view" payload={{ location: "seo_landing_page", path: page.path, title: page.title }} />
      <JsonLdScript data={jsonLd} />
      <section className="bg-white">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8 lg:py-20">
          <nav aria-label="Breadcrumb" className="text-sm font-normal text-[#9CA3AF]">
            <ol className="flex flex-wrap gap-2">
              {breadcrumbs.map((item, index) => (
                <li key={`${item.url}-${index}`} className="flex items-center gap-2">
                  {index > 0 ? <span>/</span> : null}
                  <Link className="hover:text-[#2563EB]" href={item.url}>{item.name}</Link>
                </li>
              ))}
            </ol>
          </nav>
          <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_320px] lg:items-start">
            <div>
              <p className="text-sm font-normal uppercase tracking-wide text-[#2563EB]">Landing page Hải Phòng</p>
              <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-[#111827] sm:text-4xl lg:text-5xl">{page.title}</h1>
              <p className="mt-5 max-w-3xl text-base font-normal leading-7 text-[#6B7280]">{page.content ?? buildLandingDescription(page)}</p>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <Link href="#danh-sach-phong" data-analytics-event="cta_find_room_click" data-analytics-location="seo_landing_hero" data-analytics-label="Xem phòng phù hợp" className="inline-flex min-h-12 items-center justify-center rounded-2xl bg-[#2563EB] px-5 text-sm font-bold text-white shadow-sm">Xem phòng phù hợp</Link>
                <Link href="/login?next=/landlord/rooms/new" data-analytics-event="cta_post_room_click" data-analytics-location="seo_landing_hero" data-analytics-label="Đăng phòng khu vực này" className="inline-flex min-h-12 items-center justify-center rounded-2xl border border-[#EA580C] bg-white px-5 text-sm font-bold text-[#EA580C] shadow-sm">Đăng phòng khu vực này</Link>
              </div>
              <div className="mt-6 flex flex-wrap gap-3 text-sm font-normal text-[#6B7280]">
                {page.city ? <span className="rounded-full bg-blue-50 px-4 py-2 text-[#2563EB]">{page.city.name}</span> : null}
                {page.district ? <span className="rounded-full bg-slate-100 px-4 py-2 text-[#6B7280]">{page.district.name}</span> : null}
                {page.poi ? <span className="rounded-full bg-orange-50 px-4 py-2 text-[#EA580C]">Gần {page.poi.name}</span> : null}
              </div>
            </div>
            <aside className="rounded-2xl border bg-white p-6 shadow-sm transition-all hover:shadow-lg">
              <h2 className="text-xl font-semibold text-[#111827]">Tóm tắt khu vực</h2>
              <dl className="mt-4 grid gap-3 text-sm font-normal">
                <div className="flex justify-between gap-4"><dt className="text-[#6B7280]">Số phòng phù hợp</dt><dd className="font-semibold text-[#111827]">{page.search.total}</dd></div>
                <div className="flex justify-between gap-4"><dt className="text-[#6B7280]">Trang chuẩn</dt><dd className="truncate font-semibold text-[#111827]">{absoluteUrl(page.path)}</dd></div>
                {page.poi ? <div className="flex justify-between gap-4"><dt className="text-[#6B7280]">Bán kính POI</dt><dd className="font-semibold text-[#111827]">5 km</dd></div> : null}
              </dl>
              <div className="mt-5 grid gap-2 text-sm font-semibold text-[#374151]">
                <span className="rounded-2xl bg-blue-50 px-4 py-3 text-[#2563EB]">✓ Dữ liệu phòng khả dụng</span>
                <span className="rounded-2xl bg-orange-50 px-4 py-3 text-[#EA580C]">✓ Có CTA liên hệ ở trang chi tiết</span>
                <span className="rounded-2xl bg-slate-50 px-4 py-3">✓ Tối ưu theo khu vực/tiện ích</span>
              </div>
            </aside>
          </div>
        </div>
      </section>

      <section id="danh-sach-phong" className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8 lg:py-20">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold text-[#111827]">Phòng trọ nổi bật</h2>
            <p className="mt-2 text-sm font-normal text-[#6B7280]">Danh sách được lấy từ dữ liệu phòng đang khả dụng, ưu tiên cập nhật mới.</p>
          </div>
          <Link href={page.path} className="hidden min-h-12 items-center rounded-2xl border bg-white px-4 py-2 text-sm font-semibold text-[#2563EB] transition-all hover:shadow-lg sm:inline-flex">
            Xem trang khu vực
          </Link>
        </div>
        <div className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {rooms.length > 0 ? rooms.map((room) => (
            <article key={room.id} className="rounded-2xl border bg-white p-6 shadow-sm transition-all hover:shadow-lg">
              <h3 className="text-lg font-semibold text-[#111827]">{room.title}</h3>
              <p className="mt-2 line-clamp-2 text-sm font-normal text-[#6B7280]">{room.address}</p>
              <div className="mt-4 flex flex-wrap gap-2 text-sm font-normal text-[#6B7280]">
                <span className="rounded-full bg-slate-100 px-3 py-1">{room.district.name}</span>
                <span className="rounded-full bg-slate-100 px-3 py-1">{room.ward.name}</span>
                <span className="rounded-full bg-slate-100 px-3 py-1">{room.area} m²</span>
              </div>
              <p className="mt-4 text-lg font-semibold text-[#EA580C]">{room.price.toLocaleString("vi-VN")} đ/tháng</p>
              <Link href={`/phong/${room.slug}`} data-analytics-event="landing_room_click" data-analytics-location="seo_landing_room_list" data-analytics-label={room.title} className="mt-4 inline-flex min-h-11 items-center justify-center rounded-2xl bg-[#2563EB] px-4 text-sm font-bold text-white">Xem chi tiết</Link>
            </article>
          )) : <div className="rounded-2xl border bg-white p-6 text-sm font-normal text-[#6B7280] md:col-span-2 lg:col-span-3">Khu vực này đang được cập nhật phòng trọ mới.</div>}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8 lg:py-20">
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-2xl border bg-white p-6 shadow-sm transition-all hover:shadow-lg">
            <h2 className="text-3xl font-bold text-[#111827]">Liên kết khu vực liên quan</h2>
            <div className="mt-5 grid gap-3">
              {relatedLinks.map((item) => (
                <Link key={item.href} href={item.href} className="rounded-2xl border p-6 shadow-sm transition-all hover:shadow-lg">
                  <span className="text-lg font-semibold text-[#111827]">{item.label}</span>
                  <span className="mt-1 block text-sm font-normal text-[#6B7280]">{item.description}</span>
                </Link>
              ))}
            </div>
          </div>
          <div className="rounded-2xl border bg-white p-6 shadow-sm transition-all hover:shadow-lg">
            <h2 className="text-3xl font-bold text-[#111827]">Câu hỏi thường gặp</h2>
            <div className="mt-5 space-y-4">
              {page.faqs.length > 0 ? page.faqs.map((faq) => (
                <article key={faq.id}>
                  <h3 className="text-xl font-semibold text-[#111827]">{faq.question}</h3>
                  <p className="mt-1 text-sm font-normal leading-6 text-[#6B7280]">{faq.answer}</p>
                </article>
              )) : <p className="text-sm font-normal leading-6 text-[#6B7280]">Thông tin hỏi đáp đang được cập nhật theo dữ liệu thực tế của khu vực.</p>}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-12 sm:px-6 lg:px-8 lg:pb-20"><div className="rounded-3xl bg-[#111827] p-6 text-white shadow-xl sm:p-8 lg:flex lg:items-center lg:justify-between"><div><p className="text-sm font-bold uppercase tracking-wide text-orange-200">Tăng tốc hành trình</p><h2 className="mt-2 text-2xl font-extrabold sm:text-3xl">Xem phòng phù hợp hoặc đăng tin cho khu vực này</h2><p className="mt-3 max-w-2xl text-sm leading-6 text-slate-200">CTA cuối trang giúp người dùng không phải cuộn lại đầu trang để tiếp tục hành động.</p></div><div className="mt-6 grid gap-3 sm:grid-cols-2 lg:mt-0"><Link href="#danh-sach-phong" data-analytics-event="cta_find_room_click" data-analytics-location="seo_landing_final_cta" data-analytics-label="Xem phòng" className="inline-flex min-h-12 items-center justify-center rounded-2xl bg-white px-5 text-sm font-extrabold text-[#2563EB]">Xem phòng</Link><Link href="/login?next=/landlord/rooms/new" data-analytics-event="cta_post_room_click" data-analytics-location="seo_landing_final_cta" data-analytics-label="Đăng phòng" className="inline-flex min-h-12 items-center justify-center rounded-2xl bg-[#EA580C] px-5 text-sm font-extrabold text-white">Đăng phòng</Link></div></div></section>
    </main>
  );
}

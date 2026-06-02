import Link from "next/link";
import { notFound } from "next/navigation";

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
    <main className="min-h-screen bg-slate-50">
      <JsonLdScript data={jsonLd} />
      <section className="bg-white">
        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
          <nav aria-label="Breadcrumb" className="text-sm text-slate-500">
            <ol className="flex flex-wrap gap-2">
              {breadcrumbs.map((item, index) => (
                <li key={`${item.url}-${index}`} className="flex items-center gap-2">
                  {index > 0 ? <span>/</span> : null}
                  <Link className="hover:text-blue-700" href={item.url}>{item.name}</Link>
                </li>
              ))}
            </ol>
          </nav>
          <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_320px] lg:items-start">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.25em] text-blue-700">Landing page Hải Phòng</p>
              <h1 className="mt-4 text-3xl font-bold tracking-tight text-slate-950 sm:text-5xl">{page.title}</h1>
              <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-600">{page.content ?? buildLandingDescription(page)}</p>
              <div className="mt-6 flex flex-wrap gap-3 text-sm text-slate-600">
                {page.city ? <span className="rounded-full bg-blue-50 px-4 py-2 text-blue-700">{page.city.name}</span> : null}
                {page.district ? <span className="rounded-full bg-emerald-50 px-4 py-2 text-emerald-700">{page.district.name}</span> : null}
                {page.poi ? <span className="rounded-full bg-amber-50 px-4 py-2 text-amber-700">Gần {page.poi.name}</span> : null}
              </div>
            </div>
            <aside className="rounded-2xl border bg-slate-50 p-5">
              <h2 className="text-lg font-semibold text-slate-950">Tóm tắt khu vực</h2>
              <dl className="mt-4 grid gap-3 text-sm">
                <div className="flex justify-between gap-4"><dt className="text-slate-500">Số phòng phù hợp</dt><dd className="font-semibold">{page.search.total}</dd></div>
                <div className="flex justify-between gap-4"><dt className="text-slate-500">Trang chuẩn</dt><dd className="truncate font-semibold">{absoluteUrl(page.path)}</dd></div>
                {page.poi ? <div className="flex justify-between gap-4"><dt className="text-slate-500">Bán kính POI</dt><dd className="font-semibold">5 km</dd></div> : null}
              </dl>
            </aside>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-950">Phòng trọ nổi bật</h2>
            <p className="mt-2 text-sm text-slate-600">Danh sách được lấy từ dữ liệu phòng đang khả dụng, ưu tiên cập nhật mới.</p>
          </div>
          <Link href={`/api/search?${page.district ? `district=${page.district.slug}` : page.poi ? `poi=${page.poi.slug}` : `city=${page.city?.slug ?? "hai-phong"}`}`} className="hidden rounded-full border bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:border-blue-300 hover:text-blue-700 sm:inline-flex">
            Xem dữ liệu tìm kiếm
          </Link>
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {rooms.length > 0 ? rooms.map((room) => (
            <article key={room.id} className="rounded-2xl border bg-white p-5 shadow-sm">
              <h3 className="text-lg font-semibold text-slate-950">{room.title}</h3>
              <p className="mt-2 line-clamp-2 text-sm text-slate-600">{room.address}</p>
              <div className="mt-4 flex flex-wrap gap-2 text-xs text-slate-600">
                <span className="rounded-full bg-slate-100 px-3 py-1">{room.district.name}</span>
                <span className="rounded-full bg-slate-100 px-3 py-1">{room.ward.name}</span>
                <span className="rounded-full bg-slate-100 px-3 py-1">{room.area} m²</span>
              </div>
              <p className="mt-4 text-lg font-bold text-blue-700">{room.price.toLocaleString("vi-VN")} đ/tháng</p>
            </article>
          )) : <div className="rounded-2xl border bg-white p-6 text-sm text-slate-600 md:col-span-2 lg:col-span-3">Khu vực này đang được cập nhật phòng trọ mới.</div>}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-12 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-2xl border bg-white p-6 shadow-sm">
            <h2 className="text-xl font-bold text-slate-950">Liên kết khu vực liên quan</h2>
            <div className="mt-5 grid gap-3">
              {relatedLinks.map((item) => (
                <Link key={item.href} href={item.href} className="rounded-xl border p-4 hover:border-blue-300 hover:bg-blue-50">
                  <span className="font-semibold text-slate-950">{item.label}</span>
                  <span className="mt-1 block text-sm text-slate-600">{item.description}</span>
                </Link>
              ))}
            </div>
          </div>
          <div className="rounded-2xl border bg-white p-6 shadow-sm">
            <h2 className="text-xl font-bold text-slate-950">Câu hỏi thường gặp</h2>
            <div className="mt-5 space-y-4">
              {page.faqs.length > 0 ? page.faqs.map((faq) => (
                <article key={faq.id}>
                  <h3 className="font-semibold text-slate-950">{faq.question}</h3>
                  <p className="mt-1 text-sm leading-6 text-slate-600">{faq.answer}</p>
                </article>
              )) : <p className="text-sm leading-6 text-slate-600">Thông tin hỏi đáp đang được cập nhật theo dữ liệu thực tế của khu vực.</p>}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

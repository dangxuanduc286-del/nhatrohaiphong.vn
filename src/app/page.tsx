import Link from "next/link";

import { NearMeSearch } from "@/components/search/near-me-search";
import { db } from "@/lib/db";

export const revalidate = 300;

export default async function Home() {
  const [landingPages, districts, pois] = await Promise.all([
    db.landingPage.findMany({ where: { deletedAt: null, isPublished: true, city: { slug: "hai-phong" } }, select: { title: true, path: true }, orderBy: { updatedAt: "desc" }, take: 12 }),
    db.district.findMany({ where: { deletedAt: null, city: { slug: "hai-phong" } }, select: { name: true, slug: true }, orderBy: { name: "asc" }, take: 14 }),
    db.pointOfInterest.findMany({ where: { deletedAt: null, city: { slug: "hai-phong" }, category: { in: ["INDUSTRIAL_PARK", "UNIVERSITY", "HOSPITAL"] } }, select: { name: true, slug: true, category: true }, orderBy: { name: "asc" }, take: 12 }),
  ]);

  return (
    <main className="min-h-screen bg-slate-50">
      <section className="bg-white px-6 py-20">
        <div className="mx-auto max-w-5xl text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-blue-700">Local SEO Hải Phòng</p>
          <h1 className="mt-6 text-4xl font-bold tracking-tight text-slate-950 sm:text-6xl">Tìm phòng trọ Hải Phòng theo khu vực thật</h1>
          <p className="mx-auto mt-6 max-w-3xl text-lg leading-8 text-slate-600">Nhatrohaiphong.vn tổng hợp phòng trọ, nhà trọ theo quận huyện, phường xã, khu công nghiệp, trường học và bệnh viện tại Hải Phòng.</p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link href="/phong-tro-hai-phong" className="rounded-full bg-blue-700 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-800">Xem phòng trọ Hải Phòng</Link>
            <Link href="/api/search?city=hai-phong" className="rounded-full border px-5 py-3 text-sm font-semibold text-slate-700 hover:border-blue-300 hover:text-blue-700">Dữ liệu tìm kiếm</Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-12">
        <NearMeSearch />
      </section>

      <section className="mx-auto grid max-w-6xl gap-8 px-6 pb-12 lg:grid-cols-3">
        <div className="rounded-2xl border bg-white p-6 shadow-sm lg:col-span-2">
          <h2 className="text-2xl font-bold text-slate-950">Landing pages nổi bật</h2>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {landingPages.map((page) => (
              <Link key={page.path} href={page.path} className="rounded-xl border p-4 hover:border-blue-300 hover:bg-blue-50">
                <span className="font-semibold text-slate-950">{page.title}</span>
                <span className="mt-1 block text-sm text-slate-500">{page.path}</span>
              </Link>
            ))}
          </div>
        </div>

        <aside className="rounded-2xl border bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold text-slate-950">Quận/Huyện Hải Phòng</h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {districts.map((district) => (
              <Link key={district.slug} href={`/phong-tro-${district.slug}`} className="rounded-full bg-slate-100 px-3 py-2 text-sm text-slate-700 hover:bg-blue-100 hover:text-blue-700">{district.name}</Link>
            ))}
          </div>
        </aside>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-14">
        <div className="rounded-2xl border bg-white p-6 shadow-sm">
          <h2 className="text-2xl font-bold text-slate-950">Khu công nghiệp, trường học, bệnh viện</h2>
          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {pois.map((poi) => (
              <Link key={poi.slug} href={`/api/search/poi?poi=${poi.slug}&category=${poi.category}`} className="rounded-xl border p-4 hover:border-blue-300 hover:bg-blue-50">
                <span className="font-semibold text-slate-950">{poi.name}</span>
                <span className="mt-1 block text-sm text-slate-500">{poi.category}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}

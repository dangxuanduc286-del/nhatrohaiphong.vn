import { db } from "@/lib/db";

function formatDate(value: Date) {
  return new Intl.DateTimeFormat("vi-VN", { dateStyle: "medium", timeStyle: "short" }).format(value);
}

export default async function AdminSettingsPage() {
  const [seoSettings, landingPages, publishedLandingPages, banners, activeBanners, recentSeo, recentPages] = await Promise.all([
    db.sEOSetting.count({ where: { deletedAt: null } }),
    db.landingPage.count({ where: { deletedAt: null } }),
    db.landingPage.count({ where: { deletedAt: null, isPublished: true } }),
    db.banner.count({ where: { deletedAt: null } }),
    db.banner.count({ where: { deletedAt: null, isActive: true } }),
    db.sEOSetting.findMany({ where: { deletedAt: null }, orderBy: { updatedAt: "desc" }, take: 8, include: { landingPage: { select: { path: true, title: true } } } }),
    db.landingPage.findMany({ where: { deletedAt: null }, orderBy: { updatedAt: "desc" }, take: 8, include: { banners: { where: { deletedAt: null }, select: { id: true, isActive: true } } } }),
  ]);

  return (
    <section className="space-y-6">
      <div><p className="text-sm font-medium uppercase tracking-wide text-slate-500">Settings</p><h2 className="text-2xl font-bold">Cấu hình hệ thống</h2><p className="mt-2 max-w-3xl text-sm text-slate-600">Read-only production UI vì database chưa có bảng site/contact/social settings dạng key-value. Không hard-code dữ liệu mới và không tạo migration.</p></div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5"><div className="rounded-2xl border bg-white p-5 shadow-sm"><div className="text-sm text-slate-500">SEO settings</div><div className="mt-2 text-3xl font-bold">{seoSettings}</div></div><div className="rounded-2xl border bg-white p-5 shadow-sm"><div className="text-sm text-slate-500">Landing pages</div><div className="mt-2 text-3xl font-bold">{landingPages}</div></div><div className="rounded-2xl border bg-white p-5 shadow-sm"><div className="text-sm text-slate-500">Published pages</div><div className="mt-2 text-3xl font-bold">{publishedLandingPages}</div></div><div className="rounded-2xl border bg-white p-5 shadow-sm"><div className="text-sm text-slate-500">Banners</div><div className="mt-2 text-3xl font-bold">{banners}</div></div><div className="rounded-2xl border bg-white p-5 shadow-sm"><div className="text-sm text-slate-500">Active banners</div><div className="mt-2 text-3xl font-bold">{activeBanners}</div></div></div>
      <div className="grid gap-6 xl:grid-cols-2"><div className="overflow-hidden rounded-2xl border bg-white shadow-sm"><div className="border-b p-4 font-semibold">SEO defaults/data hiện có</div><div className="overflow-x-auto"><table className="min-w-[620px] divide-y divide-slate-200 text-sm"><thead className="bg-slate-50 text-left text-xs uppercase text-slate-500"><tr><th className="px-4 py-3">Meta title</th><th className="px-4 py-3">Entity/Page</th><th className="px-4 py-3">Updated</th></tr></thead><tbody className="divide-y divide-slate-100">{recentSeo.map((seo) => <tr key={seo.id}><td className="px-4 py-3 font-medium">{seo.metaTitle}</td><td className="px-4 py-3">{seo.entityType ?? seo.landingPage?.path ?? "Global"}</td><td className="px-4 py-3 text-slate-500">{formatDate(seo.updatedAt)}</td></tr>)}</tbody></table></div></div><div className="overflow-hidden rounded-2xl border bg-white shadow-sm"><div className="border-b p-4 font-semibold">Landing/content settings</div><div className="overflow-x-auto"><table className="min-w-[620px] divide-y divide-slate-200 text-sm"><thead className="bg-slate-50 text-left text-xs uppercase text-slate-500"><tr><th className="px-4 py-3">Page</th><th className="px-4 py-3">Published</th><th className="px-4 py-3">Banners</th></tr></thead><tbody className="divide-y divide-slate-100">{recentPages.map((page) => <tr key={page.id}><td className="px-4 py-3"><div className="font-medium">{page.title}</div><div className="text-xs text-slate-500">{page.path}</div></td><td className="px-4 py-3">{page.isPublished ? "Yes" : "No"}</td><td className="px-4 py-3">{page.banners.length}</td></tr>)}</tbody></table></div></div></div>
      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-900"><strong>Guardrail:</strong> Site name, site description, contact information, social links và SEO defaults chỉ bật ghi dữ liệu khi có schema/API settings rõ ràng và audit log. Hiện giữ read-only để không phá contract/database.</div>
    </section>
  );
}

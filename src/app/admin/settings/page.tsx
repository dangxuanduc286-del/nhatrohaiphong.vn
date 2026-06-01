import { db } from "@/lib/db";

export default async function AdminSettingsPage() {
  const [seoSettings, landingPages, publishedLandingPages, banners, activeBanners] = await Promise.all([
    db.sEOSetting.count({ where: { deletedAt: null } }),
    db.landingPage.count({ where: { deletedAt: null } }),
    db.landingPage.count({ where: { deletedAt: null, isPublished: true } }),
    db.banner.count({ where: { deletedAt: null } }),
    db.banner.count({ where: { deletedAt: null, isActive: true } }),
  ]);

  return (
    <section className="space-y-6">
      <div><p className="text-sm font-medium uppercase tracking-wide text-slate-500">Settings</p><h2 className="text-2xl font-bold">Cấu hình hệ thống</h2><p className="mt-2 max-w-3xl text-sm text-slate-600">Theo dõi SEO settings, site content, contact/social thông qua landing pages và banners từ database. Không hard-code nội dung vận hành.</p></div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <div className="rounded-2xl border bg-white p-5 shadow-sm"><div className="text-sm text-slate-500">SEO settings</div><div className="mt-2 text-3xl font-bold">{seoSettings}</div></div>
        <div className="rounded-2xl border bg-white p-5 shadow-sm"><div className="text-sm text-slate-500">Landing pages</div><div className="mt-2 text-3xl font-bold">{landingPages}</div></div>
        <div className="rounded-2xl border bg-white p-5 shadow-sm"><div className="text-sm text-slate-500">Published pages</div><div className="mt-2 text-3xl font-bold">{publishedLandingPages}</div></div>
        <div className="rounded-2xl border bg-white p-5 shadow-sm"><div className="text-sm text-slate-500">Banners</div><div className="mt-2 text-3xl font-bold">{banners}</div></div>
        <div className="rounded-2xl border bg-white p-5 shadow-sm"><div className="text-sm text-slate-500">Active banners</div><div className="mt-2 text-3xl font-bold">{activeBanners}</div></div>
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border bg-white p-5 shadow-sm"><h3 className="font-semibold">Production readiness</h3><ul className="mt-3 space-y-2 text-sm text-slate-600"><li>• SEO settings lấy từ bảng SEO hiện có.</li><li>• Site/contact/social nên quản trị qua settings API có permission settings.manage.</li><li>• Mọi thay đổi cấu hình cần audit log trước khi bật form ghi dữ liệu.</li></ul></div>
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-900"><strong>Guardrail:</strong> Chưa thêm bảng settings mới vì yêu cầu không thay đổi Prisma schema/database. Cần thiết kế schema riêng trước khi bật cấu hình contact/social dạng key-value.</div>
      </div>
    </section>
  );
}

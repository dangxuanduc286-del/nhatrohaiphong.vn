import { db } from "@/lib/db";
import { fail, ok } from "@/server/api/response";
import { requireAdmin } from "@/server/admin/utils";

export async function GET(request: Request) {
  try {
    await requireAdmin(request.headers.get("authorization"), "settings.manage");
    const [seoSettings, landingPages, publishedLandingPages, banners, activeBanners, cities, districts, wards, poi] = await Promise.all([
      db.sEOSetting.count({ where: { deletedAt: null } }),
      db.landingPage.count({ where: { deletedAt: null } }),
      db.landingPage.count({ where: { deletedAt: null, isPublished: true } }),
      db.banner.count({ where: { deletedAt: null } }),
      db.banner.count({ where: { deletedAt: null, isActive: true } }),
      db.city.count({ where: { deletedAt: null } }),
      db.district.count({ where: { deletedAt: null } }),
      db.ward.count({ where: { deletedAt: null } }),
      db.pointOfInterest.count({ where: { deletedAt: null } }),
    ]);
    return ok({
      system: { cities, districts, wards, poi },
      seo: { seoSettings, landingPages, publishedLandingPages },
      content: { banners, activeBanners },
      contact: { writable: false, reason: "No additive settings key-value schema exists yet" },
      mail: { writable: false, reason: "Mail runtime configuration is env-backed" },
      storage: { writable: false, reason: "Storage runtime configuration is env-backed" },
    });
  } catch (error) {
    return fail(error);
  }
}

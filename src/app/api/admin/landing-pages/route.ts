import { db } from "@/lib/db";
import { fail, ok } from "@/server/api/response";
import { createLandingPage, softDeleteLandingPage, updateLandingPage } from "@/server/admin/crud";
import { getPagination, getSearch, paginated, requireAdmin } from "@/server/admin/utils";
import { idSchema } from "@/server/admin/validators";

export async function GET(request: Request) {
  try {
    await requireAdmin(request.headers.get("authorization"), "settings.manage");
    const url = new URL(request.url);
    const { page, pageSize, skip, take } = getPagination(url.searchParams);
    const search = getSearch(url.searchParams);
    const status = url.searchParams.get("status") ?? undefined;
    const where = { deletedAt: null, ...(status === "published" ? { isPublished: true } : status === "draft" ? { isPublished: false } : {}), ...(search ? { OR: [{ title: { contains: search, mode: "insensitive" as const } }, { slug: { contains: search, mode: "insensitive" as const } }, { path: { contains: search, mode: "insensitive" as const } }] } : {}) };
    const [items, total] = await Promise.all([
      db.landingPage.findMany({ where, skip, take, orderBy: { updatedAt: "desc" }, include: { city: true, district: true, poi: true, seoSettings: { where: { deletedAt: null }, take: 1 } } }),
      db.landingPage.count({ where }),
    ]);
    return ok(paginated(items, total, page, pageSize));
  } catch (error) { return fail(error); }
}

export async function POST(request: Request) {
  try { const auth = await requireAdmin(request.headers.get("authorization"), "settings.manage"); const page = await createLandingPage(await request.json(), auth.payload.userId); return ok({ page }, { status: 201 }); } catch (error) { return fail(error); }
}

export async function PATCH(request: Request) {
  try { const auth = await requireAdmin(request.headers.get("authorization"), "settings.manage"); const body = await request.json(); const { id } = idSchema.parse(body); const page = await updateLandingPage(id, body, auth.payload.userId); return ok({ page }); } catch (error) { return fail(error); }
}

export async function DELETE(request: Request) {
  try { const auth = await requireAdmin(request.headers.get("authorization"), "settings.manage"); const { id } = idSchema.parse(await request.json()); const page = await softDeleteLandingPage(id, auth.payload.userId); return ok({ page }); } catch (error) { return fail(error); }
}

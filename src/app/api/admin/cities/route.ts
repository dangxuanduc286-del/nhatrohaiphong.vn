import { db } from "@/lib/db";
import { fail, ok } from "@/server/api/response";
import { createCity, softDeleteCity, updateCity } from "@/server/admin/crud";
import { getPagination, getSearch, paginated, requireAdmin } from "@/server/admin/utils";
import { idSchema } from "@/server/admin/validators";

export async function GET(request: Request) {
  try {
    await requireAdmin(request.headers.get("authorization"), "settings.manage");
    const url = new URL(request.url);
    const { page, pageSize, skip, take } = getPagination(url.searchParams);
    const search = getSearch(url.searchParams);
    const where = { deletedAt: null, ...(search ? { OR: [{ name: { contains: search, mode: "insensitive" as const } }, { slug: { contains: search, mode: "insensitive" as const } }, { code: { contains: search, mode: "insensitive" as const } }] } : {}) };
    const [items, total] = await Promise.all([db.city.findMany({ where, skip, take, orderBy: { name: "asc" }, include: { _count: { select: { districts: true, pointsOfInterest: true } } } }), db.city.count({ where })]);
    return ok(paginated(items, total, page, pageSize));
  } catch (error) { return fail(error); }
}

export async function POST(request: Request) {
  try { const auth = await requireAdmin(request.headers.get("authorization"), "settings.manage"); const city = await createCity(await request.json(), auth.payload.userId); return ok({ city }, { status: 201 }); } catch (error) { return fail(error); }
}

export async function PATCH(request: Request) {
  try { const auth = await requireAdmin(request.headers.get("authorization"), "settings.manage"); const body = await request.json(); const { id } = idSchema.parse(body); const city = await updateCity(id, body, auth.payload.userId); return ok({ city }); } catch (error) { return fail(error); }
}

export async function DELETE(request: Request) {
  try { const auth = await requireAdmin(request.headers.get("authorization"), "settings.manage"); const { id } = idSchema.parse(await request.json()); const city = await softDeleteCity(id, auth.payload.userId); return ok({ city }); } catch (error) { return fail(error); }
}

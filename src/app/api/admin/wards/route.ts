import { db } from "@/lib/db";
import { fail, ok } from "@/server/api/response";
import { createWard, softDeleteWard, updateWard } from "@/server/admin/crud";
import { getPagination, getSearch, paginated, requireAdmin } from "@/server/admin/utils";
import { idSchema } from "@/server/admin/validators";

export async function GET(request: Request) {
  try {
    await requireAdmin(request.headers.get("authorization"), "settings.manage");
    const url = new URL(request.url);
    const { page, pageSize, skip, take } = getPagination(url.searchParams);
    const search = getSearch(url.searchParams);
    const districtId = url.searchParams.get("districtId") ?? undefined;
    const where = { deletedAt: null, ...(districtId ? { districtId } : {}), ...(search ? { OR: [{ name: { contains: search, mode: "insensitive" as const } }, { slug: { contains: search, mode: "insensitive" as const } }] } : {}) };
    const [items, total] = await Promise.all([db.ward.findMany({ where, skip, take, orderBy: { name: "asc" }, include: { district: { include: { city: true } } } }), db.ward.count({ where })]);
    return ok(paginated(items, total, page, pageSize));
  } catch (error) { return fail(error); }
}

export async function POST(request: Request) {
  try { const auth = await requireAdmin(request.headers.get("authorization"), "settings.manage"); const ward = await createWard(await request.json(), auth.payload.userId); return ok({ ward }, { status: 201 }); } catch (error) { return fail(error); }
}

export async function PATCH(request: Request) {
  try { const auth = await requireAdmin(request.headers.get("authorization"), "settings.manage"); const body = await request.json(); const { id } = idSchema.parse(body); const ward = await updateWard(id, body, auth.payload.userId); return ok({ ward }); } catch (error) { return fail(error); }
}

export async function DELETE(request: Request) {
  try { const auth = await requireAdmin(request.headers.get("authorization"), "settings.manage"); const { id } = idSchema.parse(await request.json()); const ward = await softDeleteWard(id, auth.payload.userId); return ok({ ward }); } catch (error) { return fail(error); }
}

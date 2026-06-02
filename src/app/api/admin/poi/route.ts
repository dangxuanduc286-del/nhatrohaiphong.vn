import type { PointOfInterestCategory } from "@/generated/prisma/enums";
import { db } from "@/lib/db";
import { fail, ok } from "@/server/api/response";
import { createPointOfInterest, softDeletePointOfInterest, updatePointOfInterest } from "@/server/admin/crud";
import { getPagination, getSearch, paginated, requireAdmin } from "@/server/admin/utils";
import { idSchema } from "@/server/admin/validators";

export async function GET(request: Request) {
  try {
    await requireAdmin(request.headers.get("authorization"), "settings.manage");
    const url = new URL(request.url);
    const { page, pageSize, skip, take } = getPagination(url.searchParams);
    const search = getSearch(url.searchParams);
    const rawCategory = url.searchParams.get("category") ?? undefined;
    const category = rawCategory && ["INDUSTRIAL_PARK", "PORT", "AIRPORT", "UNIVERSITY", "HOSPITAL", "TRANSPORT", "SHOPPING_MALL", "TOURISM", "RESIDENTIAL_AREA"].includes(rawCategory) ? rawCategory as PointOfInterestCategory : undefined;
    const cityId = url.searchParams.get("cityId") ?? undefined;
    const where = { deletedAt: null, ...(category ? { category } : {}), ...(cityId ? { cityId } : {}), ...(search ? { OR: [{ name: { contains: search, mode: "insensitive" as const } }, { slug: { contains: search, mode: "insensitive" as const } }] } : {}) };
    const [items, total] = await Promise.all([
      db.pointOfInterest.findMany({ where, skip, take, orderBy: { updatedAt: "desc" }, include: { city: true } }),
      db.pointOfInterest.count({ where }),
    ]);
    return ok(paginated(items, total, page, pageSize));
  } catch (error) { return fail(error); }
}

export async function POST(request: Request) {
  try { const auth = await requireAdmin(request.headers.get("authorization"), "settings.manage"); const poi = await createPointOfInterest(await request.json(), auth.payload.userId); return ok({ poi }, { status: 201 }); } catch (error) { return fail(error); }
}

export async function PATCH(request: Request) {
  try { const auth = await requireAdmin(request.headers.get("authorization"), "settings.manage"); const body = await request.json(); const { id } = idSchema.parse(body); const poi = await updatePointOfInterest(id, body, auth.payload.userId); return ok({ poi }); } catch (error) { return fail(error); }
}

export async function DELETE(request: Request) {
  try { const auth = await requireAdmin(request.headers.get("authorization"), "settings.manage"); const { id } = idSchema.parse(await request.json()); const poi = await softDeletePointOfInterest(id, auth.payload.userId); return ok({ poi }); } catch (error) { return fail(error); }
}

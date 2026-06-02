import { db } from "@/lib/db";
import { fail, ok } from "@/server/api/response";
import { assignUserRoles, createAdminRole, softDeleteAdminRole, updateAdminRole } from "@/server/admin/crud";
import { getPagination, getSearch, paginated, requireAdmin } from "@/server/admin/utils";
import { idSchema } from "@/server/admin/validators";

export async function GET(request: Request) {
  try {
    await requireAdmin(request.headers.get("authorization"), "role.manage");
    const url = new URL(request.url);
    const { page, pageSize, skip, take } = getPagination(url.searchParams);
    const search = getSearch(url.searchParams);
    const where = { deletedAt: null, ...(search ? { OR: [{ name: { contains: search, mode: "insensitive" as const } }, { slug: { contains: search, mode: "insensitive" as const } }] } : {}) };
    const [items, total] = await Promise.all([
      db.role.findMany({ where, skip, take, orderBy: { createdAt: "desc" }, include: { permissions: { include: { permission: true } }, users: { include: { user: { select: { id: true, email: true, fullName: true, status: true } } } } } }),
      db.role.count({ where }),
    ]);
    return ok(paginated(items, total, page, pageSize));
  } catch (error) {
    return fail(error);
  }
}

export async function POST(request: Request) {
  try {
    const auth = await requireAdmin(request.headers.get("authorization"), "role.manage");
    const role = await createAdminRole(await request.json(), auth.payload.userId);
    return ok({ role }, { status: 201 });
  } catch (error) {
    return fail(error);
  }
}

export async function PATCH(request: Request) {
  try {
    const auth = await requireAdmin(request.headers.get("authorization"), "role.manage");
    const body = await request.json();
    const { id } = idSchema.parse(body);
    if (body.userId) {
      await assignUserRoles({ id: body.userId, roleIds: [id] }, auth.payload.userId);
      return ok({ id, userId: body.userId });
    }

    const role = await updateAdminRole(id, body, auth.payload.userId);
    return ok({ role });
  } catch (error) {
    return fail(error);
  }
}

export async function DELETE(request: Request) {
  try {
    const auth = await requireAdmin(request.headers.get("authorization"), "role.manage");
    const { id } = idSchema.parse(await request.json());
    const role = await softDeleteAdminRole(id, auth.payload.userId);
    return ok({ role });
  } catch (error) {
    return fail(error);
  }
}

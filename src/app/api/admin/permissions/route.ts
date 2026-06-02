import { db } from "@/lib/db";
import { fail, ok } from "@/server/api/response";
import { assignPermissionRoles } from "@/server/admin/crud";
import { getPagination, getSearch, paginated, requireAdmin } from "@/server/admin/utils";
import { idSchema } from "@/server/admin/validators";

export async function GET(request: Request) {
  try {
    await requireAdmin(request.headers.get("authorization"), "role.manage");
    const url = new URL(request.url);
    const { page, pageSize, skip, take } = getPagination(url.searchParams);
    const search = getSearch(url.searchParams);
    const group = url.searchParams.get("group") ?? undefined;
    const where = { deletedAt: null, ...(group ? { slug: { startsWith: `${group}.` } } : {}), ...(search ? { OR: [{ name: { contains: search, mode: "insensitive" as const } }, { slug: { contains: search, mode: "insensitive" as const } }] } : {}) };
    const [items, total] = await Promise.all([
      db.permission.findMany({ where, skip, take, orderBy: { slug: "asc" }, include: { roles: { include: { role: true } } } }),
      db.permission.count({ where }),
    ]);
    return ok(paginated(items, total, page, pageSize));
  } catch (error) {
    return fail(error);
  }
}

export async function PATCH(request: Request) {
  try {
    const auth = await requireAdmin(request.headers.get("authorization"), "role.manage");
    const body = await request.json();
    const { id } = idSchema.parse(body);
    await assignPermissionRoles(id, body, auth.payload.userId);
    return ok({ id });
  } catch (error) {
    return fail(error);
  }
}

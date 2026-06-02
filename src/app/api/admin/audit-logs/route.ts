import { db } from "@/lib/db";
import { fail, ok } from "@/server/api/response";
import { getPagination, getSearch, paginated, requireAdmin } from "@/server/admin/utils";

export async function GET(request: Request) {
  try {
    await requireAdmin(request.headers.get("authorization"), "audit.view");
    const url = new URL(request.url);
    const { page, pageSize, skip, take } = getPagination(url.searchParams);
    const search = getSearch(url.searchParams);
    const entityType = url.searchParams.get("entityType") ?? undefined;
    const action = url.searchParams.get("action") ?? undefined;
    const where = {
      ...(entityType ? { entityType } : {}),
      ...(action ? { action: { contains: action, mode: "insensitive" as const } } : {}),
      ...(search ? { OR: [{ action: { contains: search, mode: "insensitive" as const } }, { entityType: { contains: search, mode: "insensitive" as const } }, { entityId: { contains: search, mode: "insensitive" as const } }, { ipAddress: { contains: search, mode: "insensitive" as const } }] } : {}),
    };
    const [items, total] = await Promise.all([
      db.auditLog.findMany({ where, skip, take, orderBy: { createdAt: "desc" }, include: { user: { select: { id: true, email: true, fullName: true } } } }),
      db.auditLog.count({ where }),
    ]);
    return ok(paginated(items, total, page, pageSize));
  } catch (error) {
    return fail(error);
  }
}

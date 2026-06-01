import type { UserStatus } from "@/generated/prisma/enums";
import { db } from "@/lib/db";
import { AppError } from "@/lib/errors";
import { fail, ok } from "@/server/api/response";
import { getPagination, getSearch, paginated, requireAdmin } from "@/server/admin/utils";
import { idSchema, userStatusUpdateSchema } from "@/server/admin/validators";

export async function GET(request: Request) {
  try {
    await requireAdmin(request.headers.get("authorization"), "user.manage");
    const url = new URL(request.url);
    const { page, pageSize, skip, take } = getPagination(url.searchParams);
    const search = getSearch(url.searchParams);
    const status = url.searchParams.get("status") ?? undefined;
    const normalizedStatus: UserStatus | undefined = status === "ACTIVE" || status === "INACTIVE" || status === "BANNED" ? status : undefined;
    const where = {
      deletedAt: null,
      ...(normalizedStatus ? { status: normalizedStatus } : {}),
      ...(search ? { OR: [{ email: { contains: search, mode: "insensitive" as const } }, { phone: { contains: search, mode: "insensitive" as const } }, { fullName: { contains: search, mode: "insensitive" as const } }] } : {}),
    };
    const [items, total] = await Promise.all([
      db.user.findMany({ where, skip, take, orderBy: { createdAt: "desc" }, select: { id: true, email: true, phone: true, fullName: true, status: true, lastLoginAt: true, createdAt: true, lockedUntil: true, roles: { include: { role: true } }, sessions: { where: { deletedAt: null }, select: { id: true } } } }),
      db.user.count({ where }),
    ]);
    return ok(paginated(items, total, page, pageSize));
  } catch (error) {
    return fail(error);
  }
}

export async function PATCH(request: Request) {
  try {
    const auth = await requireAdmin(request.headers.get("authorization"), "user.manage");
    const body = userStatusUpdateSchema.parse(await request.json());
    if (body.id === auth.payload.userId && body.status === "BANNED") {
      throw new AppError("Cannot ban your own admin account", 400, "SELF_BAN_BLOCKED");
    }

    const existing = await db.user.findFirst({ where: { id: body.id, deletedAt: null }, select: { id: true, status: true, email: true } });
    if (!existing) {
      throw new AppError("User not found", 404, "USER_NOT_FOUND");
    }

    const user = await db.user.update({ where: { id: body.id }, data: { status: body.status, updatedAt: new Date() }, select: { id: true, email: true, status: true } });
    await db.auditLog.create({ data: { userId: auth.payload.userId, action: "ADMIN_USER_STATUS_UPDATE", entityType: "User", entityId: user.id, oldValues: { status: existing.status }, newValues: { status: body.status } } });
    return ok({ user });
  } catch (error) {
    return fail(error);
  }
}

export async function DELETE(request: Request) {
  try {
    const auth = await requireAdmin(request.headers.get("authorization"), "user.manage");
    const body = idSchema.parse(await request.json());
    if (body.id === auth.payload.userId) {
      throw new AppError("Cannot soft-delete your own admin account", 400, "SELF_DELETE_BLOCKED");
    }

    const existing = await db.user.findFirst({ where: { id: body.id, deletedAt: null }, select: { id: true, email: true, status: true } });
    if (!existing) {
      throw new AppError("User not found", 404, "USER_NOT_FOUND");
    }

    const user = await db.user.update({ where: { id: body.id }, data: { deletedAt: new Date() }, select: { id: true, email: true } });
    await db.auditLog.create({ data: { userId: auth.payload.userId, action: "ADMIN_USER_SOFT_DELETE", entityType: "User", entityId: user.id, oldValues: { status: existing.status, email: existing.email } } });
    return ok({ user });
  } catch (error) {
    return fail(error);
  }
}

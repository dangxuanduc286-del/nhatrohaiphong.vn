import { db } from "@/lib/db";
import { AppError } from "@/lib/errors";
import { fail, ok } from "@/server/api/response";
import { requireAdmin } from "@/server/admin/utils";
import { idSchema, roomModerationSchema } from "@/server/admin/validators";

const nextStatusByAction = {
  APPROVE: "AVAILABLE",
  REJECT: "HIDDEN",
  HIDE: "HIDDEN",
  LOCK: "MAINTENANCE",
} as const;

export async function GET(request: Request) {
  try {
    await requireAdmin(request.headers.get("authorization"), "room.moderate");
    const url = new URL(request.url);
    const id = url.searchParams.get("id");
    const where = id ? idSchema.parse({ id }) : undefined;

    const items = await db.auditLog.findMany({
      where: where ? { entityType: "Room", entityId: where.id } : { entityType: "Room" },
      orderBy: { createdAt: "desc" },
      take: 100,
      include: { user: { select: { fullName: true, email: true } } },
    });

    return ok({ items });
  } catch (error) {
    return fail(error);
  }
}

export async function PATCH(request: Request) {
  try {
    const auth = await requireAdmin(request.headers.get("authorization"), "room.moderate");
    const body = roomModerationSchema.parse(await request.json());
    const existing = await db.room.findFirst({ where: { id: body.id, deletedAt: null }, select: { id: true, status: true, title: true } });

    if (!existing) {
      throw new AppError("Room not found", 404, "ROOM_NOT_FOUND");
    }

    const status = nextStatusByAction[body.action];
    const room = await db.room.update({
      where: { id: existing.id },
      data: { status, updatedBy: auth.payload.userId, updatedAt: new Date() },
      select: { id: true, roomCode: true, title: true, status: true, updatedAt: true },
    });

    await db.auditLog.create({
      data: {
        userId: auth.payload.userId,
        action: `ADMIN_ROOM_${body.action}`,
        entityType: "Room",
        entityId: room.id,
        oldValues: { status: existing.status },
        newValues: { status, reason: body.reason ?? null },
      },
    });

    return ok({ room });
  } catch (error) {
    return fail(error);
  }
}

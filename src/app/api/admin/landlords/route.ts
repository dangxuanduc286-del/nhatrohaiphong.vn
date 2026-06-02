import type { UserStatus } from "@/generated/prisma/enums";
import { db } from "@/lib/db";
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
      roles: { some: { role: { slug: "landlord" } } },
      ...(normalizedStatus ? { status: normalizedStatus } : {}),
      ...(search ? { OR: [{ email: { contains: search, mode: "insensitive" as const } }, { phone: { contains: search, mode: "insensitive" as const } }, { fullName: { contains: search, mode: "insensitive" as const } }] } : {}),
    };
    const [items, total] = await Promise.all([
      db.user.findMany({ where, skip, take, orderBy: { createdAt: "desc" }, select: { id: true, email: true, phone: true, fullName: true, status: true, lockedUntil: true, createdAt: true, properties: { where: { deletedAt: null }, select: { id: true, buildings: { where: { deletedAt: null }, select: { rooms: { where: { deletedAt: null }, select: { id: true, contracts: { where: { deletedAt: null }, select: { id: true } } } } } } } } } }),
      db.user.count({ where }),
    ]);
    const enriched = items.map((item) => ({
      ...item,
      totalProperties: item.properties.length,
      totalRooms: item.properties.reduce((sum, property) => sum + property.buildings.reduce((roomSum, building) => roomSum + building.rooms.length, 0), 0),
      totalContracts: item.properties.reduce((sum, property) => sum + property.buildings.reduce((buildingSum, building) => buildingSum + building.rooms.reduce((roomSum, room) => roomSum + room.contracts.length, 0), 0), 0),
    }));
    return ok(paginated(enriched, total, page, pageSize));
  } catch (error) {
    return fail(error);
  }
}

export async function PATCH(request: Request) {
  try {
    const auth = await requireAdmin(request.headers.get("authorization"), "user.manage");
    const body = userStatusUpdateSchema.parse(await request.json());
    const landlord = await db.user.update({ where: { id: body.id }, data: { status: body.status }, select: { id: true, email: true, status: true } });
    await db.auditLog.create({ data: { userId: auth.payload.userId, action: "ADMIN_LANDLORD_STATUS_UPDATE", entityType: "User", entityId: landlord.id, newValues: { status: body.status } } });
    return ok({ landlord });
  } catch (error) {
    return fail(error);
  }
}

export async function DELETE(request: Request) {
  try {
    const auth = await requireAdmin(request.headers.get("authorization"), "user.manage");
    const body = idSchema.parse(await request.json());
    const landlord = await db.user.update({ where: { id: body.id }, data: { deletedAt: new Date() }, select: { id: true, email: true } });
    await db.auditLog.create({ data: { userId: auth.payload.userId, action: "ADMIN_LANDLORD_SOFT_DELETE", entityType: "User", entityId: landlord.id, oldValues: { email: landlord.email } } });
    return ok({ landlord });
  } catch (error) {
    return fail(error);
  }
}

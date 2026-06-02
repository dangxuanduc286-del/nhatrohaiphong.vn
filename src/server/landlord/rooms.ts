import type { Prisma } from "@/generated/prisma/client";
import { db } from "@/lib/db";
import { AppError } from "@/lib/errors";
import { getAuthFromRefreshToken } from "@/server/auth/service";
import { requirePermissionValue, requireRoleValue } from "@/server/auth/rbac";
import type { LandlordRoomInput } from "@/server/landlord/room-validators";

const LANDLORD_ROLES = ["LANDLORD", "ADMIN", "SUPER_ADMIN"] as const;

export async function requireLandlordApi(refreshToken: string | null, permission = "room.create") {
  if (!refreshToken) {
    throw new AppError("Unauthorized", 401, "UNAUTHORIZED");
  }

  const auth = await getAuthFromRefreshToken(refreshToken);
  requireRoleValue(auth.payload.role, [...LANDLORD_ROLES]);
  await requirePermissionValue(auth.payload.role, permission);
  return auth;
}

function toSlug(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 90);
}

function shortId() {
  return Math.random().toString(36).slice(2, 8);
}

export async function generateUniqueRoomSlug(title: string, tx: Prisma.TransactionClient = db) {
  const baseSlug = toSlug(title) || "phong-tro";
  let slug = baseSlug;
  let index = 1;

  while (await tx.room.findUnique({ where: { slug }, select: { id: true } })) {
    index += 1;
    slug = `${baseSlug}-${index}`;
  }

  return slug;
}

export async function generateUniqueRoomCode(tx: Prisma.TransactionClient = db) {
  let roomCode = `ROOM-${Date.now().toString(36).toUpperCase()}-${shortId().toUpperCase()}`;

  while (await tx.room.findUnique({ where: { roomCode }, select: { id: true } })) {
    roomCode = `ROOM-${Date.now().toString(36).toUpperCase()}-${shortId().toUpperCase()}`;
  }

  return roomCode;
}

export function toRoomData(input: LandlordRoomInput, userId: string) {
  return {
    title: input.title,
    description: input.description ?? null,
    price: input.price,
    deposit: input.deposit,
    area: input.area,
    floor: input.floor,
    capacity: input.capacity,
    electricPrice: input.electricPrice,
    waterPrice: input.waterPrice,
    internetFee: input.internetFee,
    serviceFee: input.serviceFee,
    parkingFee: input.parkingFee,
    address: input.address,
    availableFrom: input.availableFrom,
    latitude: input.latitude,
    longitude: input.longitude,
    updater: { connect: { id: userId } },
    district: { connect: { id: input.districtId } },
    ward: { connect: { id: input.wardId } },
    building: { connect: { id: input.buildingId } },
  } satisfies Prisma.RoomUpdateInput;
}

export async function assertLandlordBuildingAccess(buildingId: string, userId: string) {
  const building = await db.building.findFirst({
    where: {
      id: buildingId,
      deletedAt: null,
      property: {
        deletedAt: null,
        ownerId: userId,
      },
    },
    select: { id: true, districtId: true, wardId: true },
  });

  if (!building) {
    throw new AppError("Building not found", 404, "BUILDING_NOT_FOUND");
  }

  return building;
}

export async function assertLandlordRoomAccess(roomId: string, userId: string) {
  const room = await db.room.findFirst({
    where: { id: roomId, deletedAt: null, createdBy: userId },
    select: { id: true, title: true, slug: true, buildingId: true },
  });

  if (!room) {
    throw new AppError("Room not found", 404, "ROOM_NOT_FOUND");
  }

  return room;
}

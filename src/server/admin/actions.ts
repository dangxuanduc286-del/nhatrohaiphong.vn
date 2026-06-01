"use server";

import { revalidatePath } from "next/cache";

import type { RoomStatus, UserStatus } from "@/generated/prisma/enums";
import { db } from "@/lib/db";
import { AppError } from "@/lib/errors";
import { requireAdminPage } from "@/server/admin/utils";

const roomActionStatus: Record<string, RoomStatus> = {
  APPROVE: "AVAILABLE",
  REJECT: "HIDDEN",
  HIDE: "HIDDEN",
  REOPEN: "AVAILABLE",
  MAINTENANCE: "MAINTENANCE",
  OCCUPIED: "OCCUPIED",
  RESERVED: "RESERVED",
};

export async function moderateRoomAction(formData: FormData) {
  const auth = await requireAdminPage("room.moderate");
  const id = String(formData.get("id") ?? "");
  const action = String(formData.get("action") ?? "");
  const reason = String(formData.get("reason") ?? "").trim();
  const status = roomActionStatus[action];

  if (!id || !status) throw new AppError("Invalid moderation request", 400, "INVALID_ROOM_MODERATION");

  const existing = await db.room.findFirst({ where: { id, deletedAt: null }, select: { id: true, status: true, title: true } });
  if (!existing) throw new AppError("Room not found", 404, "ROOM_NOT_FOUND");

  await db.room.update({ where: { id }, data: { status, updatedBy: auth.payload.userId, updatedAt: new Date() } });
  await db.auditLog.create({
    data: {
      userId: auth.payload.userId,
      action: `ADMIN_ROOM_${action}`,
      entityType: "Room",
      entityId: id,
      oldValues: { status: existing.status, title: existing.title },
      newValues: { status, reason: reason || null },
    },
  });

  revalidatePath("/admin/rooms");
  revalidatePath("/admin/properties");
}

const userActionStatus: Record<string, UserStatus> = {
  LOCK: "BANNED",
  UNLOCK: "ACTIVE",
  RESTORE: "ACTIVE",
};

export async function updateUserAction(formData: FormData) {
  const auth = await requireAdminPage("user.manage");
  const id = String(formData.get("id") ?? "");
  const action = String(formData.get("action") ?? "");
  const status = userActionStatus[action];

  if (!id || !["LOCK", "UNLOCK", "SOFT_DELETE", "RESTORE"].includes(action)) throw new AppError("Invalid user request", 400, "INVALID_USER_ACTION");
  if (id === auth.payload.userId && (action === "LOCK" || action === "SOFT_DELETE")) throw new AppError("Cannot disable your own admin account", 400, "SELF_DISABLE_BLOCKED");

  const existing = await db.user.findFirst({ where: { id }, select: { id: true, status: true, email: true, deletedAt: true } });
  if (!existing) throw new AppError("User not found", 404, "USER_NOT_FOUND");

  const data = action === "SOFT_DELETE" ? { deletedAt: new Date() } : action === "RESTORE" ? { deletedAt: null, status } : { status };
  await db.user.update({ where: { id }, data });
  await db.auditLog.create({
    data: {
      userId: auth.payload.userId,
      action: `ADMIN_USER_${action}`,
      entityType: "User",
      entityId: id,
      oldValues: { status: existing.status, deletedAt: existing.deletedAt, email: existing.email },
      newValues: data,
    },
  });

  revalidatePath("/admin/users");
  revalidatePath("/admin/landlords");
}

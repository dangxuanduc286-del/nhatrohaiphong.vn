"use server";

import { revalidatePath } from "next/cache";

import { db } from "@/lib/db";
import { AppError } from "@/lib/errors";
import { getRefreshCookie } from "@/server/auth/cookies";
import { requireRoleValue } from "@/server/auth/rbac";
import { getAuthFromRefreshToken } from "@/server/auth/service";

function readText(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

export async function createLandlordApprovalRequestAction(formData: FormData) {
  const refreshToken = await getRefreshCookie();
  if (!refreshToken) throw new AppError("Unauthorized", 401, "UNAUTHORIZED");

  const auth = await getAuthFromRefreshToken(refreshToken);
  requireRoleValue(auth.payload.role, ["USER"]);

  const fullName = readText(formData, "fullName");
  const phone = readText(formData, "phone");
  const note = readText(formData, "note");

  if (fullName.length < 2 || fullName.length > 120)
    throw new AppError("Họ tên không hợp lệ", 400, "INVALID_FULL_NAME");
  if (phone.length < 8 || phone.length > 20)
    throw new AppError("Số điện thoại không hợp lệ", 400, "INVALID_PHONE");
  if (note.length > 1000) throw new AppError("Ghi chú quá dài", 400, "INVALID_NOTE");

  const existing = await db.landlordApprovalRequest.findFirst({
    where: { userId: auth.payload.userId, status: "PENDING" },
    select: { id: true },
  });

  if (existing)
    throw new AppError("Bạn đã có yêu cầu đang chờ duyệt", 409, "LANDLORD_REQUEST_PENDING");

  const request = await db.landlordApprovalRequest.create({
    data: {
      userId: auth.payload.userId,
      fullName,
      phone,
      note: note || null,
    },
    select: { id: true },
  });

  await db.auditLog.create({
    data: {
      userId: auth.payload.userId,
      action: "LANDLORD_UPGRADE_REQUEST_CREATE",
      entityType: "LandlordApprovalRequest",
      entityId: request.id,
      newValues: { fullName, phone, note: note || null, status: "PENDING" },
    },
  });

  revalidatePath("/account/upgrade-landlord");
  revalidatePath("/admin/upgrade-requests");
}

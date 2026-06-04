"use server";

import { revalidatePath } from "next/cache";

import { db } from "@/lib/db";
import { getRefreshCookie } from "@/server/auth/cookies";
import { getAuthFromRefreshToken } from "@/server/auth/service";

function normalizeOptional(value: FormDataEntryValue | null) {
  const text = String(value ?? "").trim();
  return text.length ? text : null;
}

export async function updateCurrentUserProfileAction(formData: FormData) {
  const refreshToken = await getRefreshCookie();
  if (!refreshToken) return;

  const auth = await getAuthFromRefreshToken(refreshToken);
  const fullName = String(formData.get("fullName") ?? "").trim();
  const phone = normalizeOptional(formData.get("phone"));
  const avatarUrl = normalizeOptional(formData.get("avatarUrl"));

  if (fullName.length < 2 || fullName.length > 120) return;

  await db.user.update({
    where: { id: auth.payload.userId },
    data: { fullName, phone, avatarUrl },
  });

  revalidatePath("/account/profile");
  revalidatePath("/landlord/profile");
}

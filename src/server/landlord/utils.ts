import { redirect } from "next/navigation";

import { getRefreshCookie } from "@/server/auth/cookies";
import { requirePermissionValue, requireRoleValue } from "@/server/auth/rbac";
import { getAuthFromRefreshToken } from "@/server/auth/service";

const LANDLORD_ROLES = ["LANDLORD", "ADMIN", "SUPER_ADMIN"] as const;

export async function requireLandlordPage(permission = "room.create") {
  const refreshToken = await getRefreshCookie();

  if (!refreshToken) {
    redirect("/login");
  }

  try {
    const auth = await getAuthFromRefreshToken(refreshToken);
    requireRoleValue(auth.payload.role, [...LANDLORD_ROLES]);
    await requirePermissionValue(auth.payload.role, permission);
    return auth;
  } catch {
    redirect("/login");
  }
}

export function formatCurrency(value: { toString(): string } | number) {
  const amount = typeof value === "number" ? value : Number(value.toString());
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND", maximumFractionDigits: 0 }).format(amount);
}

export function formatDate(value: Date | null | undefined) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("vi-VN", { dateStyle: "medium", timeStyle: "short" }).format(value);
}

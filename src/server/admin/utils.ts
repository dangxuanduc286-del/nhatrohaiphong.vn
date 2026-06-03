import { redirect } from "next/navigation";

import { AppError } from "@/lib/errors";
import { getRefreshCookie } from "@/server/auth/cookies";
import { requirePermissionValue, requireRoleValue } from "@/server/auth/rbac";
import { requirePermission, requireRole } from "@/server/auth/server";
import { getAuthFromRefreshToken } from "@/server/auth/service";

const ADMIN_ROLES = ["SUPER_ADMIN", "ADMIN"] as const;
const MODERATOR_ADMIN_PERMISSIONS = ["audit.view", "room.moderate"] as const;

function getAllowedAdminRoles(permission: string) {
  return MODERATOR_ADMIN_PERMISSIONS.includes(permission as (typeof MODERATOR_ADMIN_PERMISSIONS)[number]) ? [...ADMIN_ROLES, "MODERATOR" as const] : [...ADMIN_ROLES];
}

export async function requireAdmin(authorization: string | null, permission = "system.manage") {
  const auth = await requireRole(authorization, getAllowedAdminRoles(permission));
  await requirePermission(authorization, permission);
  return auth;
}

export async function requireAdminPage(permission = "system.manage") {
  const refreshToken = await getRefreshCookie();

  if (!refreshToken) {
    redirect("/login");
  }

  try {
    const auth = await getAuthFromRefreshToken(refreshToken);
    requireRoleValue(auth.payload.role, getAllowedAdminRoles(permission));
    await requirePermissionValue(auth.payload.role, permission);
    return auth;
  } catch {
    redirect("/login");
  }
}

export function getPagination(searchParams: URLSearchParams) {
  const page = Math.max(1, Number(searchParams.get("page") ?? 1));
  const pageSize = Math.min(100, Math.max(1, Number(searchParams.get("pageSize") ?? 20)));
  return { page, pageSize, skip: (page - 1) * pageSize, take: pageSize };
}

export function getSearch(searchParams: URLSearchParams) {
  return searchParams.get("search")?.trim() ?? "";
}

export function assertAdminWritable(id?: string) {
  if (!id) {
    throw new AppError("Resource id is required", 400, "RESOURCE_ID_REQUIRED");
  }
}

export function paginated<T>(items: T[], total: number, page: number, pageSize: number) {
  return { items, total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
}

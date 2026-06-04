import { redirect } from "next/navigation";

import { AppError } from "@/lib/errors";
import { getRefreshCookie } from "@/server/auth/cookies";
import { requirePermissionValue, requireRoleValue } from "@/server/auth/rbac";
import { requireAuth } from "@/server/auth/server";
import { getAuthFromRefreshToken } from "@/server/auth/service";

import {
  ADMIN_ACCESS_ROLES,
  getAllowedAdminRoles,
  roleHasSeededPermission,
  type AdminPermission,
} from "./rbac";

export async function requireAdmin(
  authorization: string | null,
  permission: AdminPermission = "system.manage",
) {
  const auth = await requireAuth(authorization);
  requireRoleValue(auth.payload.role, getAllowedAdminRoles(permission));
  if (!roleHasSeededPermission(auth.payload.role, permission)) {
    throw new AppError("Forbidden", 403, "FORBIDDEN");
  }
  await requirePermissionValue(auth.payload.role, permission);
  return auth;
}

export async function requireAdminAccessPage() {
  const refreshToken = await getRefreshCookie();

  if (!refreshToken) {
    redirect("/login");
  }

  try {
    const auth = await getAuthFromRefreshToken(refreshToken);
    requireRoleValue(auth.payload.role, [...ADMIN_ACCESS_ROLES]);
    return auth;
  } catch {
    redirect("/login");
  }
}

export async function requireAdminPage(permission: AdminPermission = "system.manage") {
  const auth = await requireAdminAccessPage();

  try {
    requireRoleValue(auth.payload.role, getAllowedAdminRoles(permission));
    if (!roleHasSeededPermission(auth.payload.role, permission)) {
      throw new AppError("Forbidden", 403, "FORBIDDEN");
    }
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

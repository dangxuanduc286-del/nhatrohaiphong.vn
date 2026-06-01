import { AppError } from "@/lib/errors";

import { getAuthFromAccessToken } from "./service";
import { requirePermissionValue, requireRoleValue } from "./rbac";
import type { SystemRole } from "./constants";

type AuthContext = Awaited<ReturnType<typeof getAuthFromAccessToken>>;

function extractBearerToken(authorization: string | null) {
  if (!authorization) {
    throw new AppError("Unauthorized", 401, "UNAUTHORIZED");
  }

  const [scheme, token] = authorization.split(" ");
  if (scheme !== "Bearer" || !token) {
    throw new AppError("Unauthorized", 401, "UNAUTHORIZED");
  }

  return token;
}

export async function getAuthFromAuthorizationHeader(authorization: string | null) {
  const token = extractBearerToken(authorization);
  return getAuthFromAccessToken(token);
}

export async function requireAuth(authorization: string | null): Promise<AuthContext> {
  return getAuthFromAuthorizationHeader(authorization);
}

export async function requireRole(authorization: string | null, roles: SystemRole[]): Promise<AuthContext> {
  const auth = await requireAuth(authorization);
  requireRoleValue(auth.payload.role, roles);
  return auth;
}

export async function requirePermission(authorization: string | null, permission: string): Promise<AuthContext> {
  const auth = await requireAuth(authorization);
  await requirePermissionValue(auth.payload.role, permission);
  return auth;
}

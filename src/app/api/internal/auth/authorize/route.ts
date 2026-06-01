import { NextResponse } from "next/server";

import { fail, ok } from "@/server/api/response";
import { requirePermissionValue, requireRoleValue } from "@/server/auth/rbac";
import { getAuthFromAuthorizationHeader } from "@/server/auth/server";
import { SYSTEM_ROLES, type SystemRole } from "@/server/auth/constants";

function isSystemRole(value: unknown): value is SystemRole {
  return typeof value === "string" && SYSTEM_ROLES.includes(value as SystemRole);
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { roles?: unknown; permission?: unknown };
    const roles = Array.isArray(body.roles) ? body.roles.filter(isSystemRole) : [];
    const permission = typeof body.permission === "string" ? body.permission : null;

    if (roles.length === 0) {
      return NextResponse.json({ error: { code: "INVALID_AUTH_RULE", message: "Invalid authorization rule" } }, { status: 400 });
    }

    const auth = await getAuthFromAuthorizationHeader(request.headers.get("authorization"));
    requireRoleValue(auth.payload.role, roles);

    if (permission) {
      await requirePermissionValue(auth.payload.role, permission);
    }

    return ok({
      userId: auth.payload.userId,
      role: auth.payload.role,
      sessionId: auth.payload.sessionId,
    });
  } catch (error) {
    return fail(error);
  }
}

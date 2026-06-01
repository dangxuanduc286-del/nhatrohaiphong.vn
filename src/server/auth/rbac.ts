import { db } from "@/lib/db";
import { AppError } from "@/lib/errors";

import { SYSTEM_ROLES, type SystemRole } from "./constants";

export function assertSystemRole(role: string): asserts role is SystemRole {
  if (!SYSTEM_ROLES.includes(role as SystemRole)) {
    throw new AppError("Invalid role", 400, "INVALID_ROLE");
  }
}

export async function hasPermission(role: SystemRole, permission: string) {
  const record = await db.role.findFirst({
    where: {
      slug: role.toLowerCase(),
      deletedAt: null,
      permissions: {
        some: {
          permission: {
            slug: permission,
            deletedAt: null,
          },
        },
      },
    },
    select: { id: true },
  });

  return Boolean(record);
}

export function requireRoleValue(actual: SystemRole, allowed: SystemRole[]) {
  if (!allowed.includes(actual)) {
    throw new AppError("Forbidden", 403, "FORBIDDEN");
  }
}

export async function requirePermissionValue(role: SystemRole, permission: string) {
  const allowed = await hasPermission(role, permission);
  if (!allowed) {
    throw new AppError("Forbidden", 403, "FORBIDDEN");
  }
}

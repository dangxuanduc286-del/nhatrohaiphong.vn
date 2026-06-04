import { ROLE_PERMISSIONS, type RbacPermission, type SystemRole } from "@/server/auth/constants";

export type AdminPermission = Extract<
  RbacPermission,
  | "system.manage"
  | "user.manage"
  | "role.manage"
  | "permission.manage"
  | "audit.view"
  | "room.moderate"
  | "settings.manage"
  | "analytics.view"
>;

export type AdminRouteRule = {
  prefix: string;
  roles: SystemRole[];
  permission: AdminPermission;
};

export const ADMIN_ACCESS_ROLES = [
  "SUPER_ADMIN",
  "ADMIN",
  "MODERATOR",
] as const satisfies readonly SystemRole[];
export const ADMIN_ROLES = ["SUPER_ADMIN", "ADMIN"] as const satisfies readonly SystemRole[];
export const MODERATOR_ADMIN_PERMISSIONS = [
  "audit.view",
  "room.moderate",
] as const satisfies readonly AdminPermission[];
export const ADMIN_MANAGEMENT_PERMISSIONS = [
  "user.manage",
  "room.moderate",
  "analytics.view",
  "audit.view",
  "settings.manage",
  "system.manage",
] as const satisfies readonly AdminPermission[];
export const SUPER_ADMIN_ONLY_PERMISSIONS = [
  "role.manage",
  "permission.manage",
] as const satisfies readonly AdminPermission[];

export const ADMIN_ROUTE_RULES = [
  { prefix: "/admin/upgrade-requests", roles: ["SUPER_ADMIN", "ADMIN"], permission: "user.manage" },
  {
    prefix: "/admin/points-of-interest",
    roles: ["SUPER_ADMIN", "ADMIN"],
    permission: "settings.manage",
  },
  {
    prefix: "/admin/landing-pages",
    roles: ["SUPER_ADMIN", "ADMIN"],
    permission: "settings.manage",
  },
  {
    prefix: "/admin/audit-logs",
    roles: ["SUPER_ADMIN", "ADMIN", "MODERATOR"],
    permission: "audit.view",
  },
  { prefix: "/admin/permissions", roles: ["SUPER_ADMIN"], permission: "permission.manage" },
  { prefix: "/admin/landlords", roles: ["SUPER_ADMIN", "ADMIN"], permission: "user.manage" },
  {
    prefix: "/admin/properties",
    roles: ["SUPER_ADMIN", "ADMIN", "MODERATOR"],
    permission: "room.moderate",
  },
  { prefix: "/admin/analytics", roles: ["SUPER_ADMIN", "ADMIN"], permission: "analytics.view" },
  { prefix: "/admin/districts", roles: ["SUPER_ADMIN", "ADMIN"], permission: "settings.manage" },
  { prefix: "/admin/settings", roles: ["SUPER_ADMIN", "ADMIN"], permission: "settings.manage" },
  { prefix: "/admin/cities", roles: ["SUPER_ADMIN", "ADMIN"], permission: "settings.manage" },
  {
    prefix: "/admin/rooms",
    roles: ["SUPER_ADMIN", "ADMIN", "MODERATOR"],
    permission: "room.moderate",
  },
  { prefix: "/admin/roles", roles: ["SUPER_ADMIN"], permission: "role.manage" },
  { prefix: "/admin/users", roles: ["SUPER_ADMIN", "ADMIN"], permission: "user.manage" },
  { prefix: "/admin/wards", roles: ["SUPER_ADMIN", "ADMIN"], permission: "settings.manage" },
  { prefix: "/admin", roles: ["SUPER_ADMIN", "ADMIN"], permission: "system.manage" },
] as const satisfies readonly AdminRouteRule[];

export function getAllowedAdminRoles(permission: string): SystemRole[] {
  if (SUPER_ADMIN_ONLY_PERMISSIONS.some((item) => item === permission)) return ["SUPER_ADMIN"];
  if (MODERATOR_ADMIN_PERMISSIONS.some((item) => item === permission))
    return ["SUPER_ADMIN", "ADMIN", "MODERATOR"];
  if (ADMIN_MANAGEMENT_PERMISSIONS.some((item) => item === permission))
    return ["SUPER_ADMIN", "ADMIN"];
  return ["SUPER_ADMIN"];
}

export function roleHasSeededPermission(role: SystemRole, permission: string) {
  return ROLE_PERMISSIONS[role].some((item) => item === permission);
}

export function getAdminRouteRule(pathname: string): AdminRouteRule | null {
  return (
    ADMIN_ROUTE_RULES.find(
      (rule) => pathname === rule.prefix || pathname.startsWith(`${rule.prefix}/`),
    ) ?? null
  );
}

import type { AdminPermission } from "@/server/admin/rbac";

export const adminNavigation = [
  { label: "Dashboard", href: "/admin", permission: "system.manage" },
  { label: "Users", href: "/admin/users", permission: "user.manage" },
  { label: "Landlords", href: "/admin/landlords", permission: "user.manage" },
  { label: "Upgrade Requests", href: "/admin/upgrade-requests", permission: "user.manage" },
  { label: "Rooms", href: "/admin/rooms", permission: "room.moderate" },
  { label: "Analytics", href: "/admin/analytics", permission: "analytics.view" },
  { label: "Audit Logs", href: "/admin/audit-logs", permission: "audit.view" },
  { label: "Settings", href: "/admin/settings", permission: "settings.manage" },
  { label: "Roles", href: "/admin/roles", permission: "role.manage" },
  { label: "Permissions", href: "/admin/permissions", permission: "permission.manage" },
  { label: "Properties", href: "/admin/properties", permission: "room.moderate" },
  { label: "Landing Pages", href: "/admin/landing-pages", permission: "settings.manage" },
  { label: "Points of Interest", href: "/admin/points-of-interest", permission: "settings.manage" },
  { label: "Cities", href: "/admin/cities", permission: "settings.manage" },
  { label: "Districts", href: "/admin/districts", permission: "settings.manage" },
  { label: "Wards", href: "/admin/wards", permission: "settings.manage" },
] as const satisfies readonly { label: string; href: string; permission: AdminPermission }[];

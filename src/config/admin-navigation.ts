export const adminNavigation = [
  { label: "Dashboard", href: "/admin", permission: "system.manage" },
  { label: "Users", href: "/admin/users", permission: "user.manage" },
  { label: "Landlords", href: "/admin/landlords", permission: "user.manage" },
  { label: "Roles", href: "/admin/roles", permission: "role.manage" },
  { label: "Permissions", href: "/admin/permissions", permission: "role.manage" },
  { label: "Audit Logs", href: "/admin/audit-logs", permission: "audit.view" },
  { label: "Landing Pages", href: "/admin/landing-pages", permission: "settings.manage" },
  { label: "Points of Interest", href: "/admin/points-of-interest", permission: "settings.manage" },
  { label: "Cities", href: "/admin/cities", permission: "settings.manage" },
  { label: "Districts", href: "/admin/districts", permission: "settings.manage" },
  { label: "Wards", href: "/admin/wards", permission: "settings.manage" },
  { label: "Settings", href: "/admin/settings", permission: "settings.manage" },
] as const;

export const adminNavigation = [
  { label: "Dashboard", href: "/admin", permission: "system.manage" },
  { label: "Users", href: "/admin/users", permission: "user.manage" },
  { label: "Roles", href: "/admin/roles", permission: "role.manage" },
  { label: "Landlords", href: "/admin/landlords", permission: "user.manage" },
  { label: "Rooms", href: "/admin/rooms", permission: "room.moderate" },
  { label: "Properties", href: "/admin/properties", permission: "room.moderate" },
  { label: "Analytics", href: "/admin/analytics", permission: "analytics.view" },
  { label: "Monetization", href: "/admin/monetization", permission: "system.manage" },
  { label: "Audit Logs", href: "/admin/audit-logs", permission: "audit.view" },
  { label: "Settings", href: "/admin/settings", permission: "settings.manage" },
] as const;

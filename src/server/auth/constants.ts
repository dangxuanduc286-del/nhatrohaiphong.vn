export const ACCESS_TOKEN_TTL_SECONDS = 15 * 60;
export const REFRESH_TOKEN_TTL_DAYS = 30;
export const LOGIN_MAX_ATTEMPTS = 5;
export const ACCOUNT_LOCKOUT_MINUTES = 15;

export const SYSTEM_ROLES = ["USER", "LANDLORD", "ADMIN"] as const;

export type SystemRole = (typeof SYSTEM_ROLES)[number];

export const ROLE_PERMISSIONS: Record<SystemRole, string[]> = {
  USER: ["room.view", "room.favorite", "appointment.create"],
  LANDLORD: [
    "room.view",
    "room.favorite",
    "appointment.create",
    "room.create",
    "room.update",
    "room.delete",
    "tenant.manage",
    "contract.manage",
    "invoice.manage",
  ],
  ADMIN: [
    "room.view",
    "room.favorite",
    "appointment.create",
    "room.create",
    "room.update",
    "room.delete",
    "tenant.manage",
    "contract.manage",
    "invoice.manage",
    "system.manage",
    "user.manage",
    "role.manage",
    "permission.manage",
    "audit.manage",
  ],
};

export const AUTH_COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
};

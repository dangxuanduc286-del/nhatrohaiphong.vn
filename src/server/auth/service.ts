import { addMinutes, addDays } from "./time";
import { db } from "@/lib/db";
import { AppError } from "@/lib/errors";

import { ACCOUNT_LOCKOUT_MINUTES, LOGIN_MAX_ATTEMPTS, type SystemRole } from "./constants";
import { generateOpaqueToken, hashPassword, hashToken, verifyPassword } from "./crypto";
import { signAccessToken, verifyAccessToken } from "./jwt";
import { checkLoginRateLimit } from "./rate-limit";
import { assertSystemRole } from "./rbac";
import { writeAuditLog } from "./audit";
import { sendAuthEmail } from "./email";
import type { LoginInput, RegisterInput } from "./validators";

type RequestMeta = {
  ipAddress?: string | null;
  userAgent?: string | null;
};

const userSelect = {
  id: true,
  email: true,
  phone: true,
  fullName: true,
  status: true,
  passwordHash: true,
  failedLoginCount: true,
  lockedUntil: true,
  emailVerifiedAt: true,
  deletedAt: true,
  roles: {
    include: {
      role: {
        include: {
          permissions: {
            include: {
              permission: true,
            },
          },
        },
      },
    },
  },
} as const;

function primaryRole(user: { roles: Array<{ role: { slug: string } }> }): SystemRole {
  const role = user.roles[0]?.role.slug.toUpperCase() ?? "USER";
  assertSystemRole(role);
  return role;
}

function serializeUser(user: Awaited<ReturnType<typeof getUserByIdForAuth>>) {
  if (!user) {
    return null;
  }

  const role = primaryRole(user);
  const permissions = Array.from(
    new Set(user.roles.flatMap((userRole) => userRole.role.permissions.map((item) => item.permission.slug))),
  );

  return {
    id: user.id,
    email: user.email,
    phone: user.phone,
    fullName: user.fullName,
    status: user.status,
    role,
    permissions,
    emailVerifiedAt: user.emailVerifiedAt,
  };
}

async function getUserByIdForAuth(userId: string) {
  return db.user.findFirst({
    where: { id: userId, deletedAt: null },
    select: userSelect,
  });
}

async function ensureRole(role: SystemRole) {
  return db.role.upsert({
    where: { slug: role.toLowerCase() },
    update: { name: role, deletedAt: null },
    create: { name: role, slug: role.toLowerCase(), description: `${role} system role` },
  });
}

async function createSession(userId: string, role: SystemRole, meta: RequestMeta) {
  const refreshToken = generateOpaqueToken(48);
  const refreshTokenHash = hashToken(refreshToken);
  const expiresAt = addDays(new Date(), 30);

  const session = await db.userSession.create({
    data: {
      userId,
      refreshTokenHash,
      ipAddress: meta.ipAddress,
      userAgent: meta.userAgent,
      expiresAt,
    },
  });

  const accessToken = await signAccessToken({ userId, role, sessionId: session.id });
  return { accessToken, refreshToken, expiresAt, sessionId: session.id };
}

export async function register(input: RegisterInput, meta: RequestMeta) {
  const existing = await db.user.findFirst({
    where: {
      deletedAt: null,
      OR: [{ email: input.email }, { phone: input.phone }],
    },
    select: { id: true, email: true, phone: true },
  });

  if (existing?.email === input.email) {
    throw new AppError("Email already exists", 409, "EMAIL_EXISTS");
  }

  if (existing?.phone === input.phone) {
    throw new AppError("Phone already exists", 409, "PHONE_EXISTS");
  }

  const role = await ensureRole(input.role);
  const passwordHash = await hashPassword(input.password);

  const user = await db.user.create({
    data: {
      email: input.email,
      phone: input.phone,
      fullName: input.fullName,
      passwordHash,
      roles: { create: { roleId: role.id } },
    },
    select: userSelect,
  });

  const verificationToken = generateOpaqueToken(48);
  await db.emailVerificationToken.create({
    data: {
      userId: user.id,
      tokenHash: hashToken(verificationToken),
      expiresAt: addDays(new Date(), 1),
    },
  });

  await sendAuthEmail({ kind: "verify-email", to: user.email, token: verificationToken });
  await writeAuditLog({ userId: user.id, action: "REGISTER", entityType: "User", entityId: user.id, ipAddress: meta.ipAddress, userAgent: meta.userAgent });

  const session = await createSession(user.id, input.role, meta);
  return { user: serializeUser(user), ...session, verificationToken };
}

export async function login(input: LoginInput, meta: RequestMeta) {
  const rateLimitIdentifier = `${meta.ipAddress ?? "unknown"}:${input.email}`;
  const allowed = await checkLoginRateLimit(rateLimitIdentifier);
  if (!allowed) {
    throw new AppError("Too many login attempts", 429, "LOGIN_RATE_LIMITED");
  }

  const user = await db.user.findFirst({ where: { email: input.email, deletedAt: null }, select: userSelect });

  if (!user || !user.passwordHash) {
    throw new AppError("Invalid credentials", 401, "INVALID_CREDENTIALS");
  }

  if (user.status !== "ACTIVE") {
    throw new AppError("Account is not active", 403, "ACCOUNT_INACTIVE");
  }

  if (user.lockedUntil && user.lockedUntil > new Date()) {
    throw new AppError("Account is temporarily locked", 423, "ACCOUNT_LOCKED");
  }

  const valid = await verifyPassword(user.passwordHash, input.password);
  if (!valid) {
    const nextCount = user.failedLoginCount + 1;
    await db.user.update({
      where: { id: user.id },
      data: {
        failedLoginCount: nextCount,
        lockedUntil: nextCount >= LOGIN_MAX_ATTEMPTS ? addMinutes(new Date(), ACCOUNT_LOCKOUT_MINUTES) : null,
      },
    });
    throw new AppError("Invalid credentials", 401, "INVALID_CREDENTIALS");
  }

  await db.user.update({ where: { id: user.id }, data: { failedLoginCount: 0, lockedUntil: null, lastLoginAt: new Date() } });
  await writeAuditLog({ userId: user.id, action: "LOGIN", entityType: "UserSession", ipAddress: meta.ipAddress, userAgent: meta.userAgent });

  const role = primaryRole(user);
  const session = await createSession(user.id, role, meta);
  return { user: serializeUser(user), ...session };
}

export async function getAuthFromRefreshToken(refreshToken: string) {
  const session = await db.userSession.findFirst({
    where: { refreshTokenHash: hashToken(refreshToken), deletedAt: null, expiresAt: { gt: new Date() } },
    include: { user: { select: userSelect } },
  });

  if (!session || session.user.status !== "ACTIVE" || session.user.deletedAt) {
    throw new AppError("Unauthorized", 401, "UNAUTHORIZED");
  }

  const role = primaryRole(session.user);
  return {
    user: serializeUser(session.user),
    payload: { userId: session.userId, role, sessionId: session.id },
  };
}

export async function refresh(refreshToken: string, meta: RequestMeta) {
  const currentHash = hashToken(refreshToken);
  const session = await db.userSession.findFirst({
    where: { refreshTokenHash: currentHash, deletedAt: null, expiresAt: { gt: new Date() } },
    include: { user: { select: userSelect } },
  });

  if (!session) {
    const revokedSession = await db.userSession.findFirst({
      where: { refreshTokenHash: currentHash, deletedAt: { not: null } },
      select: { userId: true, id: true },
    });

    if (revokedSession) {
      const revoked = await db.userSession.updateMany({
        where: { userId: revokedSession.userId, deletedAt: null },
        data: { deletedAt: new Date() },
      });
      await writeAuditLog({
        userId: revokedSession.userId,
        action: "REFRESH_TOKEN_REUSE_DETECTED",
        entityType: "UserSession",
        entityId: revokedSession.id,
        newValues: { revokedSessions: revoked.count },
        ipAddress: meta.ipAddress,
        userAgent: meta.userAgent,
      });
    }

    throw new AppError("Invalid refresh token", 401, "INVALID_REFRESH_TOKEN");
  }

  if (session.user.status !== "ACTIVE" || session.user.deletedAt) {
    throw new AppError("Invalid refresh token", 401, "INVALID_REFRESH_TOKEN");
  }

  const nextRefreshToken = generateOpaqueToken(48);
  const nextHash = hashToken(nextRefreshToken);
  const expiresAt = addDays(new Date(), 30);
  const role = primaryRole(session.user);

  await db.userSession.update({
    where: { id: session.id },
    data: { refreshTokenHash: nextHash, expiresAt, lastActivityAt: new Date(), ipAddress: meta.ipAddress, userAgent: meta.userAgent },
  });

  const accessToken = await signAccessToken({ userId: session.userId, role, sessionId: session.id });
  return { accessToken, refreshToken: nextRefreshToken, expiresAt, user: serializeUser(session.user) };
}

export async function logout(refreshToken: string | null, meta: RequestMeta) {
  if (!refreshToken) {
    return;
  }
  const session = await db.userSession.updateMany({
    where: { refreshTokenHash: hashToken(refreshToken), deletedAt: null },
    data: { deletedAt: new Date() },
  });
  await writeAuditLog({ action: "LOGOUT", entityType: "UserSession", newValues: { revoked: session.count }, ipAddress: meta.ipAddress, userAgent: meta.userAgent });
}

export async function logoutAll(userId: string, meta: RequestMeta) {
  const revoked = await db.userSession.updateMany({
    where: { userId, deletedAt: null },
    data: { deletedAt: new Date() },
  });
  await writeAuditLog({
    userId,
    action: "LOGOUT_ALL",
    entityType: "UserSession",
    newValues: { revoked: revoked.count },
    ipAddress: meta.ipAddress,
    userAgent: meta.userAgent,
  });
  return { revoked: revoked.count };
}

export async function requestPasswordReset(email: string, meta: RequestMeta) {
  const user = await db.user.findFirst({ where: { email, deletedAt: null }, select: { id: true, email: true } });
  if (!user) {
    return { resetToken: null };
  }
  const resetToken = generateOpaqueToken(48);
  await db.passwordResetToken.create({ data: { userId: user.id, tokenHash: hashToken(resetToken), expiresAt: addMinutes(new Date(), 30) } });
  await sendAuthEmail({ kind: "reset-password", to: user.email, token: resetToken });
  await writeAuditLog({ userId: user.id, action: "PASSWORD_RESET_REQUEST", entityType: "PasswordResetToken", ipAddress: meta.ipAddress, userAgent: meta.userAgent });
  return { resetToken };
}

export async function resetPassword(token: string, password: string, meta: RequestMeta) {
  const item = await db.passwordResetToken.findFirst({ where: { tokenHash: hashToken(token), usedAt: null, expiresAt: { gt: new Date() } } });
  if (!item) {
    throw new AppError("Invalid reset token", 400, "INVALID_RESET_TOKEN");
  }
  const passwordHash = await hashPassword(password);
  await db.$transaction([
    db.user.update({ where: { id: item.userId }, data: { passwordHash, failedLoginCount: 0, lockedUntil: null } }),
    db.passwordResetToken.update({ where: { id: item.id }, data: { usedAt: new Date() } }),
    db.userSession.updateMany({ where: { userId: item.userId, deletedAt: null }, data: { deletedAt: new Date() } }),
  ]);
  await writeAuditLog({ userId: item.userId, action: "PASSWORD_RESET", entityType: "User", entityId: item.userId, ipAddress: meta.ipAddress, userAgent: meta.userAgent });
}

export async function verifyEmail(token: string, meta: RequestMeta) {
  const item = await db.emailVerificationToken.findFirst({ where: { tokenHash: hashToken(token), verifiedAt: null, expiresAt: { gt: new Date() } } });
  if (!item) {
    throw new AppError("Invalid verification token", 400, "INVALID_VERIFICATION_TOKEN");
  }
  await db.$transaction([
    db.user.update({ where: { id: item.userId }, data: { emailVerifiedAt: new Date() } }),
    db.emailVerificationToken.update({ where: { id: item.id }, data: { verifiedAt: new Date() } }),
  ]);
  await writeAuditLog({ userId: item.userId, action: "EMAIL_VERIFICATION", entityType: "User", entityId: item.userId, ipAddress: meta.ipAddress, userAgent: meta.userAgent });
}

export async function changePassword(userId: string, currentPassword: string, nextPassword: string, meta: RequestMeta) {
  const user = await db.user.findFirst({ where: { id: userId, deletedAt: null }, select: userSelect });
  if (!user || !user.passwordHash) {
    throw new AppError("Unauthorized", 401, "UNAUTHORIZED");
  }

  const valid = await verifyPassword(user.passwordHash, currentPassword);
  if (!valid) {
    throw new AppError("Invalid current password", 400, "INVALID_CURRENT_PASSWORD");
  }

  await db.user.update({ where: { id: user.id }, data: { passwordHash: await hashPassword(nextPassword) } });
  await writeAuditLog({ userId: user.id, action: "PASSWORD_CHANGE", entityType: "User", entityId: user.id, ipAddress: meta.ipAddress, userAgent: meta.userAgent });
}

export async function getAuthFromAccessToken(accessToken: string) {
  const payload = await verifyAccessToken(accessToken);
  const session = await db.userSession.findFirst({ where: { id: payload.sessionId, userId: payload.userId, deletedAt: null, expiresAt: { gt: new Date() } } });
  if (!session) {
    throw new AppError("Unauthorized", 401, "UNAUTHORIZED");
  }
  const user = await getUserByIdForAuth(payload.userId);
  if (!user || user.status !== "ACTIVE") {
    throw new AppError("Unauthorized", 401, "UNAUTHORIZED");
  }
  return { user: serializeUser(user), payload };
}

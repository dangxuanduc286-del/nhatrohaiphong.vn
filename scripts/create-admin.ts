import "dotenv/config";

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

import { hashPassword, verifyPassword } from "../src/server/auth/crypto";

const BOOTSTRAP_ROLE = process.env.BOOTSTRAP_ROLE === "SUPER_ADMIN" ? "SUPER_ADMIN" : "ADMIN";
const BOOTSTRAP_PHONE = process.env.BOOTSTRAP_PHONE;
const BOOTSTRAP_EMAIL = process.env.BOOTSTRAP_EMAIL;
const BOOTSTRAP_PASSWORD = process.env.BOOTSTRAP_PASSWORD;
const BOOTSTRAP_FULL_NAME = process.env.BOOTSTRAP_FULL_NAME ?? `${BOOTSTRAP_ROLE} Nhatrohaiphong`;

if (!BOOTSTRAP_PHONE && !BOOTSTRAP_EMAIL) {
  throw new Error("BOOTSTRAP_PHONE or BOOTSTRAP_EMAIL is required");
}

if (!BOOTSTRAP_PASSWORD || BOOTSTRAP_PASSWORD.length < 12) {
  throw new Error("BOOTSTRAP_PASSWORD is required and must be at least 12 characters");
}

const BOOTSTRAP_IDENTIFIER_EMAIL = BOOTSTRAP_EMAIL ?? `${BOOTSTRAP_PHONE}@nhatrohaiphong.vn`;
const bootstrapPassword = BOOTSTRAP_PASSWORD;

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const db = new PrismaClient({ adapter });

async function ensureBootstrapRole() {
  const roleSlug = BOOTSTRAP_ROLE.toLowerCase();
  return db.role.upsert({
    where: { slug: roleSlug },
    update: { name: BOOTSTRAP_ROLE, deletedAt: null },
    create: {
      name: BOOTSTRAP_ROLE,
      slug: roleSlug,
      description:
        BOOTSTRAP_ROLE === "SUPER_ADMIN" ? "Super administrator role" : "Administrator role",
    },
  });
}

async function main() {
  const adminRole = await ensureBootstrapRole();
  const passwordHash = await hashPassword(bootstrapPassword);

  const existingUser = await db.user.findFirst({
    where: {
      deletedAt: null,
      OR: [{ phone: BOOTSTRAP_PHONE ?? undefined }, { email: BOOTSTRAP_IDENTIFIER_EMAIL }].filter(
        (item) => Object.values(item)[0],
      ),
    },
    select: {
      id: true,
      email: true,
      phone: true,
      passwordHash: true,
      roles: { include: { role: true } },
    },
  });

  const user = existingUser
    ? await db.user.update({
        where: { id: existingUser.id },
        data: {
          phone: existingUser.phone ?? BOOTSTRAP_PHONE,
          passwordHash,
          status: "ACTIVE",
          deletedAt: null,
          failedLoginCount: 0,
          lockedUntil: null,
        },
        select: { id: true, email: true, phone: true },
      })
    : await db.user.create({
        data: {
          email: BOOTSTRAP_IDENTIFIER_EMAIL,
          phone: BOOTSTRAP_PHONE,
          fullName: BOOTSTRAP_FULL_NAME,
          passwordHash,
          status: "ACTIVE",
          emailVerifiedAt: new Date(),
        },
        select: { id: true, email: true, phone: true },
      });

  await db.userRole.createMany({
    data: [{ userId: user.id, roleId: adminRole.id }],
    skipDuplicates: true,
  });

  const verified = await db.user.findFirstOrThrow({
    where: { id: user.id, deletedAt: null },
    select: {
      id: true,
      email: true,
      phone: true,
      status: true,
      passwordHash: true,
      roles: { include: { role: true } },
    },
  });

  const passwordMatches = verified.passwordHash
    ? await verifyPassword(verified.passwordHash, bootstrapPassword)
    : false;
  const roleSlugs = verified.roles.map((item) => item.role.slug);
  const hasAdminRole = roleSlugs.includes(BOOTSTRAP_ROLE.toLowerCase());

  if (!passwordMatches || !hasAdminRole || verified.status !== "ACTIVE") {
    throw new Error("Admin bootstrap verification failed after upsert");
  }

  console.log(
    JSON.stringify(
      {
        ok: true,
        action: existingUser ? "updated_existing_user" : "created_new_user",
        bootstrapRole: BOOTSTRAP_ROLE,
        user: {
          id: verified.id,
          email: verified.email,
          phone: verified.phone,
          status: verified.status,
          roles: roleSlugs,
        },
        passwordHashVerified: passwordMatches,
      },
      null,
      2,
    ),
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await db.$disconnect();
  });

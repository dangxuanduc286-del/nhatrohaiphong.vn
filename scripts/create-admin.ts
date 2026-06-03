import "dotenv/config";

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

import { hashPassword, verifyPassword } from "../src/server/auth/crypto";

const ADMIN_PHONE = "0564162222";
const ADMIN_PASSWORD = "Duc120897";
const ADMIN_EMAIL = `${ADMIN_PHONE}@nhatrohaiphong.vn`;
const ADMIN_FULL_NAME = "Admin Nhatrohaiphong";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const db = new PrismaClient({ adapter });

async function ensureAdminRole() {
  return db.role.upsert({
    where: { slug: "admin" },
    update: { name: "ADMIN", deletedAt: null },
    create: { name: "ADMIN", slug: "admin", description: "Administrator role" },
  });
}

async function main() {
  const adminRole = await ensureAdminRole();
  const passwordHash = await hashPassword(ADMIN_PASSWORD);

  const existingUser = await db.user.findFirst({
    where: {
      deletedAt: null,
      OR: [{ phone: ADMIN_PHONE }, { email: ADMIN_EMAIL }],
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
          phone: existingUser.phone ?? ADMIN_PHONE,
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
          email: ADMIN_EMAIL,
          phone: ADMIN_PHONE,
          fullName: ADMIN_FULL_NAME,
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

  const passwordMatches = verified.passwordHash ? await verifyPassword(verified.passwordHash, ADMIN_PASSWORD) : false;
  const roleSlugs = verified.roles.map((item) => item.role.slug);
  const hasAdminRole = roleSlugs.includes("admin");

  if (!passwordMatches || !hasAdminRole || verified.status !== "ACTIVE") {
    throw new Error("Admin verification failed after upsert");
  }

  console.log(
    JSON.stringify(
      {
        ok: true,
        action: existingUser ? "updated_existing_user" : "created_new_user",
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

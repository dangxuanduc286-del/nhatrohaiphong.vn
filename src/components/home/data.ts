import { db } from "@/lib/db";
import { getRefreshCookie } from "@/server/auth/cookies";
import { getAuthFromRefreshToken } from "@/server/auth/service";

import type { PostRoomCta } from "./types";

export async function getHomeData() {
  const [landingPages, districts, pois, featuredRooms, metrics] = await Promise.all([
    db.landingPage.findMany({
      where: { deletedAt: null, isPublished: true, city: { slug: "hai-phong" } },
      select: {
        title: true,
        path: true,
        content: true,
        district: {
          select: {
            rooms: {
              where: { deletedAt: null, status: "AVAILABLE" },
              select: { id: true, price: true },
              take: 121,
            },
          },
        },
        poi: { select: { name: true } },
      },
      orderBy: { updatedAt: "desc" },
      take: 6,
    }),
    db.district.findMany({
      where: { deletedAt: null, city: { slug: "hai-phong" } },
      select: {
        name: true,
        slug: true,
        rooms: {
          where: { deletedAt: null, status: "AVAILABLE" },
          select: { id: true, price: true },
          take: 999,
        },
      },
      orderBy: { name: "asc" },
      take: 8,
    }),
    db.pointOfInterest.findMany({
      where: {
        deletedAt: null,
        city: { slug: "hai-phong" },
        category: { in: ["INDUSTRIAL_PARK", "UNIVERSITY", "HOSPITAL"] },
      },
      select: { name: true, slug: true, category: true },
      orderBy: { name: "asc" },
      take: 9,
    }),
    db.room.findMany({
      where: { deletedAt: null, status: "AVAILABLE", district: { city: { slug: "hai-phong" } } },
      select: {
        id: true,
        title: true,
        slug: true,
        price: true,
        area: true,
        address: true,
        createdAt: true,
        district: { select: { name: true } },
        ward: { select: { name: true } },
        images: {
          where: { deletedAt: null },
          orderBy: [{ isPrimary: "desc" }, { sortOrder: "asc" }],
          select: { url: true, altText: true },
          take: 1,
        },
      },
      orderBy: { updatedAt: "desc" },
      take: 8,
    }),
    Promise.all([
      db.room.count({
        where: { deletedAt: null, status: "AVAILABLE", district: { city: { slug: "hai-phong" } } },
      }),
      db.user.count({
        where: {
          deletedAt: null,
          roles: { some: { role: { slug: "landlord", deletedAt: null } } },
        },
      }),
      db.district.count({ where: { deletedAt: null, city: { slug: "hai-phong" } } }),
    ]),
  ]);

  const [roomCount, landlordCount, districtCount] = metrics;

  return { landingPages, districts, pois, featuredRooms, roomCount, landlordCount, districtCount };
}

export type HomeData = Awaited<ReturnType<typeof getHomeData>>;

export async function getViewerRole(): Promise<string> {
  const refreshToken = await getRefreshCookie();
  if (!refreshToken) return "GUEST";

  try {
    const auth = await getAuthFromRefreshToken(refreshToken);
    return auth.payload.role;
  } catch {
    return "GUEST";
  }
}

export function getPostRoomCta(role: string): PostRoomCta {
  if (role === "LANDLORD")
    return { href: "/landlord", label: "Dashboard Chủ trọ", mobileLabel: "Dashboard" };
  if (role === "ADMIN" || role === "SUPER_ADMIN")
    return { href: "/admin", label: "Dashboard Admin", mobileLabel: "Admin" };
  return {
    href: "/account/upgrade-landlord",
    label: "Nâng cấp Chủ trọ",
    mobileLabel: "Đăng phòng",
  };
}

import type { MetadataRoute } from "next";

import { db } from "@/lib/db";
import { absoluteUrl, canonicalPath } from "@/lib/seo";

export const revalidate = 300;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [landingPages, rooms] = await Promise.all([
    db.landingPage.findMany({
      where: { deletedAt: null, isPublished: true },
      select: { path: true, updatedAt: true },
      orderBy: { updatedAt: "desc" },
      take: 5000,
    }),
    db.room.findMany({
      where: { deletedAt: null, status: "AVAILABLE" },
      select: { slug: true, updatedAt: true },
      orderBy: { updatedAt: "desc" },
      take: 10000,
    }),
  ]);

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: absoluteUrl("/"),
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
  ];

  const landingRoutes: MetadataRoute.Sitemap = landingPages.map((page) => ({
    url: absoluteUrl(canonicalPath(page.path)),
    lastModified: page.updatedAt,
    changeFrequency: "daily",
    priority: page.path === "/phong-tro-hai-phong" ? 0.95 : 0.8,
  }));

  const roomRoutes: MetadataRoute.Sitemap = rooms.map((room) => ({
    url: absoluteUrl(`/phong/${room.slug}`),
    lastModified: room.updatedAt,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  const seen = new Set<string>();
  return [...staticRoutes, ...landingRoutes, ...roomRoutes].filter((item) => {
    if (seen.has(item.url)) {
      return false;
    }

    seen.add(item.url);
    return true;
  });
}

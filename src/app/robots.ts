import type { MetadataRoute } from "next";

import { appConfig } from "@/config/app";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/admin/", "/api/admin", "/api/auth", "/api/internal", "/landlord/checkout"],
      },
    ],
    sitemap: `${appConfig.url}/sitemap.xml`,
    host: appConfig.url,
  };
}

import type { MetadataRoute } from "next";

import { appConfig } from "@/config/app";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/admin/", "/api", "/api/"],
      },
    ],
    sitemap: `${appConfig.url}/sitemap.xml`,
    host: appConfig.url,
  };
}

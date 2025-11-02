
import type { MetadataRoute } from "next";

const LOCALES = ["en", "es", "it"] as const;

export default function robots(): MetadataRoute.Robots {
  const base = (process.env.SITEMAP_BASE_URL ?? "").replace(/\/$/, "");
  const sitemaps = [
    `${base}/sitemap.xml`, // sitemap index
    ...LOCALES.map((loc) => `${base}/${loc}/sitemap.xml`) // per-locale
  ];

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/author", "/playground", "/search"]
    },
    sitemap: sitemaps
  };
}

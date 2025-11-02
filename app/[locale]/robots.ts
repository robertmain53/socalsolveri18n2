
import type { MetadataRoute } from "next";
import { isSupportedLocale } from "../../utils/content";

export default function robots({ params }: { params: { locale: string } }): MetadataRoute.Robots {
  const { locale } = params;
  const base = (process.env.SITEMAP_BASE_URL ?? "").replace(/\/$/, "");
  const sitemapUrl = `${base}/${locale}/sitemap.xml`;
  // If locale invalid, still return a conservative robots
  const disallow = ["/admin", "/author", "/playground", "/search"];
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow
    },
    sitemap: [sitemapUrl]
  };
}

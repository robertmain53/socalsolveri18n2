
import type { MetadataRoute } from "next";
import { isSupportedLocale, publishedEntries, type Locale } from "../../utils/content";

export default function sitemap({ params }: { params: { locale: string } }): MetadataRoute.Sitemap {
  const { locale } = params;
  if (!isSupportedLocale(locale)) return [];
  const items = publishedEntries(locale as Locale);

  const base = process.env.SITEMAP_BASE_URL?.replace(/\/$/, "") ?? "";
  const now = new Date().toISOString();

  const urls: MetadataRoute.Sitemap = [
    {
      url: `${base}/${locale}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    },
    {
      url: `${base}/${locale}/calculators`,
      lastModified: now,
      changeFrequency: "daily" as const,
      priority: 0.8,
    },
    ...items.map((it) => ({
      url: `${base}/${locale}/calculators/${it.slug}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.9,
    })),
  ];

  return urls;
}

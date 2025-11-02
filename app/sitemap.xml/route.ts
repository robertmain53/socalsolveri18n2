
import { NextResponse } from "next/server";

const LOCALES = ["en", "es", "it"] as const;
type Locale = typeof LOCALES[number];

export const revalidate = 3600;

export async function GET() {
  const base = (process.env.SITEMAP_BASE_URL ?? "").replace(/\/$/, "");
  const urls = Array.from(LOCALES).map(
    (loc) => `<sitemap><loc>${base}/${loc}/sitemap.xml</loc></sitemap>`
  );
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join("\n")}
</sitemapindex>`;
  return new NextResponse(xml, { headers: { "Content-Type": "application/xml" } });
}

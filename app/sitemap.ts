import type { MetadataRoute } from "next";

import { getCategories, getPublishedCalculators } from "@/lib/content";
import { getSiteUrl } from "@/lib/seo";

export default function sitemap(): MetadataRoute.Sitemap {
  const categories = getCategories();
  const calculators = getPublishedCalculators();
  const fallbackDate = new Date().toISOString();

  const baseEntries = [
    {
      url: getSiteUrl("/"),
      changeFrequency: "daily",
      priority: 1,
      lastModified: fallbackDate
    },
    {
      url: getSiteUrl("/category"),
      changeFrequency: "daily",
      priority: 0.9,
      lastModified: fallbackDate
    }
  ] satisfies MetadataRoute.Sitemap;

  const staticEntries = [
    "/about",
    "/author",
    "/terms",
    "/privacy",
    "/cookies",
    "/search"
  ].map((path) => ({
    url: getSiteUrl(path),
    changeFrequency: "monthly",
    priority: 0.6,
    lastModified: fallbackDate
  })) satisfies MetadataRoute.Sitemap;

  const categoryEntries = categories.map((category) => ({
    url: getSiteUrl(`/category/${category.slug}`),
    changeFrequency: "weekly",
    priority: 0.8,
    lastModified: fallbackDate
  })) satisfies MetadataRoute.Sitemap;

  const calculatorEntries = calculators.map((calculator) => ({
    url: getSiteUrl(calculator.fullPath),
    changeFrequency: "weekly",
    priority: 0.7,
    lastModified: calculator.publishDate ?? fallbackDate
  })) satisfies MetadataRoute.Sitemap;

  return [...baseEntries, ...staticEntries, ...categoryEntries, ...calculatorEntries];
}

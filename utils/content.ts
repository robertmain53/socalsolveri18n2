
import fs from "node:fs";
import path from "node:path";
import { parse } from "csv-parse/sync";
import { z } from "zod";

export const LOCALES = ["en", "es", "it"] as const;
export type Locale = typeof LOCALES[number];

const DATA_DIR = path.join(process.cwd(), "data");

const CalculatorSchema = z.object({
  calcId: z.string().min(1),
  category: z.string().default(""),
  subCategory: z.string().default(""),
});
export type Calculator = z.infer<typeof CalculatorSchema>;

const SlugSchema = z.object({
  calcId: z.string().min(1),
  slug: z.string().min(1),
  title: z.string().min(1).optional(),
});
export type SlugRecord = z.infer<typeof SlugSchema>;

const ScheduleSchema = z.object({
  date: z.string().min(1),
  calcId: z.string().min(1),
  published: z.string().transform((v) => /^true$/i.test(v))
});
export type ScheduleRecord = z.infer<typeof ScheduleSchema>;

function readCsv(filePath: string): any[] {
  if (!fs.existsSync(filePath)) return [];
  const raw = fs.readFileSync(filePath, "utf8");
  const rows = parse(raw, { columns: true, skip_empty_lines: true, trim: true });
  return rows;
}

let calculatorsCache: Calculator[] | null = null;
const slugsCache = new Map<Locale, SlugRecord[]>();
const scheduleCache = new Map<Locale, ScheduleRecord[]>();

export function readCalculators(): Calculator[] {
  if (calculatorsCache) return calculatorsCache;
  const rows = readCsv(path.join(DATA_DIR, "calculators.csv"));
  calculatorsCache = rows.map((r) => CalculatorSchema.parse(r));
  return calculatorsCache;
}

export function readSlugs(locale: Locale): SlugRecord[] {
  if (slugsCache.has(locale)) return slugsCache.get(locale)!;
  const rows = readCsv(path.join(DATA_DIR, `slugs.${locale}.csv`));
  const parsed = rows.map((r) => SlugSchema.parse(r));
  slugsCache.set(locale, parsed);
  return parsed;
}

export function readSchedule(locale: Locale): ScheduleRecord[] {
  if (scheduleCache.has(locale)) return scheduleCache.get(locale)!;
  const rows = readCsv(path.join(DATA_DIR, `schedule.${locale}.csv`));
  const parsed = rows.map((r) => ScheduleSchema.parse(r));
  scheduleCache.set(locale, parsed);
  return parsed;
}

export interface PublishedEntry {
  calcId: string;
  slug: string;
  title: string;
  category: string;
  categorySlug: string;
  subCategory: string;
  path: string;
}

export function resolveCalcIdToSlug(locale: Locale, calcId: string): string | null {
  const entry = publishedEntries(locale).find((it) => it.calcId === calcId);
  return entry?.slug ?? null;
}

export function resolveRouteToCalcId(
  locale: Locale,
  categorySlug: string,
  slug: string
): string | null {
  const normalizedCategory = categorySlug.trim().toLowerCase();
  const normalizedSlug = slug.trim().toLowerCase();
  if (!normalizedSlug) return null;

  const entries = publishedEntries(locale);
  const exact = entries.find(
    (entry) =>
      entry.slug.toLowerCase() === normalizedSlug &&
      entry.categorySlug.toLowerCase() === normalizedCategory
  );
  if (exact) {
    return exact.calcId;
  }

  const fallback = entries.find((entry) => entry.slug.toLowerCase() === normalizedSlug);
  return fallback?.calcId ?? null;
}

export function getTitle(locale: Locale, calcId: string): string | null {
  const s = readSlugs(locale).find((x) => x.calcId === calcId);
  return s?.title ?? null;
}

export function publishedCalcIds(locale: Locale): string[] {
  const sched = readSchedule(locale).filter((r) => r.published);
  sched.sort((a, b) => a.date.localeCompare(b.date));
  return sched.map((r) => r.calcId);
}

export function publishedSlugs(locale: Locale): string[] {
  return publishedEntries(locale).map((entry) => entry.slug);
}

export function getAllStaticParams(): { locale: Locale; category: string; slug: string }[] {
  const params: { locale: Locale; category: string; slug: string }[] = [];
  for (const locale of LOCALES) {
    for (const entry of publishedEntries(locale)) {
      params.push({
        locale,
        category: entry.categorySlug,
        slug: entry.slug
      });
    }
  }
  return params;
}

export function hreflangAlternates(calcId: string) {
  const alt: Record<string, string> = {};
  for (const locale of LOCALES) {
    const isPublished = publishedCalcIds(locale).includes(calcId);
    if (!isPublished) continue;
    const entry = publishedEntries(locale).find((it) => it.calcId === calcId);
    if (!entry) continue;
    alt[locale] = entry.path;
  }
  return alt;
}

export function isSupportedLocale(v: string): v is Locale {
  return (LOCALES as readonly string[]).includes(v);
}

/** Get calculator meta by calcId */
export function getCalculatorById(calcId: string): Calculator | null {
  const all = readCalculators();
  return all.find(c => c.calcId === calcId) ?? null;
}

/** Published entries enriched for a locale */
export function publishedEntries(locale: Locale): PublishedEntry[] {
  const ids = new Set(publishedCalcIds(locale));
  const slugs = readSlugs(locale);
  const calculators = readCalculators();
  const out: PublishedEntry[] = [];
  const calculatorMap = new Map(calculators.map((c) => [c.calcId, c] as const));

  for (const s of slugs) {
    if (!ids.has(s.calcId)) continue;
    const meta = calculatorMap.get(s.calcId);
    const category = meta?.category?.trim() ?? "";
    const categorySlug = category ? toSlug(category) : "general";
    const subCategory = meta?.subCategory?.trim() ?? "";
    out.push({
      calcId: s.calcId,
      slug: s.slug,
      title: s.title ?? s.calcId,
      category,
      categorySlug,
      subCategory,
      path: `/${locale}/${categorySlug}/${s.slug}`
    });
  }
  // Sort by category then title
  out.sort(
    (a, b) =>
      a.category.localeCompare(b.category) || a.title.localeCompare(b.title)
  );
  return out;
}

/** Related calculators: same category/subCategory, excluding self, only published in the locale */
export function getRelatedCalculators(locale: Locale, calcId: string, limit = 6) {
  const meta = getCalculatorById(calcId);
  if (!meta) return [];
  const entries = publishedEntries(locale);
  const sameBucket = entries.filter(
    (e) =>
      e.calcId !== calcId &&
      e.category === meta.category &&
      e.subCategory === meta.subCategory
  );
  // Fallback: if empty, relax to same category
  const pool = sameBucket.length
    ? sameBucket
    : entries.filter(
        (e) => e.calcId !== calcId && e.category === meta.category
      );
  return pool.slice(0, limit);
}

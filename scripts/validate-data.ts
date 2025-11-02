
#!/usr/bin/env tsx
import path from "node:path";
import process from "node:process";
import { parse } from "csv-parse/sync";
import fs from "node:fs";
import { z } from "zod";
const kebabCase = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const LOCALES = ["en", "es", "it"] as const;
type Locale = typeof LOCALES[number];

const CalculatorSchema = z.object({
  calcId: z.string().min(1),
  category: z.string().optional(),
  subCategory: z.string().optional(),
});
type Calculator = z.infer<typeof CalculatorSchema>;

const SlugSchema = z.object({
  calcId: z.string().min(1),
  slug: z.string().min(1),
  title: z.string().optional(),
});
type SlugRecord = z.infer<typeof SlugSchema>;

const ScheduleSchema = z.object({
  date: z.string().min(1),
  calcId: z.string().min(1),
  published: z.string().transform((v) => /^true$/i.test(v)),
});
type ScheduleRecord = z.infer<typeof ScheduleSchema>;

function readCsv(filePath: string): any[] {
  if (!fs.existsSync(filePath)) return [];
  const raw = fs.readFileSync(filePath, "utf8");
  return parse(raw, { columns: true, skip_empty_lines: true, trim: true });
}

function fail(msg: string): never {
  console.error(`\n❌ ${msg}`);
  process.exit(1);
}

function warn(msg: string) {
  console.warn(`\n⚠️  ${msg}`);
}

(async function main() {
  const dataDir = path.join(process.cwd(), "data");

  const calculatorsRaw = readCsv(path.join(dataDir, "calculators.csv"));
  const calculators: Calculator[] = calculatorsRaw.map((r) => CalculatorSchema.parse(r));

  if (calculators.length === 0) fail("Nessun record in calculators.csv");

  const idSet = new Set<string>();
  for (const c of calculators) {
    if (idSet.has(c.calcId)) fail(`calcId duplicato in calculators.csv: ${c.calcId}`);
    idSet.add(c.calcId);
  }

  type PerLocale = { slugs: SlugRecord[]; schedule: ScheduleRecord[] };
  const perLocale = new Map<Locale, PerLocale>();

  for (const locale of LOCALES) {
    const slugsRaw = readCsv(path.join(dataDir, `slugs.${locale}.csv`));
    const scheduleRaw = readCsv(path.join(dataDir, `schedule.${locale}.csv`));
    const slugs: SlugRecord[] = slugsRaw.map((r) => SlugSchema.parse(r));
    // Validate slug format
    for (const s of slugs) { if (!kebabCase.test(s.slug)) fail(`[${locale}] slug non kebab-case: ${s.slug}`);}
    const schedule: ScheduleRecord[] = scheduleRaw.map((r) => ScheduleSchema.parse(r));
    for (const r of schedule) { if (!/^\d{4}-\d{2}-\d{2}$/.test(r.date)) fail(`[${locale}] data non valida (YYYY-MM-DD): ${r.date}`);}

    const slugSet = new Set<string>();
    for (const s of slugs) {
      if (!idSet.has(s.calcId)) fail(`[${locale}] slugs contiene calcId non presente in calculators.csv: ${s.calcId}`);
      if (slugSet.has(s.slug)) fail(`[${locale}] slug duplicato in slugs.${locale}.csv: ${s.slug}`);
      slugSet.add(s.slug);
    }

    const pub = schedule.filter((r) => r.published);
    for (const r of pub) {
      if (!idSet.has(r.calcId)) fail(`[${locale}] schedule contiene calcId inesistente: ${r.calcId}`);
      const hasSlug = slugs.some((s) => s.calcId === r.calcId);
      if (!hasSlug) fail(`[${locale}] calcId in schedule published ma senza slug: ${r.calcId}`);
    }

    perLocale.set(locale, { slugs, schedule });
  }

  console.log("\n✅ CSV coerenti. Riepilogo generazione:");
  for (const locale of LOCALES) {
    const { slugs, schedule } = perLocale.get(locale)!;
    const publishedIds = new Set(schedule.filter((r) => r.published).map((r) => r.calcId));
    const generated = slugs.filter((s) => publishedIds.has(s.calcId));

    console.log(`\n- ${locale}: pubblicati=${generated.length}  (slugs=${slugs.length}, schedule=${schedule.length})`);
    for (const g of generated) {
      console.log(`  • /${locale}/calculators/${g.slug}   (calcId=${g.calcId})`);
    }
  }

  for (const locale of LOCALES) {
    const { slugs, schedule } = perLocale.get(locale)!;
    const idsWithSlug = new Set(slugs.map((s) => s.calcId));
    const scheduledFalse = schedule.filter((r) => !r.published && idsWithSlug.has(r.calcId));
    if (scheduledFalse.length > 0) {
      warn(`[${locale}] ${scheduledFalse.length} calcId hanno slug ma non sono pubblicati (ok se previsto).`);
    }
  }

  process.exit(0);
})().catch((e) => fail(e?.message ?? String(e)));

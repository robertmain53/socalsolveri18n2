import fs from "node:fs";
import path from "node:path";

import {
  type CalculatorComponentType,
  type CalculatorConfig,
  parseCalculatorConfig
} from "./calculator-config";

const DATA_FILE = path.join(process.cwd(), "data", "calc.csv");

export interface CalculatorRecord {
  category: string;
  subcategory: string | null;
  componentType: CalculatorComponentType | null;
  config: CalculatorConfig | null;
  /**
   * Slug of the calculator (last segment).
   */
  slug: string;
  /**
   * Normalized absolute path starting with "/".
   */
  fullPath: string;
  /**
   * Nested path segments, e.g. ["finance", "personal", "feet-to-meters-converter"]
   */
  segments: string[];
  title: string;
  trafficEstimate: number;
  publishDate: string | null;
  isPublished: boolean;
}

export interface CategorySummary {
  slug: string;
  label: string;
  calculators: CalculatorRecord[];
  subcategories: SubcategorySummary[];
  trafficTotal: number;
}

export interface SubcategorySummary {
  slug: string;
  label: string;
  calculators: CalculatorRecord[];
  trafficTotal: number;
}

interface ContentCache {
  calculators: CalculatorRecord[];
  calculatorMap: Map<string, CalculatorRecord>;
  categories: Map<string, CategorySummary>;
  publishSchedule: PublishScheduleItem[];
}

let cache: ContentCache | null = null;

function ensureCache(): ContentCache {
  if (cache) {
    return cache;
  }

  const file = fs.readFileSync(DATA_FILE, "utf-8");
  const rows = parseCsv(file);

  if (rows.length === 0) {
    throw new Error(`Content file ${DATA_FILE} has no rows`);
  }

  const header = rows[0];
  const dataRows = rows.slice(1);

  const calculatorMap = new Map<string, CalculatorRecord>();
  const schedule: PublishScheduleItem[] = [];
  const todayIso = new Date().toISOString().split("T")[0];

  for (const [index, columns] of dataRows.entries()) {
    const row = rowToRecord(header, columns);

    if (!row.slug) {
      throw new Error(`Missing slug at row ${index + 2}`);
    }

    const fullPath = normalizePath(row.slug);
    const segments = fullPath
      .split("/")
      .filter(Boolean);
    const categoryLabel = row.category?.trim() || "uncategorized";
    const subcategoryLabel = row.subcategory?.trim() || null;
    const title = row.title.trim();
    const trafficEstimate = Number.parseInt(row.traffic_estimate ?? "0", 10);
    const publishDate = normalizeDate(row.New_Publish_Date);
    const isPublished = !publishDate || publishDate <= todayIso;
    const componentTypeRaw = Object.prototype.hasOwnProperty.call(row, "component_type")
      ? row.component_type
      : undefined;
    const configRaw = Object.prototype.hasOwnProperty.call(row, "config_json")
      ? row.config_json
      : undefined;
    const componentType = normalizeComponentType(componentTypeRaw);
    const config = parseRowConfig(configRaw, fullPath);
    const resolvedComponentType =
      componentType ?? inferComponentTypeFromConfig(config) ?? null;

    if (publishDate) {
      schedule.push({
        path: fullPath,
        title,
        publishDate
      });
    }

    if (!calculatorMap.has(fullPath)) {
      calculatorMap.set(fullPath, {
        category: categoryLabel,
        subcategory: subcategoryLabel,
        slug: segments[segments.length - 1] ?? "",
        fullPath,
        segments,
        title,
        componentType: resolvedComponentType,
        config,
        trafficEstimate,
        publishDate,
        isPublished
      });
      continue;
    }

    const existing = calculatorMap.get(fullPath)!;
    existing.trafficEstimate = Math.max(existing.trafficEstimate, trafficEstimate);

    if (publishDate && (!existing.publishDate || publishDate < existing.publishDate)) {
      existing.publishDate = publishDate;
    }

    existing.isPublished = !existing.publishDate || existing.publishDate <= todayIso;

    if (!existing.componentType && resolvedComponentType) {
      existing.componentType = resolvedComponentType;
    }

    if (!existing.config && config) {
      existing.config = config;
    }
  }

  const calculators = Array.from(calculatorMap.values()).sort((a, b) => {
    if (a.category === b.category) {
      return a.title.localeCompare(b.title);
    }
    return a.category.localeCompare(b.category);
  });

  const categoryMap = new Map<string, CategorySummary>();

  for (const calculator of calculators) {
    if (!calculator.isPublished) {
      continue;
    }

    const categoryKey = calculator.category;
    const categorySlug = toSlug(categoryKey);

    if (!categoryMap.has(categoryKey)) {
      categoryMap.set(categoryKey, {
        slug: categorySlug,
        label: categoryKey,
        calculators: [],
        subcategories: [],
        trafficTotal: 0
      });
    }

    const category = categoryMap.get(categoryKey)!;
    category.calculators.push(calculator);
    category.trafficTotal += calculator.trafficEstimate;

    if (calculator.subcategory) {
      let subcategory = category.subcategories.find(
        (item) => item.label === calculator.subcategory
      );

      if (!subcategory) {
        subcategory = {
          slug: toSlug(calculator.subcategory),
          label: calculator.subcategory,
          calculators: [],
          trafficTotal: 0
        };
        category.subcategories.push(subcategory);
      }

      subcategory.calculators.push(calculator);
      subcategory.trafficTotal += calculator.trafficEstimate;
    }
  }

  categoryMap.forEach((category) => {
    category.subcategories.sort((a, b) => b.trafficTotal - a.trafficTotal);
    category.calculators.sort((a, b) => b.trafficEstimate - a.trafficEstimate);
  });

  cache = {
    calculators,
    calculatorMap,
    categories: categoryMap,
    publishSchedule: schedule
  };

  return cache;
}

type CsvRow = Record<string, string>;

function rowToRecord(header: string[], values: string[]): CsvRow {
  return header.reduce<CsvRow>((acc, key, index) => {
    acc[key] = values[index] ?? "";
    return acc;
  }, {});
}

function normalizePath(slug: string) {
  const trimmed = slug.trim();
  if (!trimmed) {
    throw new Error("Slug cannot be empty");
  }

  const normalized = trimmed.replace(/\/+/g, "/");
  const withLeading = normalized.startsWith("/") ? normalized : `/${normalized}`;
  if (withLeading.length > 1) {
    return withLeading.replace(/\/+$/g, "");
  }
  return withLeading;
}

function normalizeDate(value: string | undefined): string | null {
  if (!value) {
    return null;
  }

  const normalized = value.trim();
  if (!normalized) {
    return null;
  }

  const [month, day, year] = normalized.split(/[/-]/).map((part) => Number.parseInt(part, 10));
  if (Number.isNaN(month) || Number.isNaN(day) || Number.isNaN(year)) {
    return null;
  }

  const iso = new Date(Date.UTC(year, month - 1, day)).toISOString();
  return iso.split("T")[0] ?? null;
}

function normalizeComponentType(input: string | undefined): CalculatorComponentType | null {
  if (!input) {
    return null;
  }

  const normalized = input.trim().toLowerCase();
  if (!normalized) {
    return null;
  }

  if (normalized === "converter" || normalized === "conversion") {
    return "converter";
  }

  if (normalized === "simple_calc" || normalized === "simple") {
    return "simple_calc";
  }

  if (normalized === "advanced_calc" || normalized === "advanced") {
    return "advanced_calc";
  }

  throw new Error(`Unsupported component_type value "${input}"`);
}

function parseRowConfig(raw: string | undefined, context: string): CalculatorConfig | null {
  const trimmed = raw?.trim();

  if (trimmed) {
    try {
      return parseCalculatorConfig(trimmed, `config_json for ${context}`);
    } catch (error) {
      throw new Error(`Invalid config_json for ${context}: ${(error as Error).message}`);
    }
  }

  const relativePath = context.replace(/^\/+/, "").replace(/\/+$/, "");
  if (!relativePath) {
    return null;
  }

  const configRoot = path.join(process.cwd(), "data", "configs");
  const nestedFile = path.join(configRoot, `${relativePath}.json`);
  const leafFile = path.join(
    configRoot,
    `${relativePath.split("/").filter(Boolean).pop() ?? relativePath}.json`
  );

  const filePath = fs.existsSync(nestedFile)
    ? nestedFile
    : fs.existsSync(leafFile)
      ? leafFile
      : null;

  if (!filePath) {
    return null;
  }

  const fileContent = fs.readFileSync(filePath, "utf-8");
  return parseCalculatorConfig(fileContent, `config file ${relativePath}`);
}

function inferComponentTypeFromConfig(
  config: CalculatorConfig | null
): CalculatorComponentType | null {
  if (!config || !config.logic) {
    return null;
  }

  if (config.logic.type === "conversion") {
    return "converter";
  }

  if (config.logic.type === "formula") {
    return "simple_calc";
  }

  if (config.logic.type === "advanced") {
    return "advanced_calc";
  }

  return null;
}

export function toSlug(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

function parseCsv(content: string): string[][] {
  const lines: string[][] = [];
  let current: string[] = [];
  let cell = "";
  let insideQuotes = false;

  const pushCell = () => {
    current.push(cell);
    cell = "";
  };

  const pushRow = () => {
    pushCell();
    lines.push(current);
    current = [];
  };

  for (let i = 0; i < content.length; i++) {
    const char = content[i];
    const next = content[i + 1];

    if (char === "\"") {
      if (insideQuotes && next === "\"") {
        cell += "\"";
        i++;
      } else {
        insideQuotes = !insideQuotes;
      }
    } else if (char === "," && !insideQuotes) {
      pushCell();
    } else if ((char === "\n" || char === "\r") && !insideQuotes) {
      if (char === "\r" && next === "\n") {
        i++;
      }

      pushRow();
    } else {
      cell += char;
    }
  }

  if (cell !== "" || current.length > 0) {
    pushRow();
  }

  return lines.filter((row) => row.length > 0);
}

export function getAllCalculators(): CalculatorRecord[] {
  return ensureCache().calculators;
}

export function getPublishedCalculators(): CalculatorRecord[] {
  return getAllCalculators().filter((calculator) => calculator.isPublished);
}

export function getCalculatorByPath(pathname: string): CalculatorRecord | undefined {
  const normalized = normalizePath(pathname);
  return ensureCache().calculatorMap.get(normalized);
}

export function getCalculatorPaths(): string[] {
  return getPublishedCalculators().map((calculator) => calculator.fullPath);
}

export function getCategories(): CategorySummary[] {
  return Array.from(ensureCache().categories.values()).sort(
    (a, b) => b.trafficTotal - a.trafficTotal
  );
}

export function getCategoryBySlug(slug: string): CategorySummary | undefined {
  const categories = ensureCache().categories;
  for (const category of categories.values()) {
    if (category.slug === slug) {
      return category;
    }
  }
  return undefined;
}

export function invalidateCache() {
  cache = null;
}

export function getSubcategoryBySlug(
  categorySlug: string,
  subcategorySlug: string
): { category: CategorySummary; subcategory: SubcategorySummary } | undefined {
  const category = getCategoryBySlug(categorySlug);
  if (!category) {
    return undefined;
  }

  const subcategory = category.subcategories.find((item) => item.slug === subcategorySlug);
  if (!subcategory) {
    return undefined;
  }

  return { category, subcategory };
}

export function getTopCalculators(limit = 12): CalculatorRecord[] {
  return getPublishedCalculators()
    .slice()
    .sort((a, b) => b.trafficEstimate - a.trafficEstimate)
    .slice(0, limit);
}

export interface PublishScheduleItem {
  path: string;
  title: string;
  publishDate: string;
}

export function getUpcomingPublishSchedule(): PublishScheduleItem[] {
  const todayIso = new Date().toISOString().split("T")[0];
  const upcomingByPath = new Map<string, PublishScheduleItem>();

  for (const entry of ensureCache().publishSchedule) {
    if (entry.publishDate < todayIso) {
      continue;
    }

    const existing = upcomingByPath.get(entry.path);
    if (!existing || entry.publishDate < existing.publishDate) {
      upcomingByPath.set(entry.path, { ...entry });
    }
  }

  return Array.from(upcomingByPath.values()).sort((a, b) => a.publishDate.localeCompare(b.publishDate));
}

export function searchCalculators(query: string): CalculatorRecord[] {
  const normalized = query.trim().toLowerCase();
  if (!normalized) {
    return [];
  }

  return getPublishedCalculators().filter((calculator) => {
    return (
      calculator.title.toLowerCase().includes(normalized) ||
      calculator.fullPath.toLowerCase().includes(normalized) ||
      calculator.category.toLowerCase().includes(normalized) ||
      (calculator.subcategory?.toLowerCase().includes(normalized) ?? false)
    );
  });
}

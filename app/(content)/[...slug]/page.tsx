import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { ConversionCalculator } from "@/components/conversion-calculator";
import { GenericAdvancedCalculator } from "@/components/generic-advanced-calculator";
import { GenericConverter } from "@/components/generic-converter";
import { GenericSimpleCalculator } from "@/components/generic-simple-calculator";
import type { CalculatorRecord } from "@/lib/content";
import {
  getCalculatorByPath,
  getCalculatorPaths,
  getPublishedCalculators,
  toSlug
} from "@/lib/content";
import {
  parseConversionFromSlug,
  ConversionContext,
  convertValue,
  getUnitById
} from "@/lib/conversions";
import type { ConversionLogicConfig, CalculatorLogicConfig } from "@/lib/calculator-config";
import {
  buildBreadcrumbSchema,
  buildFaqSchema,
  buildWebPageSchema,
  getSiteUrl
} from "@/lib/seo";

interface CalculatorPageProps {
  params: Promise<{
    slug: string[];
  }>;
}

export async function generateStaticParams() {
  return getCalculatorPaths().map((path) => ({
    slug: path.split("/").filter(Boolean)
  }));
}

export async function generateMetadata(
  props: CalculatorPageProps
): Promise<Metadata> {
  const params = await props.params;
  const fullPath = `/${params.slug.join("/")}`;
  const calculator = getCalculatorByPath(fullPath);

  if (!calculator) {
    return {};
  }

  if (!calculator.isPublished) {
    return {
      robots: {
        index: false,
        follow: false
      }
    };
  }

  const conversion = parseConversionFromSlug(calculator.slug);
  const title = calculator.title;
  const description = conversion
    ? `Instantly convert ${conversion.from.label.toLowerCase()} to ${conversion.to.label.toLowerCase()} with precise formulas, worked examples, and expert guidance.`
    : `Authoritative calculator and reference guide for ${title.toLowerCase()}.`;

  return {
    title,
    description,
    alternates: {
      canonical: calculator.fullPath
    },
    openGraph: {
      title,
      description,
      url: calculator.fullPath,
      type: "article"
    }
  };
}

export default async function CalculatorPage(props: CalculatorPageProps) {
  const params = await props.params;
  const fullPath = `/${params.slug.join("/")}`;
  const calculator = getCalculatorByPath(fullPath);

  if (!calculator) {
    notFound();
  }

  if (!calculator.isPublished) {
    notFound();
  }

  const config = calculator.config;
  const componentType = calculator.componentType;
  const conversionLogic = config?.logic ?? null;
  const conversionFromConfig = isConversionLogic(conversionLogic)
    ? buildConversionContextFromLogic(conversionLogic.fromUnitId, conversionLogic.toUnitId)
    : null;
  const conversionFromSlug = parseConversionFromSlug(calculator.slug);
  const conversion = conversionFromConfig ?? conversionFromSlug;
  const related = getRelatedCalculators(calculator.fullPath, calculator.category);
  const pageContent = config?.pageContent ?? null;
  const internalLinks = resolveInternalLinks(config?.links?.internal ?? []);
  const externalLinks = resolveExternalLinks(config?.links?.external ?? []);
  const introductionParagraphs = pageContent?.introduction ?? [];
  const methodologyParagraphs = pageContent?.methodology ?? [];
  const examples = pageContent?.examples ?? [];
  const summaryParagraphs = pageContent?.summary ?? [];
  const citationEntries = pageContent?.citations ?? [];
  const faqEntriesFromConfig = pageContent?.faqs ?? null;
  const pageDescription =
    config?.metadata?.description ??
    introductionParagraphs[0] ??
    (conversion
      ? `Use this converter to move seamlessly between ${conversion.from.label.toLowerCase()} and ${conversion.to.label.toLowerCase()} with instant precision.`
      : `This guide delivers trusted answers, methodology, and expert tips for ${calculator.title.toLowerCase()}.`);
  const categorySlug = calculator.category ? toSlug(calculator.category) : null;
  const subcategorySlug = calculator.subcategory ? toSlug(calculator.subcategory) : null;
  const faqEntries =
    faqEntriesFromConfig && faqEntriesFromConfig.length > 0
      ? faqEntriesFromConfig
      : buildFaq(calculator.title, conversion);
  const advancedCalculatorNode =
    ((componentType === "advanced_calc" || config?.logic?.type === "advanced") && config) ? (
      <GenericAdvancedCalculator config={config} />
    ) : null;
  const converterNode =
    componentType === "converter"
      ? config && config.logic && config.logic.type === "conversion"
        ? <GenericConverter config={config} />
        : conversion
          ? (
              <ConversionCalculator
                fromUnitId={conversion.from.id}
                toUnitId={conversion.to.id}
              />
            )
          : null
      : !componentType && conversion
        ? (
            <ConversionCalculator
              fromUnitId={conversion.from.id}
              toUnitId={conversion.to.id}
            />
          )
        : null;
  const simpleCalculatorNode =
    ((componentType === "simple_calc" || (!componentType && config?.logic?.type === "formula")) &&
      config) ? (
      <GenericSimpleCalculator config={config} />
    ) : null;
  const breadcrumbs = [
    { name: "Home", url: getSiteUrl("/") },
    { name: "Categories", url: getSiteUrl("/category") },
    ...(categorySlug
      ? [
          {
            name: titleCase(calculator.category),
            url: getSiteUrl(`/category/${categorySlug}`)
          }
        ]
      : []),
    ...(calculator.subcategory && categorySlug && subcategorySlug
      ? [
          {
            name: calculator.subcategory,
            url: getSiteUrl(`/category/${categorySlug}/${subcategorySlug}`)
          }
        ]
      : []),
    {
      name: calculator.title,
      url: getSiteUrl(calculator.fullPath)
    }
  ];
  const structuredData: Array<Record<string, unknown>> = [
    buildBreadcrumbSchema(breadcrumbs),
    buildWebPageSchema({
      name: calculator.title,
      description: pageDescription,
      url: getSiteUrl(calculator.fullPath),
      category: calculator.category,
      dateModified: calculator.publishDate
    })
  ];

  if (faqEntries.length > 0) {
    structuredData.push(buildFaqSchema(faqEntries));
  }

  if (config?.schema?.additionalTypes) {
    for (const type of config.schema.additionalTypes) {
      structuredData.push({
        "@context": "https://schema.org",
        "@type": type
      });
    }
  }

  if (conversion) {
    structuredData.push({
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      name: calculator.title,
      applicationCategory: "CalculatorApplication",
      operatingSystem: "Web",
      url: getSiteUrl(calculator.fullPath),
      description: pageDescription,
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "USD"
      }
    });
  }

  return (
    <main className="container grid gap-12 py-16 lg:grid-cols-[minmax(0,1fr)_340px]">
      <article className="space-y-12">
        <header className="space-y-6">
          <nav className="text-sm text-slate-500">
            <ol className="flex flex-wrap items-center gap-2">
              <li>
                <Link href="/" className="hover:text-brand">
                  Home
                </Link>
              </li>
              <li aria-hidden>›</li>
              <li>
                <Link href="/category" className="hover:text-brand">
                  Categories
                </Link>
              </li>
              {categorySlug && (
                <>
                  <li aria-hidden>›</li>
                  <li>
                    <Link href={`/category/${categorySlug}`} className="hover:text-brand">
                      {titleCase(calculator.category)}
                    </Link>
                  </li>
                </>
              )}
              {calculator.subcategory && categorySlug && subcategorySlug && (
                <>
                  <li aria-hidden>›</li>
                  <li>
                    <Link
                      href={`/category/${categorySlug}/${subcategorySlug}`}
                      className="text-slate-700 hover:text-brand"
                    >
                      {calculator.subcategory}
                    </Link>
                  </li>
                </>
              )}
              <li aria-hidden>›</li>
              <li className="text-slate-700">{calculator.title}</li>
            </ol>
          </nav>

          <div className="space-y-4">
            <h1 className="font-serif text-4xl font-semibold text-slate-900 sm:text-5xl">
              {calculator.title}
            </h1>
            {introductionParagraphs.length > 0 ? (
              <div className="space-y-3 text-lg text-slate-600">
                {introductionParagraphs.map((paragraph, index) => (
                  <p key={`intro-${index}`}>{paragraph}</p>
                ))}
              </div>
            ) : (
              <p className="text-lg text-slate-600">{pageDescription}</p>
            )}
            <div className="flex flex-wrap gap-3 text-xs uppercase tracking-wide text-slate-400">
              {calculator.publishDate && (
                <span>Updated {humanizeDate(calculator.publishDate)}</span>
              )}
              <span>{calculator.trafficEstimate.toLocaleString()} projected daily visits</span>
            </div>
          </div>
        </header>

        {advancedCalculatorNode}
        {converterNode}
        {simpleCalculatorNode}

        {methodologyParagraphs.length > 0 ? (
          <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200">
            <h2 className="font-serif text-2xl font-semibold text-slate-900">Methodology</h2>
            <div className="space-y-3 text-base text-slate-600">
              {methodologyParagraphs.map((paragraph, index) => (
                <p key={`method-${index}`}>{paragraph}</p>
              ))}
            </div>
          </section>
        ) : (
          <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200">
            <h2 className="font-serif text-2xl font-semibold text-slate-900">
              How to use this {conversion ? conversion.from.label : "calculator"}
              {conversion ? " converter" : ""}
            </h2>
            <ol className="space-y-3 text-base text-slate-600">
              {conversion ? (
                <>
                  <li>
                    1. Enter the value you want to convert in the first input field. You can type
                    decimals or whole numbers.
                  </li>
                  <li>
                    2. The result updates instantly with our high-precision formulas, rounding to
                    sensible decimal places for practical use.
                  </li>
                  <li>
                    3. Use the swap button to reverse the calculation and move from{" "}
                    {conversion.to.label.toLowerCase()} back to{" "}
                    {conversion.from.label.toLowerCase()}.
                  </li>
                </>
              ) : (
                <>
                  <li>
                    1. Enter your latest business assumptions in the inputs above. Every field is
                    validated to keep projections realistic.
                  </li>
                  <li>
                    2. Results refresh instantly so you can compare profitability, efficiency, and
                    payback metrics across calculation methods.
                  </li>
                  <li>
                    3. Review the methodology and worked examples below to confirm how each formula
                    maps to your operating model.
                  </li>
                </>
              )}
            </ol>
          </section>
        )}

        {examples.length > 0 && (
          <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200">
            <h2 className="font-serif text-2xl font-semibold text-slate-900">Worked examples</h2>
            <div className="space-y-3 text-base text-slate-600">
              {examples.map((paragraph, index) => (
                <p key={`example-${index}`}>{paragraph}</p>
              ))}
            </div>
          </section>
        )}

        {summaryParagraphs.length > 0 && (
          <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200">
            <h2 className="font-serif text-2xl font-semibold text-slate-900">Key takeaways</h2>
            <div className="space-y-3 text-base text-slate-600">
              {summaryParagraphs.map((paragraph, index) => (
                <p key={`summary-${index}`}>{paragraph}</p>
              ))}
            </div>
          </section>
        )}

        {(internalLinks.length > 0 || externalLinks.length > 0) && (
          <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200">
            <h2 className="font-serif text-2xl font-semibold text-slate-900">Further resources</h2>
            <div className="space-y-6 text-base text-slate-600">
              {internalLinks.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                    Related calculators
                  </h3>
                  <ul className="mt-3 space-y-2">
                    {internalLinks.map((item) => (
                      <li key={item.fullPath}>
                        <Link href={item.fullPath} className="hover:text-brand">
                          {item.title}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {externalLinks.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                    External guidance
                  </h3>
                  <ul className="mt-3 space-y-2">
                    {externalLinks.map((item) => (
                      <li key={item.url}>
                        <a
                          href={item.url}
                          target="_blank"
                          rel={[..."noopener noreferrer".split(" "), ...(item.rel ?? [])]
                            .filter(Boolean)
                            .join(" ")}
                          className="hover:text-brand"
                        >
                          {item.label ?? item.url}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </section>
        )}

        {conversion && (
          <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200">
            <h2 className="font-serif text-2xl font-semibold text-slate-900">
              Conversion formula explained
            </h2>
            <p className="text-base text-slate-600">
              To convert {conversion.from.label.toLowerCase()} to {conversion.to.label.toLowerCase()},
              multiply the input value by the precise conversion factor derived from
              international measurement standards. The formula looks like this:
            </p>
            <pre className="overflow-x-auto rounded-xl bg-slate-900 p-4 text-sm text-slate-200">
{formatFormula(conversion)}
            </pre>
            <p className="text-base text-slate-600">
              We compute the factor using the SI base unit as the truth source
              to guarantee accuracy even across chained conversions (e.g., meters →
              feet → inches).
            </p>
          </section>
        )}

        <section className="space-y-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200">
          <h2 className="font-serif text-2xl font-semibold text-slate-900">
            Expert Q&A
          </h2>
          <div className="space-y-6 text-base text-slate-600">
            {faqEntries.map((faq) => (
              <div key={faq.question}>
                <h3 className="font-semibold text-slate-800">{faq.question}</h3>
                <p className="mt-2 text-slate-600">{faq.answer}</p>
              </div>
            ))}
          </div>
        </section>

        {citationEntries.length > 0 && (
          <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200">
            <h2 className="font-serif text-2xl font-semibold text-slate-900">
              Sources & citations
            </h2>
            <ul className="space-y-3 text-sm text-slate-600">
              {citationEntries.map((citation, index) => (
                <li key={citation.url ?? index}>
                  <span className="font-medium text-slate-800">
                    {citation.label ?? citation.text ?? citation.url}
                  </span>
                  {citation.url && (
                    <>
                      {" "}
                      —{" "}
                      <a
                        href={citation.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-brand"
                      >
                        {citation.url}
                      </a>
                    </>
                  )}
                  {citation.text && (
                    <p className="text-xs text-slate-500">{citation.text}</p>
                  )}
                </li>
              ))}
            </ul>
          </section>
        )}
      </article>

      <aside className="space-y-8">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200">
          <h2 className="text-base font-semibold text-slate-800">
            Related experiences
          </h2>
          <ul className="mt-4 space-y-3 text-sm text-slate-600">
            {related.map((item) => (
              <li key={item.fullPath}>
                <Link href={item.fullPath} className="hover:text-brand">
                  {item.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-slate-900 p-6 text-slate-100 shadow-sm shadow-slate-800">
          <p className="text-sm uppercase tracking-wide text-sky-300">
            Authority signal
          </p>
          <p className="mt-3 text-base">
            This experience belongs to the {calculator.category.toLowerCase()} cluster.
            It is maintained with versioned methodologies, standards references, and
            scheduled technical reviews so your team can trust the output.
          </p>
        </div>
      </aside>
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
    </main>
  );
}

function getRelatedCalculators(currentPath: string, category: string) {
  return getPublishedCalculators()
    .filter((item) => item.fullPath !== currentPath && item.category === category)
    .slice(0, 6);
}

function resolveInternalLinks(paths: string[]): CalculatorRecord[] {
  const results: CalculatorRecord[] = [];
  const seen = new Set<string>();

  for (const rawPath of paths) {
    if (typeof rawPath !== "string") {
      continue;
    }
    const normalized = normalizeInternalPath(rawPath);
    if (!normalized || seen.has(normalized)) {
      continue;
    }
    const calculator = getCalculatorByPath(normalized);
    if (calculator && calculator.isPublished) {
      results.push(calculator);
      seen.add(normalized);
    }
  }

  return results;
}

function normalizeInternalPath(path: string) {
  const trimmed = path.trim();
  if (!trimmed) {
    return null;
  }
  const withLeading = trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
  return withLeading.replace(/\/+/g, "/").replace(/\/+$/g, "") || null;
}

interface ExternalLink {
  url: string;
  label?: string;
  rel?: string[];
}

function resolveExternalLinks(entries: unknown): ExternalLink[] {
  if (!Array.isArray(entries)) {
    return [];
  }

  const seen = new Set<string>();
  const links: ExternalLink[] = [];

  entries.forEach((entry) => {
    if (!entry || typeof entry !== "object") {
      return;
    }
    const url = "url" in entry && typeof entry.url === "string" ? entry.url.trim() : "";
    if (!url || seen.has(url)) {
      return;
    }
    const label =
      "label" in entry && typeof entry.label === "string" ? entry.label.trim() : undefined;
    const rel =
      "rel" in entry && Array.isArray(entry.rel)
        ? entry.rel.filter(
            (token: unknown): token is string =>
              typeof token === "string" && token.trim() !== ""
          )
        : undefined;

    links.push({
      url,
      label,
      rel
    });
    seen.add(url);
  });

  return links;
}

function titleCase(value: string) {
  return value
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function humanizeDate(value: string) {
  return new Date(value).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric"
  });
}

function isConversionLogic(
  logic: CalculatorLogicConfig | null | undefined
): logic is ConversionLogicConfig {
  return Boolean(logic && logic.type === "conversion" && "fromUnitId" in logic && "toUnitId" in logic);
}

function buildConversionContextFromLogic(
  fromUnitId: string,
  toUnitId: string
): ConversionContext | null {
  const fromUnit = getUnitById(fromUnitId);
  const toUnit = getUnitById(toUnitId);

  if (!fromUnit || !toUnit) {
    return null;
  }

  if (fromUnit.kind !== toUnit.kind) {
    return null;
  }

  return {
    from: fromUnit,
    to: toUnit,
    kind: fromUnit.kind
  };
}

function buildFaq(
  title: string,
  conversion: ConversionContext | null
): { question: string; answer: string }[] {
  if (!conversion) {
    return [
      {
        question: `What does the ${title} help me accomplish?`,
        answer:
          "This calculator distills the key formula and process so you can solve the problem faster than manual math or spreadsheet templates."
      },
      {
        question: "How should I cite or reference the result?",
        answer:
          "Quantus calculators follow industry-standard formulas and document the methodology so you can confidently cite results in reports and client deliverables."
      },
      {
        question: "How often is this experience updated?",
        answer:
          "We refresh each experience quarterly—more frequently when underlying standards change—to keep pace with search intent and algorithm updates."
      }
    ];
  }

  return [
    {
      question: `What is the exact formula for ${conversion.from.label.toLowerCase()} to ${conversion.to.label.toLowerCase()}?`,
      answer: generateFormulaExplanation(conversion)
    },
    {
      question: `Can I convert ${conversion.to.label.toLowerCase()} back to ${conversion.from.label.toLowerCase()}?`,
      answer: buildReverseFormulaExplanation(conversion)
    },
    {
      question: "How accurate is this converter?",
      answer:
        "We anchor every conversion to internationally recognized base units. The calculator rounds to sensible decimals for readability, but core math runs at double precision."
    }
  ];
}

function deriveLinearCoefficients(context: ConversionContext) {
  const forwardZero = convertValue(0, "forward", context);
  const forwardOne = convertValue(1, "forward", context);

  const slope = forwardOne - forwardZero;
  const intercept = forwardZero;

  const normalizedSlope = Math.abs(slope) < 1e-12 ? 0 : slope;
  const normalizedIntercept = Math.abs(intercept) < 1e-9 ? 0 : intercept;

  return { slope: normalizedSlope, intercept: normalizedIntercept };
}

function formatFormula(context: ConversionContext) {
  const { slope, intercept } = deriveLinearCoefficients(context);
  const slopeText = slope.toLocaleString(undefined, { maximumFractionDigits: 8 });

  if (intercept === 0) {
    return `${context.to.symbol} = (${context.from.symbol} × ${slopeText})`;
  }

  const interceptMagnitude = Math.abs(intercept).toLocaleString(undefined, {
    maximumFractionDigits: 8
  });
  const operator = intercept >= 0 ? "+" : "-";

  return `${context.to.symbol} = (${context.from.symbol} × ${slopeText}) ${operator} ${interceptMagnitude}`;
}

function generateFormulaExplanation(context: ConversionContext) {
  const { slope, intercept } = deriveLinearCoefficients(context);
  const slopeText = slope.toLocaleString(undefined, { maximumFractionDigits: 8 });

  if (intercept === 0) {
    return `Multiply your value in ${context.from.label.toLowerCase()} by ${slopeText} to obtain the equivalent in ${context.to.label.toLowerCase()}.`;
  }

  const interceptMagnitude = Math.abs(intercept).toLocaleString(undefined, {
    maximumFractionDigits: 8
  });
  const verb = intercept >= 0 ? "add" : "subtract";

  return `Multiply your ${context.from.label.toLowerCase()} value by ${slopeText}, then ${verb} ${interceptMagnitude} to reach ${context.to.label.toLowerCase()}.`;
}

function buildReverseFormulaExplanation(context: ConversionContext) {
  const { slope, intercept } = deriveLinearCoefficients(context);

  if (intercept === 0) {
    const inverseSlope = (1 / slope).toLocaleString(undefined, { maximumFractionDigits: 8 });
    return `Yes. Hit the swap button in the converter to reverse the calculation or multiply your ${context.to.label.toLowerCase()} value by ${inverseSlope} to switch back.`;
  }

  const slopeText = slope.toLocaleString(undefined, { maximumFractionDigits: 8 });
  const interceptMagnitude = Math.abs(intercept).toLocaleString(undefined, {
    maximumFractionDigits: 8
  });
  const verb = intercept >= 0 ? "subtract" : "add";
  return `Yes. Swap the converter direction or ${verb} ${interceptMagnitude} from your ${context.to.label.toLowerCase()} value, then divide the result by ${slopeText}.`;
}

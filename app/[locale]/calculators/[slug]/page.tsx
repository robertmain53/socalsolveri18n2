import Breadcrumb from "@/components/Breadcrumb";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  getAllStaticParams,
  getRelatedCalculators,
  getTitle,
  hreflangAlternates,
  isSupportedLocale,
  resolveSlugToCalcId,
  type Locale
} from "@/utils/content";

export const dynamicParams = false;

export async function generateStaticParams() {
  return getAllStaticParams();
}

type PageProps = { params: { locale: string; slug: string } };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale, slug } = params;
  if (!isSupportedLocale(locale)) return {};

  const typedLocale = locale as Locale;
  const calcId = resolveSlugToCalcId(typedLocale, slug);
  if (!calcId) return {};

  const title = getTitle(typedLocale, calcId) ?? calcId;
  const alternates = hreflangAlternates(calcId);

  return {
    title,
    alternates: { languages: alternates }
  };
}

export default async function CalculatorPage({ params }: PageProps) {
  const { locale, slug } = params;
  if (!isSupportedLocale(locale)) return notFound();

  const typedLocale = locale as Locale;
  const calcId = resolveSlugToCalcId(typedLocale, slug);
  if (!calcId) return notFound();

  const title = getTitle(typedLocale, calcId) ?? calcId;
  const breadcrumbItems = [
    { name: "Home", href: `/${typedLocale}` },
    { name: "Calculators", href: `/${typedLocale}/calculators` },
    { name: title }
  ];
  const related = getRelatedCalculators(typedLocale, calcId, 6);
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: `/${typedLocale}` },
      { "@type": "ListItem", position: 2, name: "Calculators", item: `/${typedLocale}/calculators` },
      { "@type": "ListItem", position: 3, name: title }
    ]
  };

  return (
    <section style={{ maxWidth: 860, margin: "24px auto", padding: "0 16px" }}>
      <h1 style={{ fontSize: 32, fontWeight: 700, marginBottom: 12 }}>{title}</h1>
      <Breadcrumb items={breadcrumbItems} />
      <p style={{ color: "#4b5563" }}>
        <strong>calcId:</strong> {calcId} — <strong>locale:</strong> {typedLocale}
      </p>

      <div style={{ marginTop: 24 }}>
        <p>
          This is a placeholder page generated from CSV (schedule + slugs). Replace with your real calculator
          renderer.
        </p>
      </div>

      <div style={{ marginTop: 28, borderTop: "1px solid #e5e7eb", paddingTop: 20 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 12 }}>Related calculators</h2>
        {related.length === 0 ? (
          <p style={{ color: "#6b7280" }}>No related calculators yet.</p>
        ) : (
          <ul style={{ display: "grid", gap: 8, gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))" }}>
            {related.map((it) => (
              <li key={it.slug} style={{ listStyle: "none" }}>
                <a href={`/${typedLocale}/calculators/${it.slug}`} style={{ textDecoration: "none" }}>
                  {it.title}
                </a>
                <div style={{ color: "#6b7280", fontSize: 12 }}>
                  {it.category}
                  {it.subCategory ? ` · ${it.subCategory}` : ""}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    </section>
  );
}

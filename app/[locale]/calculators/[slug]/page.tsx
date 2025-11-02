
import type { Metadata } from "next";
import {
  getAllStaticParams,
  resolveSlugToCalcId,
  getTitle,
  hreflangAlternates,
  isSupportedLocale,
} from "../../../../utils/content";
import { notFound } from "next/navigation";

export const dynamicParams = false;

export async function generateStaticParams() {
  return getAllStaticParams();
}

type PageProps = { params: { locale: string; slug: string } };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale, slug } = params;
  if (!isSupportedLocale(locale)) return {};
  const calcId = resolveSlugToCalcId(locale as any, slug);
  if (!calcId) return {};

  const title = getTitle(locale as any, calcId) ?? calcId;
  const alternates = hreflangAlternates(calcId);

  return {
    title,
    alternates: { languages: alternates },
  };
}

export default async function CalculatorPage({ params }: PageProps) {
  const { locale, slug } = params;
  if (!isSupportedLocale(locale)) return notFound();

  const calcId = resolveSlugToCalcId(locale as any, slug);
  if (!calcId) return notFound();

  const title = getTitle(locale as any, calcId) ?? calcId;

  return (
    import Breadcrumb from "@/components/Breadcrumb";

<section style={{ maxWidth: 860, margin: "24px auto", padding: "0 16px" }}>
      <h1 style={{ fontSize: 32, fontWeight: 700, marginBottom: 12 }}>{title}</h1>
      <Breadcrumb items={[{name: "Home", href: `/${locale}`}, {name: "Calculators", href: `/${locale}/calculators`}, {name: title}]} />
      <p style={{ color: "#4b5563" }}>
        <strong>calcId:</strong> {calcId} — <strong>locale:</strong> {locale}
      </p>

      <div style={{ marginTop: 24 }}>
        <p>
          This is a placeholder page generated from CSV (schedule + slugs).
          Replace with your real calculator renderer.
        </p>
      </div>
    
      {/* Related (server-side) */}
      <div style={{ marginTop: 28, borderTop: "1px solid #e5e7eb", paddingTop: 20 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 12 }}>Related calculators</h2>
        {(() => {
          // server-side fetch
          const entries = require("../../../../utils/content");
          const items = entries.getRelatedCalculators(locale as any, calcId, 6);
          if (!items || items.length === 0) return <p style={{ color: "#6b7280" }}>No related calculators yet.</p>;
          return (
            <ul style={{ display: "grid", gap: 8, gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))" }}>
              {items.map((it: any) => (
                <li key={it.slug} style={{ listStyle: "none" }}>
                  <a href={`/${locale}/calculators/${it.slug}`} style={{ textDecoration: "none" }}>
                    {it.title}
                  </a>
                  <div style={{ color: "#6b7280", fontSize: 12 }}>{it.category}{it.subCategory ? ` · ${it.subCategory}` : ""}</div>
                </li>
              ))}
            </ul>
          );
        })()}
      </div>
    
      {/* JSON-LD BreadcrumbList */}
      {(() => {
        const jsonLd = {
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          "itemListElement": [
            { "@type": "ListItem", "position": 1, "name": "Home", "item": `/${locale}` },
            { "@type": "ListItem", "position": 2, "name": "Calculators", "item": `/${locale}/calculators` },
            { "@type": "ListItem", "position": 3, "name": title }
          ]
        };
        return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />;
      })()}
    
    </section>
        
  );
}

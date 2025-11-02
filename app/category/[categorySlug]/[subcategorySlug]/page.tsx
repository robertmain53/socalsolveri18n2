import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import {
  getCategories,
  getSubcategoryBySlug
} from "@/lib/content";

interface SubcategoryPageProps {
  params: Promise<{
    categorySlug: string;
    subcategorySlug: string;
  }>;
}

export async function generateStaticParams() {
  return getCategories().flatMap((category) =>
    category.subcategories.map((subcategory) => ({
      categorySlug: category.slug,
      subcategorySlug: subcategory.slug
    }))
  );
}

export async function generateMetadata(
  props: SubcategoryPageProps
): Promise<Metadata> {
  const params = await props.params;
  const lookup = getSubcategoryBySlug(params.categorySlug, params.subcategorySlug);

  if (!lookup) {
    return {};
  }

  const { category, subcategory } = lookup;
  const categoryTitle = titleCase(category.label);
  const subcategoryTitle = titleCase(subcategory.label);

  return {
    title: `${subcategoryTitle} Calculators – ${categoryTitle}`,
    description: `Programmatic calculators and reference experiences serving the ${subcategoryTitle.toLowerCase()} cluster within ${categoryTitle}.`,
    alternates: {
      canonical: `/category/${category.slug}/${subcategory.slug}`
    }
  };
}

export default async function SubcategoryPage(props: SubcategoryPageProps) {
  const params = await props.params;
  const lookup = getSubcategoryBySlug(params.categorySlug, params.subcategorySlug);

  if (!lookup) {
    notFound();
  }

  const { category, subcategory } = lookup;

  return (
    <main className="container space-y-12 py-16">
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
          <li aria-hidden>›</li>
          <li>
            <Link href={`/category/${category.slug}`} className="hover:text-brand">
              {titleCase(category.label)}
            </Link>
          </li>
          <li aria-hidden>›</li>
          <li className="text-slate-700">{titleCase(subcategory.label)}</li>
        </ol>
      </nav>

      <header className="space-y-4">
        <h1 className="font-serif text-4xl font-semibold text-slate-900">
          {titleCase(subcategory.label)} Calculators
        </h1>
        <p className="max-w-3xl text-lg text-slate-600">
          A curated cluster of calculators and conversion experiences focused on{" "}
          {subcategory.label.toLowerCase()}, architected for rapid organic growth.
        </p>
        <div className="flex flex-wrap gap-4 text-sm text-slate-500">
          <span className="rounded-full bg-slate-100 px-3 py-1">
            {subcategory.calculators.length} calculators
          </span>
          <span className="rounded-full bg-slate-100 px-3 py-1">
            {subcategory.trafficTotal.toLocaleString()} projected visits
          </span>
        </div>
      </header>

      <section className="space-y-6">
        <h2 className="font-serif text-2xl font-semibold text-slate-900">
          Experiences in this cluster
        </h2>
        <div className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200">
          {subcategory.calculators.map((calculator) => (
            <article key={calculator.fullPath} className="space-y-2">
              <Link
                href={calculator.fullPath}
                className="text-lg font-semibold text-slate-900 hover:text-brand"
              >
                {calculator.title}
              </Link>
              <p className="text-sm text-slate-500">
                Forecast: {calculator.trafficEstimate.toLocaleString()} daily visits
              </p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}

function titleCase(value: string) {
  return value
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { getCategories, getCategoryBySlug } from "@/lib/content";

interface CategoryPageProps {
  params: Promise<{
    categorySlug: string;
  }>;
}

export async function generateStaticParams() {
  return getCategories().map((category) => ({
    categorySlug: category.slug
  }));
}

export async function generateMetadata(
  props: CategoryPageProps
): Promise<Metadata> {
  const params = await props.params;
  const category = getCategoryBySlug(params.categorySlug);

  if (!category) {
    return {};
  }

  const categoryTitle = titleCase(category.label);

  return {
    title: `${categoryTitle} Calculators & Conversion Guides`,
    description: `Explore authoritative ${categoryTitle.toLowerCase()} calculators, conversion tables, and expert guidance engineered for search leadership.`,
    alternates: {
      canonical: `/category/${category.slug}`
    }
  };
}

export default async function CategoryPage(props: CategoryPageProps) {
  const params = await props.params;
  const category = getCategoryBySlug(params.categorySlug);

  if (!category) {
    notFound();
  }

  const subcategories = category.subcategories;
  const subcategorySlugByLabel = new Map(
    subcategories.map((item) => [item.label, item.slug] as const)
  );
  const calculators = category.calculators;

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
          <li className="text-slate-700">{titleCase(category.label)}</li>
        </ol>
      </nav>

      <header className="space-y-4">
        <h1 className="font-serif text-4xl font-semibold text-slate-900">
          {titleCase(category.label)} Calculators & Intelligence
        </h1>
        <p className="max-w-3xl text-lg text-slate-600">
          High-performing programmatic assets designed to capture transactional
          intent across the {category.label.toLowerCase()} landscape.
        </p>
        <div className="flex flex-wrap gap-4 text-sm text-slate-500">
          <span className="rounded-full bg-slate-100 px-3 py-1">
            {category.calculators.length} calculators
          </span>
          <span className="rounded-full bg-slate-100 px-3 py-1">
            {category.subcategories.length} subcategories
          </span>
          <span className="rounded-full bg-slate-100 px-3 py-1">
            {category.trafficTotal.toLocaleString()} projected daily visits
          </span>
        </div>
      </header>

      {subcategories.length > 0 && (
        <section className="space-y-6">
          <h2 className="font-serif text-2xl font-semibold text-slate-900">
            Featured sub-clusters
          </h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {subcategories.map((subcategory) => (
              <article
                key={subcategory.slug}
                className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200"
              >
                <h3 className="font-medium text-slate-800">
                  <Link
                    href={`/category/${category.slug}/${subcategory.slug}`}
                    className="hover:text-brand"
                  >
                    {titleCase(subcategory.label)}
                  </Link>
                </h3>
                <p className="mt-2 text-sm text-slate-500">
                  {subcategory.calculators.length} calculators ·{" "}
                  {subcategory.trafficTotal.toLocaleString()} projected visits
                </p>
                <ul className="mt-4 space-y-2 text-sm text-slate-600">
                  {subcategory.calculators.slice(0, 3).map((calculator) => (
                    <li key={calculator.fullPath}>
                      <Link
                        href={calculator.fullPath}
                        className="hover:text-brand"
                      >
                        {calculator.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </section>
      )}

      <section className="space-y-6">
        <h2 className="font-serif text-2xl font-semibold text-slate-900">
          Calculators in this hub
        </h2>
        <div className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200">
          {calculators.map((calculator) => (
            <div key={calculator.fullPath} className="flex flex-col gap-3">
              <Link
                href={calculator.fullPath}
                className="text-lg font-semibold text-slate-900 hover:text-brand"
              >
                {calculator.title}
              </Link>
              <div className="flex flex-wrap items-center gap-3 text-xs uppercase tracking-wide text-slate-400">
                <span>{calculator.category}</span>
                {calculator.subcategory &&
                  subcategorySlugByLabel.has(calculator.subcategory) && (
                    <span>
                      <Link
                        href={`/category/${category.slug}/${subcategorySlugByLabel.get(
                          calculator.subcategory
                        )}`}
                        className="hover:text-brand"
                      >
                        {calculator.subcategory}
                      </Link>
                    </span>
                  )}
                <span>
                  {calculator.trafficEstimate.toLocaleString()} projected visits
                </span>
              </div>
            </div>
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

import type { Metadata } from "next";
import Link from "next/link";

import { getCategories } from "@/lib/content";

export const metadata: Metadata = {
  title: "Category Directory",
  description:
    "Browse the Quantus knowledge architecture organized by high-value categories and conversion clusters."
};

export default function CategoryIndexPage() {
  const categories = getCategories();

  return (
    <main className="container space-y-12 py-16">
      <header className="space-y-4">
        <h1 className="font-serif text-4xl font-semibold text-slate-900">
          Category Intelligence
        </h1>
        <p className="max-w-3xl text-lg text-slate-600">
          Strategic hubs engineered to capture evergreen search demand. Drill
          into sub-clusters to access individual converter experiences.
        </p>
      </header>

      <div className="grid gap-8 md:grid-cols-2">
        {categories.map((category) => (
          <article
            key={category.slug}
            className="flex flex-col gap-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200"
          >
            <div className="space-y-2">
              <Link
                href={`/category/${category.slug}`}
                className="font-serif text-2xl font-semibold text-slate-900 hover:text-brand"
              >
                {titleCase(category.label)}
              </Link>
              <p className="text-sm text-slate-500">
                {category.trafficTotal.toLocaleString()} projected daily visits ·{" "}
                {category.calculators.length} calculators
              </p>
            </div>
            <ul className="space-y-2 text-sm text-slate-600">
              {category.subcategories.slice(0, 4).map((subcategory) => (
                <li key={subcategory.slug}>
                  <Link
                    href={`/category/${category.slug}/${subcategory.slug}`}
                    className="hover:text-brand"
                  >
                    {titleCase(subcategory.label)} ({subcategory.calculators.length})
                  </Link>
                </li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </main>
  );
}

function titleCase(value: string) {
  return value
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

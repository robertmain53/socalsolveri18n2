import type { Metadata } from "next";
import Link from "next/link";

import { getTopCalculators, searchCalculators } from "@/lib/content";

export const metadata: Metadata = {
  title: "Search",
  description: "Search the Quantus library of calculators and conversion tools."
};

interface SearchPageProps {
  searchParams: Promise<{ q?: string }>;
}

export default async function SearchPage(props: SearchPageProps) {
  const params = await props.searchParams;
  const query = params.q?.toString().trim() ?? "";
  const results = query ? searchCalculators(query) : [];
  const popular = results.length === 0 ? getTopCalculators(6) : [];

  return (
    <main className="container space-y-12 py-16">
      <header className="space-y-4">
        <h1 className="font-serif text-4xl font-semibold text-slate-900">Search</h1>
        <p className="max-w-3xl text-lg text-slate-600">
          Discover calculators, conversions, and programmatic experiences across the Quantus
          knowledge graph.
        </p>
        <form action="/search" method="get" className="flex max-w-xl items-center gap-3">
          <label htmlFor="search-query" className="sr-only">
            Search calculators
          </label>
          <input
            id="search-query"
            name="q"
            type="search"
            defaultValue={query}
            placeholder="Enter keywords (e.g., meters to feet)"
            className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2 text-base text-slate-900 shadow-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/30"
          />
          <button
            type="submit"
            className="inline-flex items-center rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-brand-accent"
          >
            Search
          </button>
        </form>
      </header>

      <section className="space-y-6">
        <h2 className="font-serif text-2xl font-semibold text-slate-900">
          {query ? `Results for “${query}”` : "Popular calculators"}
        </h2>
        {query && results.length === 0 && (
          <p className="text-sm text-slate-500">
            We couldn&apos;t find calculators matching your query. Try different keywords or browse
            the popular experiences below.
          </p>
        )}
        <div className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200">
          {(results.length > 0 ? results : popular).map((calculator) => (
            <Link
              key={calculator.fullPath}
              href={calculator.fullPath}
              className="flex flex-col gap-2 rounded-lg border border-transparent px-3 py-2 transition hover:border-brand hover:bg-slate-50"
            >
              <div className="flex items-center justify-between gap-3">
                <p className="font-medium text-slate-800">{calculator.title}</p>
                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
                  {calculator.trafficEstimate.toLocaleString()} / day
                </span>
              </div>
              <p className="text-xs uppercase tracking-wide text-slate-400">
                {calculator.category}
                {calculator.subcategory ? ` · ${calculator.subcategory}` : ""}
              </p>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}

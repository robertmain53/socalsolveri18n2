'use client';

import { useSearchParams } from "next/navigation";

export function SiteSearch() {
  const searchParams = useSearchParams();
  const defaultQuery = searchParams?.get("q") ?? "";

  return (
    <form
      action="/search"
      method="get"
      className="flex w-full max-w-sm items-center gap-2"
      role="search"
    >
      <label htmlFor="site-search" className="sr-only">
        Search calculators
      </label>
      <input
        id="site-search"
        name="q"
        type="search"
        defaultValue={defaultQuery}
        placeholder="Search calculators..."
        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/30"
      />
      <button
        type="submit"
        className="inline-flex items-center rounded-lg bg-brand px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-brand-accent"
      >
        Search
      </button>
    </form>
  );
}

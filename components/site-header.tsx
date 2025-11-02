import { Suspense } from "react";
import Link from "next/link";

import { getCategories } from "@/lib/content";
import { SiteSearch } from "@/components/site-search";

export function SiteHeader() {
  const categories = getCategories().slice(0, 5);

  return (
    <header className="border-b border-slate-200 bg-white/80 backdrop-blur">
      <div className="container flex flex-wrap items-center justify-between gap-4 py-4">
        <Link href="/" className="flex items-center gap-2 font-serif text-xl font-semibold text-slate-900">
          Quantus
        </Link>
        <div className="flex flex-1 flex-wrap items-center justify-end gap-4">
          <nav className="flex flex-wrap items-center gap-4 text-sm font-medium text-slate-600">
            <Link href="/category" className="hover:text-brand">
              Categories
            </Link>
            {categories.map((category) => (
              <Link
                key={category.slug}
                href={`/category/${category.slug}`}
                className="hover:text-brand"
              >
                {category.label}
              </Link>
            ))}
          </nav>
          <Suspense fallback={<span className="text-sm text-slate-400">Loading search…</span>}>
            <SiteSearch />
          </Suspense>
          <div className="hidden text-xs uppercase tracking-wide text-slate-400 md:flex md:items-center">
            <span>Standards aligned · audit ready</span>
          </div>
        </div>
      </div>
    </header>
  );
}

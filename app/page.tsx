import Link from "next/link";

import {
  getCategories,
  getTopCalculators,
  getUpcomingPublishSchedule
} from "@/lib/content";

export default function HomePage() {
  const categories = getCategories().slice(0, 6);
  const topCalculators = getTopCalculators(6);
  const publishSchedule = getUpcomingPublishSchedule().slice(0, 5);

  return (
    <main className="container flex flex-col gap-16 py-16">
      <section className="grid gap-12 lg:grid-cols-12 lg:items-center">
        <div className="space-y-6 lg:col-span-7">
          <span className="inline-flex items-center rounded-full bg-sky-100 px-4 py-1 text-sm font-medium text-sky-700">
            Built for Technical Teams
          </span>
          <h1 className="font-serif text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl">
            Deliver calculators your experts can trust on deadline.
          </h1>
          <p className="text-lg text-slate-600">
            Quantus keeps every converter auditable—aligning with published standards,
            documenting methodology, and presenting results in a workflow your engineers,
            analysts, and operators can rely on for real-world decisions.
          </p>
          <div className="flex flex-wrap gap-4 text-sm text-slate-500">
            <div className="rounded-lg bg-white px-4 py-2 shadow-sm shadow-slate-200">
              Versioned methodologies &amp; units
            </div>
            <div className="rounded-lg bg-white px-4 py-2 shadow-sm shadow-slate-200">
              Standards-backed references
            </div>
            <div className="rounded-lg bg-white px-4 py-2 shadow-sm shadow-slate-200">
              Governed release cadence
            </div>
          </div>
        </div>
        <aside className="space-y-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-lg shadow-slate-200 lg:col-span-5">
          <h2 className="text-base font-semibold text-slate-800">
            Upcoming releases (versioned roadmap)
          </h2>
          <ol className="space-y-4 text-sm text-slate-600">
            {publishSchedule.map((entry) => (
              <li key={entry.path} className="flex items-start gap-3">
                <span className="mt-1 h-2.5 w-2.5 flex-none rounded-full bg-sky-500" aria-hidden />
                <div className="space-y-1">
                  <span className="font-medium text-slate-800">{entry.title}</span>
                  <p className="text-xs uppercase tracking-wide text-slate-400">
                    Publishing {formatPublishDate(entry.publishDate)}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </aside>
      </section>

      <section className="space-y-8">
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-2xl font-semibold text-slate-900">
            Disciplines we support
          </h2>
          <Link
            href="/category"
            className="text-sm font-medium text-brand hover:text-brand-accent"
          >
            View all categories
          </Link>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {categories.map((category) => (
            <article
              key={category.slug}
              className="flex h-full flex-col justify-between rounded-2xl border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200 transition hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="space-y-3">
                <Link
                  href={`/category/${category.slug}`}
                  className="font-serif text-xl font-semibold text-slate-900 hover:text-brand"
                >
                  {titleCase(category.label)}
                </Link>
                <p className="text-sm text-slate-500">
                  {category.subcategories.length} sub clusters ·{" "}
                  {category.calculators.length} experiences
                </p>
              </div>
              <div className="mt-6 space-y-2">
                {category.calculators.slice(0, 3).map((calculator) => (
                  <Link
                    key={calculator.fullPath}
                    href={calculator.fullPath}
                    className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-600 hover:bg-slate-100 hover:text-slate-800"
                  >
                    <span className="truncate">{calculator.title}</span>
                    <span className="ml-3 flex-none rounded-full bg-white px-2 py-0.5 text-xs font-medium text-slate-500 shadow-sm">
                      {formatTraffic(calculator.trafficEstimate)}
                    </span>
                  </Link>
                ))}
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="space-y-8">
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-2xl font-semibold text-slate-900">
            Core converters teams depend on
          </h2>
          <p className="text-sm text-slate-500">
            Prioritized by active demand and critical workflows
          </p>
        </div>
        <div className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200">
          {topCalculators.map((calculator) => (
            <Link
              key={calculator.fullPath}
              href={calculator.fullPath}
              className="flex flex-col gap-2 rounded-lg border border-transparent px-3 py-2 transition hover:border-brand hover:bg-slate-50"
            >
              <div className="flex items-center justify-between gap-3">
                <p className="font-medium text-slate-800">{calculator.title}</p>
                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
                  {formatTraffic(calculator.trafficEstimate)} / day
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

function formatTraffic(value: number) {
  if (value >= 1000) {
    return `${Math.round(value / 100) / 10}K`;
  }
  return value.toString();
}

function formatPublishDate(value: string) {
  return new Date(value).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric"
  });
}

function titleCase(value: string) {
  return value
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

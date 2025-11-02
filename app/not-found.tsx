import Link from "next/link";

export default function NotFoundPage() {
  return (
    <main className="flex min-h-[60vh] flex-col items-center justify-center gap-6 bg-slate-50 px-4 text-center">
      <span className="rounded-full border border-slate-200 px-4 py-1 text-xs uppercase tracking-wide text-slate-500">
        404 — Experience not found
      </span>
      <h1 className="font-serif text-4xl font-semibold text-slate-900 sm:text-5xl">
        We couldn&apos;t locate that experience.
      </h1>
      <p className="max-w-xl text-base text-slate-600">
        The calculator you&apos;re looking for might be scheduled for a future release.
        Explore the category index to find a related experience.
      </p>
      <div className="flex flex-wrap items-center justify-center gap-4 text-sm font-medium">
        <Link
          href="/"
          className="rounded-full bg-slate-900 px-5 py-2 text-white shadow-sm hover:bg-slate-700"
        >
          Back to homepage
        </Link>
        <Link
          href="/category"
          className="rounded-full border border-slate-300 px-5 py-2 text-slate-700 hover:border-brand hover:text-brand"
        >
          View categories
        </Link>
      </div>
    </main>
  );
}

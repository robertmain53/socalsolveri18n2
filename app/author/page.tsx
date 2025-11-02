import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Author Guidelines",
  description:
    "Publishing standards, voice, and workflow expectations for Quantus content authors."
};

export default function AuthorPage() {
  return (
    <main className="container space-y-8 py-16">
      <header className="space-y-4">
        <h1 className="font-serif text-4xl font-semibold text-slate-900">Author Guidelines</h1>
        <p className="max-w-3xl text-lg text-slate-600">
          These standards keep every calculator audit-ready, consistent, and compliant with the
          references professionals expect. Review them before submitting new experiences or
          updating existing ones.
        </p>
      </header>

      <section className="space-y-4 text-base text-slate-600">
        <h2 className="font-serif text-2xl font-semibold text-slate-900">Voice &amp; tone</h2>
        <ul className="list-disc space-y-2 pl-5">
          <li>Lead with clarity. Explain inputs, outputs, assumptions, and methodology succinctly.</li>
          <li>Adopt an expert-but-practical tone—focus on how practitioners apply the result.</li>
          <li>Support every claim with primary standards, regulatory guidance, or peer-reviewed data.</li>
        </ul>
      </section>

      <section className="space-y-4 text-base text-slate-600">
        <h2 className="font-serif text-2xl font-semibold text-slate-900">Submission checklist</h2>
        <ol className="list-decimal space-y-2 pl-5">
          <li>Confirm the slug, category, and subcategory match the approved taxonomy.</li>
          <li>Provide metadata and changelog notes so downstream teams understand revisions.</li>
          <li>Document formulas, units, tolerances, and authoritative references in the editorial brief.</li>
          <li>Flag any compliance considerations (financial disclaimers, health caveats, etc.).</li>
        </ol>
      </section>

      <section className="space-y-4 text-base text-slate-600">
        <h2 className="font-serif text-2xl font-semibold text-slate-900">Review workflow</h2>
        <p>
          Every submission passes through technical review. Expect structural feedback within two
          business days and final publication once data integrity, compliance, and subject-matter
          approvals are complete.
        </p>
      </section>
    </main>
  );
}

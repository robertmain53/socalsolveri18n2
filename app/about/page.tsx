import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About Quantus",
  description:
    "Learn about Quantus, the calculator platform built for professionals who need standards-aligned answers."
};

export default function AboutPage() {
  return (
    <main className="container space-y-8 py-16">
      <header className="space-y-4">
        <h1 className="font-serif text-4xl font-semibold text-slate-900">About Quantus</h1>
        <p className="max-w-3xl text-lg text-slate-600">
          Quantus exists to help technical teams deliver dependable calculators and conversion tools
          without reinventing infrastructure. We blend authoritative data models, structured content,
          and disciplined governance so professionals can reference, share, and defend every result.
        </p>
      </header>

      <section className="space-y-4 text-base text-slate-600">
        <h2 className="font-serif text-2xl font-semibold text-slate-900">What we believe</h2>
        <p>
          Trustworthy tooling should be predictable. By pairing a rigorous content taxonomy with a
          modern edge-ready architecture, Quantus empowers engineers, analysts, and product teams to
          orchestrate thousands of experiences without sacrificing quality or oversight.
        </p>
        <p>
          We embrace a &ldquo;programmatic craftsmanship&rdquo; mindset: automate the repeatable,
          obsess over the moments that matter, and treat every experience as a trust signal for the
          professionals who rely on it.
        </p>
      </section>

      <section className="space-y-4 text-base text-slate-600">
        <h2 className="font-serif text-2xl font-semibold text-slate-900">How we operate</h2>
        <ul className="list-disc space-y-2 pl-5">
          <li>Static-first build pipeline with on-demand revalidation for fresh data.</li>
          <li>Centralized governance over methodology, references, and release cadence.</li>
          <li>Transparent instrumentation to monitor accuracy, usage, and feedback loops.</li>
          <li>Editorial tooling that keeps subject-matter experts and writers in sync.</li>
        </ul>
      </section>
    </main>
  );
}

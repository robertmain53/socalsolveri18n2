import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "Understand how Quantus collects, uses, and protects personal data generated across our platform."
};

export default function PrivacyPage() {
  return (
    <main className="container space-y-8 py-16">
      <header className="space-y-4">
        <h1 className="font-serif text-4xl font-semibold text-slate-900">Privacy Policy</h1>
        <p className="max-w-3xl text-lg text-slate-600">
          Transparency is core to our operating philosophy. This policy explains what information we
          collect, why we collect it, and the controls available to you.
        </p>
        <p className="text-sm text-slate-500">Last updated: January 15, 2024</p>
      </header>

      <section className="space-y-3 text-base text-slate-600">
        <h2 className="font-serif text-2xl font-semibold text-slate-900">Information we collect</h2>
        <ul className="list-disc space-y-2 pl-5">
          <li>Usage analytics (pages viewed, query parameters, device metadata).</li>
          <li>Voluntary submissions (feedback forms, waitlists, partnership inquiries).</li>
          <li>Operational telemetry required to secure and improve the platform.</li>
        </ul>
      </section>

      <section className="space-y-3 text-base text-slate-600">
        <h2 className="font-serif text-2xl font-semibold text-slate-900">How we use data</h2>
        <p>
          We aggregate insights to prioritize feature development, monitor reliability, and surface
          the most impactful experiences. We do not sell personal data to third parties.
        </p>
      </section>

      <section className="space-y-3 text-base text-slate-600">
        <h2 className="font-serif text-2xl font-semibold text-slate-900">Your choices</h2>
        <p>
          You can request access, corrections, or deletion at any time by emailing privacy@quantus.
          We honor regional privacy regulations and provide opt-outs where required.
        </p>
      </section>
    </main>
  );
}

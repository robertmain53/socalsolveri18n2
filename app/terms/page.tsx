import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service",
  description:
    "Read the Quantus Terms of Service that govern access to our calculators, data, and platform."
};

export default function TermsPage() {
  return (
    <main className="container space-y-8 py-16">
      <header className="space-y-4">
        <h1 className="font-serif text-4xl font-semibold text-slate-900">Terms of Service</h1>
        <p className="max-w-3xl text-lg text-slate-600">
          These terms form a binding agreement between Quantus and anyone accessing our sites,
          calculators, APIs, or derivative content.
        </p>
        <p className="text-sm text-slate-500">Last updated: January 15, 2024</p>
      </header>

      <section className="space-y-3 text-base text-slate-600">
        <h2 className="font-serif text-2xl font-semibold text-slate-900">1. Use of service</h2>
        <p>
          Quantus grants a non-exclusive, revocable license to access our calculators for
          informational purposes. You agree not to resell, reverse engineer, or misrepresent the
          outputs provided.
        </p>
      </section>

      <section className="space-y-3 text-base text-slate-600">
        <h2 className="font-serif text-2xl font-semibold text-slate-900">2. No professional advice</h2>
        <p>
          Our experiences provide general guidance only. They do not constitute financial, legal,
          medical, or engineering advice. Consult qualified professionals before making decisions.
        </p>
      </section>

      <section className="space-y-3 text-base text-slate-600">
        <h2 className="font-serif text-2xl font-semibold text-slate-900">3. Limitation of liability</h2>
        <p>
          Quantus is not liable for direct, indirect, or consequential losses arising from your use
          of the platform. Access is provided &ldquo;as is&rdquo; without warranties of accuracy or
          fitness for a particular purpose.
        </p>
      </section>

      <section className="space-y-3 text-base text-slate-600">
        <h2 className="font-serif text-2xl font-semibold text-slate-900">4. Changes</h2>
        <p>
          We may update these terms at any time. Continued use after updates constitutes acceptance
          of the revised agreement.
        </p>
      </section>
    </main>
  );
}

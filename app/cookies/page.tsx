import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cookie Policy",
  description:
    "Details on how Quantus uses cookies and local storage to enhance performance and personalization."
};

export default function CookiesPage() {
  return (
    <main className="container space-y-8 py-16">
      <header className="space-y-4">
        <h1 className="font-serif text-4xl font-semibold text-slate-900">Cookie Policy</h1>
        <p className="max-w-3xl text-lg text-slate-600">
          Cookies help us deliver a fast, reliable, and relevant experience. This page explains the
          categories of cookies we use and the options available to you.
        </p>
        <p className="text-sm text-slate-500">Last updated: January 15, 2024</p>
      </header>

      <section className="space-y-3 text-base text-slate-600">
        <h2 className="font-serif text-2xl font-semibold text-slate-900">Essential Cookies</h2>
        <p>
          Required for authentication, security, and remembering your cookie preferences. These
          cookies cannot be disabled because the site will not function without them.
        </p>
      </section>

      <section className="space-y-3 text-base text-slate-600">
        <h2 className="font-serif text-2xl font-semibold text-slate-900">Analytics cookies</h2>
        <p>
          Help us understand how features perform and where users find friction. We anonymize
          analytics wherever possible and never use them for third-party advertising.
        </p>
      </section>

      <section className="space-y-3 text-base text-slate-600">
        <h2 className="font-serif text-2xl font-semibold text-slate-900">Managing cookies</h2>
        <p>
          You can adjust preferences in our consent manager or via your browser settings. Deleting
          cookies may impact the accuracy of calculators that rely on stored inputs.
        </p>
      </section>
    </main>
  );
}

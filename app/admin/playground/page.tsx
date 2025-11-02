import type { Metadata } from "next";

import { ConfigPlayground } from "@/components/admin/config-playground";

export const metadata: Metadata = {
  title: "Calculator Config Playground",
  description:
    "Validate AI-generated calculator JSON and preview it with the generic rendering engines before publishing."
};

export default function PlaygroundPage() {
  return (
    <main className="container space-y-8 py-16">
      <header className="space-y-3">
        <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
          Internal tooling
        </p>
        <h1 className="font-serif text-4xl font-semibold text-slate-900">
          Calculator Config Playground
        </h1>
        <p className="max-w-3xl text-base text-slate-600">
          Paste AI-generated <code>config_json</code> to validate schema compliance, sanitise content,
          and preview how the generic calculator engines will render before committing to the CSV.
        </p>
      </header>

      <ConfigPlayground />
    </main>
  );
}

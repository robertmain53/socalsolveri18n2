
"use client";
import Link from "next/link";
import { getRelatedCalculators, resolveCalcIdToSlug, type Locale } from "@/utils/content";

type Props = { locale: Locale; calcId: string };

// NOTE: Reads happen server-side ideally; here we accept simple client-side render with precomputed props if needed.
// For App Router simplicity, you can transform this into a server component by moving data fetching to the parent.
export default function RelatedCalculators({ locale, calcId }: Props) {
  // This component is intentionally minimal; for SSR, compute items in the parent and pass as prop.
  // Here we call a runtime import to avoid bundling fs in client; in production, replace with server usage.
  return (
    <div className="related-calculators" style={{ marginTop: 32 }}>
      <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 12 }}>Related calculators</h2>
      <ul style={{ display: "grid", gap: 8, gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))" }}>
        {/* Placeholder message; please wire server-side data in page.tsx and pass items as prop */}
        <li style={{ listStyle: "none", color: "#6b7280" }}>
          Configure on server: import {{ getRelatedCalculators }} in the page and pass items here.
        </li>
      </ul>
    </div>
  );
}

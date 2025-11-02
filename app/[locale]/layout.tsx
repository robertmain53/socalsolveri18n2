
import type { Metadata } from "next";
import { isSupportedLocale, LOCALES } from "../../utils/content";
import { notFound } from "next/navigation";
import "../globals.css";

export const dynamic = "force-static";

export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

export const metadata: Metadata = {
  title: "SoCalSolver",
  description: "Calculators that feel easy.",
};

export default function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  const { locale } = params;
  if (!isSupportedLocale(locale)) return notFound();
  return (
    <html lang={locale}>
      <body>
        <header style={{ padding: "12px 16px", borderBottom: "1px solid #e5e7eb" }}>
          <nav style={{ display: "flex", gap: 12 }}>
            <a href={`/${locale}`}>Home</a>
            <a href={`/${locale}/calculators`}>Calculators</a>
          </nav>
        </header>
        <main style={{ minHeight: "70vh" }}>{children}</main>
        <footer style={{ padding: "16px", borderTop: "1px solid #e5e7eb" }}>
          <small>© {new Date().getFullYear()} SoCalSolver</small>
        </footer>
      </body>
    </html>
  );
}

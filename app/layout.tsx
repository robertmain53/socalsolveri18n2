import type { Metadata } from "next";
import { Inter, Source_Serif_4 } from "next/font/google";

import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getSiteUrl } from "@/lib/seo";

import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap"
});

const sourceSerif = Source_Serif_4({
  subsets: ["latin"],
  variable: "--font-serif",
  display: "swap"
});

export const metadata: Metadata = {
  metadataBase: new URL("https://www.quantus.example"),
  title: {
    default: "Quantus | Precision Converters & Calculators",
    template: "%s | Quantus"
  },
  description:
    "Quantus delivers authoritative calculators and unit converters for engineers, analysts, and operations teams who need standards-aligned answers.",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://www.quantus.example",
    siteName: "Quantus",
    title: "Quantus | Precision Converters & Calculators",
    description:
      "Explore expertly crafted calculators and conversion tools optimized for accuracy, auditability, and day-to-day professional workflows."
  },
  twitter: {
    card: "summary_large_image",
    creator: "@quantus",
    title: "Quantus | Precision Converters & Calculators",
    description:
      "Enterprise-ready calculators and conversion tools designed for dependable decision support."
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-video-preview": -1,
      "max-snippet": -1
    }
  }
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const siteUrl = getSiteUrl();
  const rootStructuredData = [
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      name: "Quantus",
      url: siteUrl,
      sameAs: []
    },
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: "Quantus",
      url: siteUrl,
      potentialAction: {
        "@type": "SearchAction",
        target: `${siteUrl}?q={search_term_string}`,
        "query-input": "required name=search_term_string"
      }
    }
  ];

  return (
    <html
      lang="en"
      className={`${inter.variable} ${sourceSerif.variable} scroll-smooth`}
    >
      <body className="bg-slate-50 text-slate-900">
        <div className="flex min-h-screen flex-col">
          <SiteHeader />
          <div className="flex-1">{children}</div>
          <SiteFooter />
        </div>
        <script
          type="application/ld+json"
          suppressHydrationWarning
          dangerouslySetInnerHTML={{ __html: JSON.stringify(rootStructuredData) }}
        />
      </body>
    </html>
  );
}

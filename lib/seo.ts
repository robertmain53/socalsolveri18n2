const DEFAULT_SITE_URL = "https://www.quantus.example";

export function getSiteUrl(pathname = "/") {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? DEFAULT_SITE_URL;
  return new URL(pathname, base).toString();
}

export interface BreadcrumbItem {
  name: string;
  url: string;
}

export function buildBreadcrumbSchema(items: BreadcrumbItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url
    }))
  };
}

export interface FaqItem {
  question: string;
  answer: string;
}

export function buildFaqSchema(faqs: FaqItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer
      }
    }))
  };
}

export function buildWebPageSchema(options: {
  name: string;
  description: string;
  url: string;
  category?: string;
  dateModified?: string | null;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: options.name,
    description: options.description,
    url: options.url,
    inLanguage: "en-US",
    isPartOf: {
      "@type": "WebSite",
      name: "Quantus",
      url: getSiteUrl()
    },
    about: options.category,
    dateModified: options.dateModified ?? undefined
  };
}

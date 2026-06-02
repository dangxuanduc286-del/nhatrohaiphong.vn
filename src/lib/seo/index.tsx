import type { Metadata } from "next";

import { appConfig } from "@/config/app";

export const SITE_URL = appConfig.url;
export const DEFAULT_LOCALE = "vi_VN";

export type BreadcrumbItem = {
  name: string;
  url: string;
};

export type JsonLd = Record<string, unknown>;

function trimSlashes(value: string) {
  return value.replace(/^\/+|\/+$/g, "");
}

export function absoluteUrl(path = "/") {
  if (/^https?:\/\//i.test(path)) {
    return path;
  }

  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${SITE_URL}${normalizedPath === "/" ? "" : normalizedPath}`;
}

export function canonicalPath(path = "/") {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return normalizedPath === "/" ? "/" : `/${trimSlashes(normalizedPath)}`;
}

export function createSeoMetadata(input: {
  title: string;
  description: string;
  path?: string;
  keywords?: string[];
  image?: string;
  noIndex?: boolean;
}): Metadata {
  const path = canonicalPath(input.path ?? "/");
  const url = absoluteUrl(path);
  const title = input.title.includes(appConfig.name) ? input.title : `${input.title} | ${appConfig.name}`;

  return {
    title,
    description: input.description,
    keywords: input.keywords,
    alternates: { canonical: url },
    robots: input.noIndex ? { index: false, follow: false } : { index: true, follow: true },
    openGraph: {
      type: "website",
      locale: DEFAULT_LOCALE,
      siteName: appConfig.name,
      title,
      description: input.description,
      url,
      images: input.image ? [{ url: absoluteUrl(input.image), alt: title }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: input.description,
      images: input.image ? [absoluteUrl(input.image)] : undefined,
    },
  };
}

export function organizationJsonLd(): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: appConfig.name,
    url: SITE_URL,
    logo: absoluteUrl("/next.svg"),
    address: {
      "@type": "PostalAddress",
      addressLocality: "Hải Phòng",
      addressCountry: "VN",
    },
  };
}

export function websiteJsonLd(): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: appConfig.name,
    url: SITE_URL,
    potentialAction: {
      "@type": "SearchAction",
      target: `${SITE_URL}/api/search?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };
}

export function breadcrumbJsonLd(items: BreadcrumbItem[]): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.url),
    })),
  };
}

export function itemListJsonLd(items: Array<{ name: string; url: string }>): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      url: absoluteUrl(item.url),
    })),
  };
}

export function residenceJsonLd(items: Array<{ name: string; url: string; address?: string; price?: number }>): JsonLd[] {
  return items.slice(0, 12).map((item) => ({
    "@context": "https://schema.org",
    "@type": "Residence",
    name: item.name,
    url: absoluteUrl(item.url),
    address: item.address,
    offers: item.price
      ? {
          "@type": "Offer",
          price: item.price,
          priceCurrency: "VND",
          availability: "https://schema.org/InStock",
        }
      : undefined,
  }));
}

export function faqJsonLd(items: Array<{ question: string; answer: string }>): JsonLd | null {
  const validItems = items.filter((item) => item.question.trim() && item.answer.trim()).slice(0, 8);

  if (validItems.length === 0) {
    return null;
  }

  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: validItems.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  };
}

export function JsonLdScript({ data }: { data: JsonLd | JsonLd[] | null }) {
  if (!data) {
    return null;
  }

  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }} />;
}

/**
 * Structured Data / JSON-LD generators for SEO
 * Implements schema.org markup for enhanced search engine understanding
 */

export type SupportedLocale = "en" | "ar";

interface OrganizationSchema {
  "@context": string;
  "@type": string;
  name: string;
  description: string;
  url: string;
  logo: string;
  sameAs: string[];
  contactPoint: {
    "@type": string;
    contactType: string;
    url: string;
  };
  foundingDate?: string;
  areaServed: string[];
}

interface SoftwareApplicationSchema {
  "@context": string;
  "@type": string;
  name: string;
  description: string;
  applicationCategory: string;
  offers: {
    "@type": string;
    price: string;
    priceCurrency: string;
  };
  screenshot?: string;
  url: string;
  author: {
    "@type": string;
    name: string;
  };
  operatingSystem: string[];
  aggregateRating?: {
    "@type": string;
    ratingValue: string;
    reviewCount: number;
  };
}

interface WebSiteSchema {
  "@context": string;
  "@type": string;
  name: string;
  description: string;
  url: string;
  potentialAction: {
    "@type": string;
    target: {
      "@type": string;
      urlTemplate: string;
    };
    query_input: string;
  };
  inLanguage: string[];
}

/**
 * Generate Organization schema.org markup
 */
export function getOrganizationSchema(locale: SupportedLocale): OrganizationSchema {
  const baseUrl = "https://sastify.com";
  const translations = {
    en: {
      name: "SASTify",
      description:
        "AI-powered Static Application Security Testing tool for intelligent, automated code security",
    },
    ar: {
      name: "SASTify",
      description: "أداة اختبار الأمان الثابت مدعومة بالذكاء الاصطناعي لأمان الكود الذكي والمؤتمت",
    },
  };

  const t = translations[locale];

  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: t.name,
    description: t.description,
    url: baseUrl,
    logo: `${baseUrl}/logo.png`,
    sameAs: [
      "https://twitter.com/SASTifyAI",
      "https://github.com/sastify",
      "https://linkedin.com/company/sastify",
    ],
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "Customer Support",
      url: `${baseUrl}/contact`,
    },
    areaServed: ["Worldwide"],
  };
}

/**
 * Generate SoftwareApplication schema.org markup
 */
export function getSoftwareApplicationSchema(locale: SupportedLocale): SoftwareApplicationSchema {
  const baseUrl = "https://sastify.com";
  const translations = {
    en: {
      name: "SASTify",
      description:
        "The Future of Intelligent, Automated Code Security - AI-powered Static Application Security Testing with Semgrep integration",
    },
    ar: {
      name: "SASTify",
      description:
        "مستقبل أمان الكود الذكي والمؤتمت - اختبار الأمان الثابت مدعوم بالذكاء الاصطناعي مع تكامل Semgrep",
    },
  };

  const t = translations[locale];

  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: t.name,
    description: t.description,
    applicationCategory: "SecurityApplication",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    url: baseUrl,
    author: {
      "@type": "Organization",
      name: "SASTify Team",
    },
    operatingSystem: ["Linux", "macOS", "Windows"],
  };
}

/**
 * Generate WebSite schema.org markup with search action
 */
export function getWebSiteSchema(locale: SupportedLocale): WebSiteSchema {
  const baseUrl = "https://sastify.com";
  const translations = {
    en: {
      name: "SASTify",
      description: "AI-powered Static Application Security Testing Platform",
    },
    ar: {
      name: "SASTify",
      description: "منصة اختبار الأمان الثابت مدعومة بالذكاء الاصطناعي",
    },
  };

  const t = translations[locale];
  const langCode = locale === "ar" ? "ar-AE" : "en-US";

  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: t.name,
    description: t.description,
    url: baseUrl,
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${baseUrl}/search?q={search_term_string}`,
      },
      query_input: "required name=search_term_string",
    },
    inLanguage:["en", "ar"],
  };
}

/**
 * Generate BreadcrumbList schema.org markup
 */
export function getBreadcrumbSchema(
  items: Array<{ name: string; url: string }>,
  locale: SupportedLocale
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

/**
 * Generate FAQPage schema.org markup
 */
export function getFAQSchema(
  faqs: Array<{ question: string; answer: string }>,
  locale: SupportedLocale
) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };
}

/**
 * Combine multiple schemas into a single JSON-LD script
 */
export function combineSchemas(...schemas: unknown[]) {
  return {
    "@context": "https://schema.org",
    "@graph": schemas,
  };
}

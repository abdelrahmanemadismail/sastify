/**
 * SEO Metadata Configuration for SASTify
 * Supports multiple locales (en, ar) with tailored metadata
 */

export type SupportedLocale = "en" | "ar";

export interface MetadataConfig {
  locale: SupportedLocale;
  title: string;
  description: string;
  keywords: string[];
  canonicalUrl?: string;
  ogImage?: string;
  ogType?: string;
  twitterHandle?: string;
  alternateLocales?: SupportedLocale[];
}

// SEO Tags list
export const SEO_TAGS = [
  "SAST tool",
  "static application security testing",
  "AI code security",
  "Semgrep integration",
  "automated code review",
  "DevSecOps tools",
  "python security scanner",
  "nodejs security scanner",
  "automated vulnerability remediation",
  "AI code fix",
  "secure code review",
  "OWASP top 10 scanner",
  "application security platform",
  "developer security tools",
  "SASTify",
  "cybersecurity automation",
  "code vulnerability scanner",
  "static code analysis",
  "software composition analysis",
  "secure software development life cycle",
  "SSDLC",
  "CI/CD security",
  "pipeline security tools",
  "AI in cybersecurity",
  "automated security reporting",
  "compliance reporting tools",
  "PDF security report generator",
  "HTML security report",
  "whitebox testing",
  "source code analysis",
  "vulnerability management",
  "security audit tools",
  "code quality tools",
  "technical debt reduction",
  "secure coding practices",
  "CWE detection",
  "SQL injection scanner",
  "XSS scanner",
  "insecure deserialization detection",
  "command line security tool",
  "CLI security scanner",
  "enterprise code security",
  "software security solutions",
  "automated debugging",
  "developer productivity tools",
  "fast security scanning",
  "low false positive scanner",
  "security compliance software",
  "appsec tools",
  "intelligent code repair",
  "generative AI for security",
  "automated bug patching",
  "secure coding assistant",
  "continuous security verification",
  "shift left security",
  "DevSecOps automation",
  "agile security testing",
  "code hardening tool",
];

// Metadata for different locales
export const METADATA_BY_LOCALE: Record<SupportedLocale, Omit<MetadataConfig, "locale">> = {
  en: {
    title: "SASTify | AI-Powered SAST Tool for Secure Code",
    description:
      "Secure Your Codebase with SASTify: The AI-Powered Static Analysis & Remediation Tool. Discover SASTify, the next-generation Static Application Security Testing (SAST) solution designed for modern DevSecOps workflows. In an era where software supply chain attacks, zero-day exploits, and code vulnerabilities are escalating, SASTify offers a proactive shield of intelligence for your applications. By combining the industry-leading speed of the Semgrep scanning engine with advanced AI-driven remediation, SASTify delivers a comprehensive security experience that goes far beyond simple bug detection.",
    keywords: SEO_TAGS,
    canonicalUrl: "https://sastify.com",
    ogType: "website",
    twitterHandle: "@SASTifyAI",
  },
  ar: {
    title: "SASTify | أداة SAST مدعومة بالذكاء الاصطناعي للكود الآمن",
    description:
      "أمّن قاعدة الكود الخاصة بك باستخدام SASTify: أداة التحليل الثابت والإصلاح المدعومة بالذكاء الاصطناعي. اكتشف SASTify، حل Static Application Security Testing (SAST) من الجيل الجديد المصمم لسير عمل DevSecOps الحديث. في عصر تتصاعد فيه هجمات سلسلة التوريد البرمجية، والثغرات الأمنية، والثغرات في الكود، يوفر SASTify درعًا استباقيًا من الذكاء لتطبيقاتك. من خلال الجمع بين السرعة الرائدة في الصناعة لمحرك Semgrep مع الإصلاح المدعوم بالذكاء الاصطناعي المتقدم، يقدم SASTify تجربة أمان شاملة تتجاوز بكثير الكشف البسيط عن الأخطاء.",
    keywords: SEO_TAGS,
    canonicalUrl: "https://sastify.com/ar",
    ogType: "website",
    twitterHandle: "@SASTifyAI",
  },
};

// Page-specific metadata
export const PAGE_METADATA = {
  home: {
    en: {
      title: "SASTify - The Future of Intelligent, Automated Code Security",
      description:
        "Transform how you secure code. SASTify combines Semgrep's lightning-fast scanning with AI-driven remediation. Detect SQL injection, XSS, and critical vulnerabilities. Get actionable fixes instantly. Join the security revolution.",
      keywords: [
        "code security",
        "vulnerability detection",
        "secure development",
        "developer security",
        ...SEO_TAGS.slice(0, 10),
      ],
    },
    ar: {
      title: "SASTify - مستقبل أمان الكود الذكي والمؤتمت",
      description:
        "غيّر طريقة تأمين الكود. يجمع SASTify بين المسح السريع من Semgrep والإصلاح المدعوم بالذكاء الاصطناعي. اكتشف حقن SQL و XSS والثغرات الحرجة. احصل على إصلاحات قابلة للتنفيذ على الفور. انضم إلى ثورة الأمان.",
      keywords: [
        "أمان الكود",
        "الكشف عن الثغرات",
        "التطوير الآمن",
        "أمان المطورين",
        ...SEO_TAGS.slice(0, 10),
      ],
    },
  },
  waitingList: {
    en: {
      title: "Join SASTify - Security Made Simple for Developers",
      description:
        "Join the SASTify waiting list and be among the first to access the future of automated code security. Get early access to AI-powered vulnerability detection and intelligent remediation. Transform your development workflow with next-generation SAST technology.",
      keywords: [
        "early access",
        "security platform",
        "developer tools",
        "code scanning",
        ...SEO_TAGS.slice(0, 8),
      ],
    },
    ar: {
      title: "انضم إلى SASTify - أمان التطبيقات مُبسّط للمطورين",
      description:
        "انضم إلى قائمة انتظار SASTify وكن من بين الأوائل الذين سيحصلون على الوصول إلى مستقبل أمان الكود المؤتمت. احصل على وصول مبكر إلى الكشف عن الثغرات المدعوم بالذكاء الاصطناعي والإصلاح الذكي. حوّل سير عمل التطوير الخاص بك باستخدام تكنولوجيا SAST من الجيل القادم.",
      keywords: [
        "وصول مبكر",
        "منصة الأمان",
        "أدوات المطورين",
        "فحص الكود",
        ...SEO_TAGS.slice(0, 8),
      ],
    },
  },
};

/**
 * Get metadata config for a specific page and locale
 */
export function getMetadataConfig(locale: SupportedLocale, page: "home" | "waitingList" = "home"): MetadataConfig {
  const baseMetadata = METADATA_BY_LOCALE[locale];
  const pageMetadata = PAGE_METADATA[page]?.[locale];

  return {
    locale,
    title: pageMetadata?.title || baseMetadata.title,
    description: pageMetadata?.description || baseMetadata.description,
    keywords: pageMetadata?.keywords || baseMetadata.keywords,
    canonicalUrl: baseMetadata.canonicalUrl,
    ogImage: baseMetadata.ogImage || "https://sastify.com/og-image.png",
    ogType: baseMetadata.ogType,
    twitterHandle: baseMetadata.twitterHandle,
  };
}

/**
 * Generate Open Graph metadata object
 */
export function getOpenGraphMetadata(config: MetadataConfig) {
  return {
    title: config.title,
    description: config.description,
    url: config.canonicalUrl,
    type: (config.ogType || "website") as "website" | "article",
    images: [
      {
        url: config.ogImage || "https://sastify.com/og-image.png",
        width: 1200,
        height: 630,
        alt: config.title,
      },
    ],
  };
}

/**
 * Generate Twitter Card metadata object
 */
export function getTwitterMetadata(config: MetadataConfig) {
  return {
    card: "summary_large_image",
    title: config.title,
    description: config.description,
    images: [config.ogImage || "https://sastify.com/og-image.png"],
    creator: config.twitterHandle,
    site: config.twitterHandle,
  };
}

/**
 * Verify locale is valid
 */
export function isValidLocale(locale: unknown): locale is SupportedLocale {
  return locale === "en" || locale === "ar";
}

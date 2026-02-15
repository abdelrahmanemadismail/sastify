import type { Metadata } from "next";
import { HeroSection } from "@/components/landing/hero-section";
import { WhySastify } from "@/components/landing/why-sastify";
import { HowItWorks } from "@/components/landing/how-it-works";
import { LearningPlatforms } from "@/components/landing/learning-platforms";
import { LanguageSupport } from "@/components/landing/language-support";
import { ContactSection } from "@/components/landing/contact-section";
import { ScrollToTopButton } from "@/components/scroll-to-top-button";
import { PAGE_METADATA, isValidLocale } from "@/lib/seo-metadata";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale: rawLocale } = await params;
  const locale = isValidLocale(rawLocale) ? rawLocale : "en";
  const metadata = PAGE_METADATA.home[locale];

  return {
    title: metadata.title,
    description: metadata.description,
    keywords: metadata.keywords,
    openGraph: {
      title: metadata.title,
      description: metadata.description,
      type: "website",
      url: locale === "ar" ? "https://sastify.com/ar" : "https://sastify.com",
    },
    alternates: {
      canonical:
        locale === "ar"
          ? "https://sastify.com/ar"
          : "https://sastify.com",
      languages: {
        en: "https://sastify.com",
        ar: "https://sastify.com/ar",
      },
    },
  };
}

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col">
      <div className="space-y-0 py-20">
        <HeroSection />
        <WhySastify />
        <HowItWorks />
        <LearningPlatforms />
        <LanguageSupport />
        <ContactSection />
      </div>
      <ScrollToTopButton />
    </main>
  );
}

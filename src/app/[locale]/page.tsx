import { Header } from "@/components/landing/header";
import { HeroSection } from "@/components/landing/hero-section";
import { WhySastify } from "@/components/landing/why-sastify";
import { HowItWorks } from "@/components/landing/how-it-works";
import { LearningPlatforms } from "@/components/landing/learning-platforms";
import { LanguageSupport } from "@/components/landing/language-support";
import { ContactSection } from "@/components/landing/contact-section";
import { Footer } from "@/components/landing/footer";
import { ScrollToTopButton } from "@/components/scroll-to-top-button";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col">
      <Header />
      <div className="space-y-0 py-20">
        <HeroSection />
        <WhySastify />
        <HowItWorks />
        <LearningPlatforms />
        <LanguageSupport />
        <ContactSection />
      </div>
      <Footer />
      <ScrollToTopButton />
    </main>
  );
}

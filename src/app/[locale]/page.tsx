import { HeroSection } from "@/components/landing/hero-section";
import { Header } from "@/components/landing/header";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col py-20">
      <Header />
      <HeroSection />
    </main>
  );
}

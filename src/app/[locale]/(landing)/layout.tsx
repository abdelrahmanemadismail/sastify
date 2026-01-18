import { Footer } from "@/components/landing/footer";
import { Header } from "@/components/landing/header";

export default async function LandingLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  return (<>
      <Header />
      {children}
      <Footer />
  </>
  );
}

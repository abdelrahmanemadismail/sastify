import type { Metadata } from "next";
import { Poppins, Tajawal } from "next/font/google";
import "../globals.css";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { ThemeProvider } from "@/components/theme-provider";
import { ThemeFavicon } from "@/components/theme-favicon";
import { METADATA_BY_LOCALE, isValidLocale } from "@/lib/seo-metadata";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const tajawal = Tajawal({
  variable: "--font-tajawal",
  subsets: ["arabic"],
  weight: ["400", "500", "700"],
});

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale: rawLocale } = await params;
  const locale = isValidLocale(rawLocale) ? rawLocale : "en";
  const metadata = METADATA_BY_LOCALE[locale];

  return {
    title: {
      template: `%s | SASTify`,
      default: metadata.title,
    },
    description: metadata.description,
    keywords: metadata.keywords,
    metadataBase: new URL("https://sastify.com"),
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
    verification: {
      google: "google-site-verification-code",
      other: {
        "msvalidate.01": "msvalidate-code",
      },
    },
    openGraph: {
      title: metadata.title,
      description: metadata.description,
      url: metadata.canonicalUrl,
      siteName: "SASTify",
      type: "website",
      images: [
        {
          url: "https://sastify.com/og-image.png",
          width: 1200,
          height: 630,
          alt: metadata.title,
          type: "image/png",
        },
      ],
      locale: locale === "ar" ? "ar_AE" : "en_US",
      alternateLocale: locale === "ar" ? "en_US" : "ar_AE",
    },
    twitter: {
      card: "summary_large_image",
      title: metadata.title,
      description: metadata.description,
      creator: metadata.twitterHandle,
      site: metadata.twitterHandle,
      images: ["https://sastify.com/og-image.png"],
    },
    icons: {
      icon: "/favicon.ico",
      apple: "/apple-icon.png",
    },
    appleWebApp: {
      capable: true,
      statusBarStyle: "black-translucent",
      title: "SASTify",
    },
    authors: [
      {
        name: "SASTify Team",
        url: "https://sastify.com",
      },
    ],
    creator: "SASTify Team",
    category: "Technology",
    manifest: "/site.webmanifest",
  };
}

export default async function RootLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;
  const messages = await getMessages();

  return (
    <html lang={locale} dir={locale === "ar" ? "rtl" : "ltr"} suppressHydrationWarning>
      <body
        className={`${poppins.variable} ${tajawal.variable} antialiased ${locale === "ar" ? "font-tajawal" : "font-poppins"}`}
      >
        <NextIntlClientProvider messages={messages} locale={locale}>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <ThemeFavicon />
            {children}
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}

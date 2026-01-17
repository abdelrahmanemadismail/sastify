"use client";

import { useLocale } from "next-intl";
import { useRouter, usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";

export function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const toggleLanguage = () => {
    const newLocale = locale === "en" ? "ar" : "en";
    // Remove old locale prefix from pathname if it exists
    let cleanPath = pathname;
    if (pathname.startsWith("/en")) {
      cleanPath = pathname.slice(3); // Remove /en
    } else if (pathname.startsWith("/ar")) {
      cleanPath = pathname.slice(3); // Remove /ar
    }
    const newPathname = `/${newLocale}${cleanPath}`;
    router.push(newPathname);
  };

  return (
    <Button variant="outline" size="sm" onClick={toggleLanguage}>
      {locale === "en" ? "العربية" : "English"}
    </Button>
  );
}

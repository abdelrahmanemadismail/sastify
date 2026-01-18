"use client";

import { useLocale } from "next-intl";
import { useRouter, usePathname } from "next/navigation";
import { Languages } from "lucide-react";
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
    <Button
      variant="outline"
      size="icon"
      onClick={toggleLanguage}
      className="rounded-full h-10 w-10 border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
    >
      <Languages className="h-[1.2rem] w-[1.2rem]" />
      <span className="sr-only">Toggle language</span>
    </Button>
  );
}




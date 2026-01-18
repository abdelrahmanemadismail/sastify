"use client";

import * as React from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { Menu } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from "@/components/ui/sheet";
import { LogoIcon } from "@/components/logo/logo-icon";
import { LogoText } from "@/components/logo/logo-text";
import { ModeToggle } from "@/components/theme-toggle";
import { LanguageSwitcher } from "@/components/language-switcher";

export function Header() {
  const t = useTranslations("header");
  const [isScrolled, setIsScrolled] = React.useState(false);

  // Handle scroll effect for transparency/blur changes
  React.useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: t("home"), href: "/" },
    { name: t("features"), href: "#features" },
    { name: t("pricing"), href: "#pricing" },
    { name: t("education"), href: "#education" },
    { name: t("contact"), href: "#contact" },
  ];

  return (
    <header className="fixed top-9 left-0 right-0 z-50 flex justify-center px-4 pointer-events-none">
      {/* Main Container - Glassmorphism design from Figma
        - Pill shape (rounded-full)
        - Subtle transparent background rgba(0, 0, 0, 0.004)
        - Glass effect with inset blue glow
        - Blue shadow 0px 4px 25px rgba(27, 35, 113, 0.5)
      */}
      <div
        className={cn(
          "pointer-events-auto flex flex-row items-center justify-center px-12 py-7 gap-14",
          "w-full max-w-7xl rounded-full transition-all duration-300",
          "bg-black/[0.004] backdrop-blur-md",
          "shadow-[0px_4px_25px_rgba(27,35,113,0.5),inset_4px_4px_4px_rgba(185,180,255,0.3)]",
          isScrolled ? "shadow-[0px_6px_35px_rgba(27,35,113,0.6),inset_4px_4px_4px_rgba(185,180,255,0.4)]" : ""
        )}
      >
        {/* Logo Section */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <Link href="/" className="flex items-center gap-2 group/logo transition-all duration-300">
            <div className="relative">
              <LogoIcon className="h-8 w-8 text-white transition-all duration-300 group-hover/logo:scale-110" />
            </div>
            <LogoText className="h-8 transition-all duration-300 group-hover/logo:opacity-80" />
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center justify-center gap-10 flex-1">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className="text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors duration-200"
            >
              {link.name}
            </Link>
          ))}
        </nav>

        {/* Desktop Actions */}
        <div className="hidden lg:flex items-center gap-4 shrink-0">
          {/* Theme Toggle */}
          <ModeToggle />

          {/* Language Switcher */}
          <LanguageSwitcher />

          {/* 'Try now' - Blue gradient button from Figma */}
          <Button
            className={cn(
              "rounded-full px-5 py-2 text-sm font-medium",
              "w-auto h-auto",
              "flex flex-row justify-center items-center gap-2.5",
              "bg-gradient-to-r",
              "from-[#0A0C1C] to-[#1B2371]",
              "text-white",
              "border border-[#1B2371]",
              "shadow-[0px_4px_25px_rgba(27,35,113,0.5),inset_4px_4px_4px_rgba(185,180,255,0.3)]",
              "hover:shadow-[0px_6px_30px_rgba(27,35,113,0.6),inset_4px_4px_4px_rgba(185,180,255,0.4)]",
              "transition-all duration-300"
            )}
          >
            {t("tryNow")}
          </Button>

          {/* 'Learn now' - Gradient button from Figma */}
          <Button
            className={cn(
              "rounded-full px-5 py-2 text-sm font-medium",
              "w-auto h-auto",
              "flex flex-row justify-center items-center gap-2.5",
              "bg-gradient-to-r",
              "from-[#0A0C1F] to-[#CD202F]",
              "text-white",
              "border border-[#CD202F]",
              "shadow-[0px_4px_25px_rgba(27,35,113,0.5),inset_4px_4px_4px_rgba(185,180,255,0.3)]",
              "hover:shadow-[0px_6px_30px_rgba(27,35,113,0.6),inset_4px_4px_4px_rgba(185,180,255,0.4)]",
              "transition-all duration-300"
            )}
          >
            {t("learnNow")}
          </Button>
        </div>

        {/* Mobile Menu Trigger */}
        <div className="lg:hidden flex-shrink-0">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="text-gray-700 dark:text-white hover:bg-white/10">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="top" className="w-full bg-white/95 dark:bg-black/95 backdrop-blur-xl border-b border-gray-200 dark:border-white/10 text-gray-900 dark:text-white pt-20">
              <SheetTitle className="sr-only">Mobile Menu</SheetTitle>
              <div className="flex flex-col gap-6 items-center">
                {navLinks.map((link) => (
                  <Link
                    key={link.name}
                    href={link.href}
                    className="text-lg font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                  >
                    {link.name}
                  </Link>
                ))}

                {/* Mobile Theme Toggle and Language Switcher */}
                <div className="flex items-center gap-3 mt-4 pt-4 border-t border-gray-200 dark:border-white/10 w-full justify-center">
                  <ModeToggle />
                  <LanguageSwitcher />
                </div>

                <div className="flex flex-col gap-4 mt-4 w-full max-w-xs">
                  <Button className={cn(
                    "w-full rounded-full px-5 py-2 text-sm font-medium",
                    "bg-gradient-to-r from-[#0A0C1C] to-[#1B2371]",
                    "text-white",
                    "border border-[#1B2371]",
                    "shadow-[0px_4px_25px_rgba(27,35,113,0.5),inset_4px_4px_4px_rgba(185,180,255,0.3)]",
                    "hover:shadow-[0px_6px_30px_rgba(27,35,113,0.6),inset_4px_4px_4px_rgba(185,180,255,0.4)]",
                    "transition-all duration-300"
                  )}>{t("tryNow")}</Button>
                  <Button className={cn(
                    "w-full rounded-full px-5 py-2 text-sm font-medium",
                    "bg-gradient-to-r from-[#0A0C1F] to-[#CD202F]",
                    "text-white",
                    "border border-[#CD202F]",
                    "shadow-[0px_4px_25px_rgba(27,35,113,0.5),inset_4px_4px_4px_rgba(185,180,255,0.3)]",
                    "hover:shadow-[0px_6px_30px_rgba(27,35,113,0.6),inset_4px_4px_4px_rgba(185,180,255,0.4)]",
                    "transition-all duration-300"
                  )}>{t("learnNow")}</Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
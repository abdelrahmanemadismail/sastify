"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import {
  LayoutGrid,
  Search,
  Folder,
  BarChart3,
  Users,
  Bell,
  Settings,
  Menu,
  HelpCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Logo } from "@/components/logo";
import { ModeToggle } from "@/components/theme-toggle";
import { LanguageSwitcher } from "@/components/language-switcher";
import { NavItem } from "./nav-item";
import { cn } from "@/lib/utils";

interface SidebarProps {
  children: React.ReactNode;
}

export function Sidebar({ children }: SidebarProps) {
  const pathname = usePathname();
  const locale = useLocale();
  const t = useTranslations();
  const [isOpen, setIsOpen] = useState(false);

  // Remove locale prefix from pathname for comparison
  const pathWithoutLocale = pathname.replace(`/${locale}`, "") || "/";

  const mainMenuItems = [
    {
      href: "/dashboard",
      label: t("dashboard.dashboard") || "Dashboard",
      icon: LayoutGrid,
    },
    {
      href: "/dashboard/scans",
      label: t("dashboard.new_scan") || "New Scan",
      icon: Search,
    },
  ];

  const workspaceItems = [
    {
      href: "/dashboard/projects",
      label: t("dashboard.projects") || "Projects",
      icon: Folder,
    },
    {
      href: "/dashboard/reports",
      label: t("dashboard.security_reports") || "Security Reports",
      icon: BarChart3,
    },
    {
      href: "/dashboard/members",
      label: t("dashboard.members") || "Members",
      icon: Users,
    },
    {
      href: "/dashboard/updates",
      label: t("dashboard.updates") || "Updates",
      icon: Bell,
    },
  ];

  const generalItems = [
    {
      href: "/dashboard/settings",
      label: t("dashboard.settings") || "Settings",
      icon: Settings,
    },
  ];

  const isItemActive = (href: string) => {
    const normalizedPath = href.replace(/\/$/, "");
    const normalizedCurrent = pathWithoutLocale.replace(/\/$/, "");
    return normalizedCurrent === normalizedPath;
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-sidebar text-sidebar-foreground">
      {/* Logo Section */}
      <div className="p-6 border-b border-sidebar-border">
        <Logo
          href={`/${locale}/dashboard`}
          showText={true}
          iconClassName="h-7 w-7"
          textClassName="h-7"
          className="hover:opacity-80 transition-opacity"
        />
      </div>

      {/* Navigation Sections */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Main Menu */}
        <div>
          <p className="text-xs font-semibold uppercase text-sidebar-foreground/60 tracking-wide px-2 mb-3">
            {t("dashboard.main_menu") || "Main Menu"}
          </p>
          <div className="space-y-2">
            {mainMenuItems.map((item) => (
              <NavItem
                key={item.href}
                href={item.href}
                label={item.label}
                icon={item.icon}
                isActive={isItemActive(item.href)}
                onClick={() => setIsOpen(false)}
              />
            ))}
          </div>
        </div>

        {/* Workspace */}
        <div>
          <p className="text-xs font-semibold uppercase text-sidebar-foreground/60 tracking-wide px-2 mb-3">
            {t("dashboard.workspace") || "Workspace"}
          </p>
          <div className="space-y-2">
            {workspaceItems.map((item) => (
              <NavItem
                key={item.href}
                href={item.href}
                label={item.label}
                icon={item.icon}
                isActive={isItemActive(item.href)}
                onClick={() => setIsOpen(false)}
              />
            ))}
          </div>
        </div>

        {/* General */}
        <div>
          <p className="text-xs font-semibold uppercase text-sidebar-foreground/60 tracking-wide px-2 mb-3">
            {t("dashboard.general") || "General"}
          </p>
          <div className="space-y-2">
            {generalItems.map((item) => (
              <NavItem
                key={item.href}
                href={item.href}
                label={item.label}
                icon={item.icon}
                isActive={isItemActive(item.href)}
                onClick={() => setIsOpen(false)}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Help Card and Controls */}
      <div className="p-4 space-y-4 border-t border-sidebar-border">
        {/* Help Card */}
        <div className="bg-primary rounded-lg p-4 relative overflow-hidden">
          <div className="absolute top-2 right-2 w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
            <HelpCircle className="w-5 h-5 text-primary-foreground" />
          </div>
          <p className="text-sm font-semibold text-primary-foreground mb-3">
            {t("dashboard.need_help") || "Need Help with SASTify?"}
          </p>
          <Button
            variant="secondary"
            size="sm"
            className="w-full bg-card hover:bg-card/90"
            onClick={() => setIsOpen(false)}
          >
            {t("dashboard.contact_us") || "Contact us now"}
          </Button>
        </div>

        {/* Theme and Language Controls */}
        <div className="flex items-center justify-center gap-2">
          <ModeToggle />
          <LanguageSwitcher />
        </div>
      </div>
    </div>
  );

  return (
    <div className={cn("flex h-screen overflow-hidden", locale === "ar" && "flex-row-reverse")}>
      {/* Mobile Sidebar */}
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              "fixed top-4 z-40 md:hidden",
              locale === "ar" ? "right-4" : "left-4"
            )}
          >
            <Menu className="w-6 h-6" />
          </Button>
        </SheetTrigger>
        <SheetContent side={locale === "ar" ? "right" : "left"} className="w-64 p-0">
          <SidebarContent />
        </SheetContent>
      </Sheet>

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-sidebar border-r border-sidebar-border h-screen rounded-r-3xl m-4 shadow-lg">
        <SidebarContent />
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  );
}

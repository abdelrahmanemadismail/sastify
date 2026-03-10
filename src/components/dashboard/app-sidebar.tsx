"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import Link from "next/link";
import {
  LayoutGrid,
  Search,
  Folder,
  BarChart3,
  // Users,
  Bell,
  Settings,
  HelpCircle,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Logo } from "@/components/logo";
import { ModeToggle } from "@/components/theme-toggle";
import { LanguageSwitcher } from "@/components/language-switcher";
import { Button } from "@/components/ui/button";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname();
  const locale = useLocale();
  const t = useTranslations();

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
    // {
    //   href: "/dashboard/members",
    //   label: t("dashboard.members") || "Members",
    //   icon: Users,
    // },
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

  return (
    <Sidebar
      collapsible="icon"
      side={locale === "ar" ? "right" : "left"}
      {...props}
    >
      <SidebarHeader>
        <div className="flex items-center gap-2 px-2 py-2 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-1">
          <Logo
            href={`/${locale}/dashboard`}
            showText={true}
            iconClassName="h-6 w-6 group-data-[collapsible=icon]:h-8 group-data-[collapsible=icon]:w-8 group-data-[collapsible=icon]:mx-auto transition-all"
            textClassName="h-6 group-data-[collapsible=icon]:hidden"
            className="w-full justify-start group-data-[collapsible=icon]:justify-center hover:opacity-80 transition-opacity"
          />
        </div>
      </SidebarHeader>

      <SidebarContent>
        {/* Main Menu */}
        <SidebarGroup>
          <SidebarGroupLabel>
            {t("dashboard.main_menu") || "Main Menu"}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainMenuItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    asChild
                    isActive={isItemActive(item.href)}
                  >
                    <Link href={`/${locale}${item.href}`}>
                      <item.icon />
                      <span>{item.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Workspace */}
        <SidebarGroup>
          <SidebarGroupLabel>
            {t("dashboard.workspace") || "Workspace"}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {workspaceItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    asChild
                    isActive={isItemActive(item.href)}
                  >
                    <Link href={`/${locale}${item.href}`}>
                      <item.icon />
                      <span>{item.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* General */}
        <SidebarGroup>
          <SidebarGroupLabel>
            {t("dashboard.general") || "General"}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {generalItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    asChild
                    isActive={isItemActive(item.href)}
                  >
                    <Link href={`/${locale}${item.href}`}>
                      <item.icon />
                      <span>{item.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        {/* Help Card */}
        <div className="p-2 space-y-2">
          <div className="bg-primary rounded-lg p-3 relative overflow-hidden group-data-[collapsible=icon]:hidden">
            <div className="absolute top-2 right-2 w-6 h-6 bg-primary-foreground/20 rounded-full flex items-center justify-center">
              <HelpCircle className="w-4 h-4 text-primary-foreground" />
            </div>
            <p className="text-xs font-semibold text-primary-foreground mb-2">
              {t("dashboard.need_help") || "Need Help with SASTify?"}
            </p>
            <Button
              variant="secondary"
              size="sm"
              className="w-full h-8 text-xs bg-card hover:bg-card/90"
            >
              {t("dashboard.contact_us") || "Contact us now"}
            </Button>
          </div>

          {/* Theme and Language Controls */}
          <div className="flex items-center justify-center gap-2 pt-2 group-data-[collapsible=icon]:flex-col">
            <ModeToggle />
            <LanguageSwitcher />
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}

"use client";

import Link from "next/link";
import { useLocale } from "next-intl";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface NavItemProps {
  href: string;
  label: string;
  icon: LucideIcon;
  isActive: boolean;
  onClick?: () => void;
}

export function NavItem({
  href,
  label,
  icon: Icon,
  isActive,
  onClick,
}: NavItemProps) {
  const locale = useLocale();
  const localizedHref = `/${locale}${href}`;

  const baseStyles =
    "flex items-center gap-3 px-4 py-3 rounded-lg font-medium text-base transition-all duration-200";
  const activeStyles = isActive
    ? "bg-sidebar-primary text-sidebar-primary-foreground"
    : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground";

  return (
    <Link
      href={localizedHref}
      onClick={onClick}
      className={cn(baseStyles, activeStyles)}
    >
      <Icon className="w-5 h-5" />
      <span>{label}</span>
    </Link>
  );
}

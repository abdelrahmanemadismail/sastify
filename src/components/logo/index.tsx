"use client";

import Link from "next/link";
import { LogoIcon } from "./logo-icon";
import { LogoText } from "./logo-text";
import { cn } from "@/lib/utils";

interface LogoProps {
  href?: string;
  className?: string;
  showText?: boolean;
  textClassName?: string;
  iconClassName?: string;
}

export function Logo({
  href = "/",
  className,
  showText = true,
  textClassName = "h-8 transition-all duration-300 group-hover/logo:opacity-80",
  iconClassName = "h-8 w-8 text-white transition-all duration-300 group-hover/logo:scale-110",
}: LogoProps) {
  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-2 group/logo transition-all duration-300",
        className
      )}
    >
      <div className="relative">
        <LogoIcon className={iconClassName} />
      </div>
      {showText && <LogoText className={textClassName} />}
    </Link>
  );
}

export { LogoIcon } from "./logo-icon";
export { LogoText } from "./logo-text";

"use client";

import Image from "next/image";
import { useTheme } from "next-themes";
import { useLayoutEffect, useState } from "react";

export function DashboardPreview() {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Prevent hydration mismatch
  useLayoutEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  const isDark = theme === "dark" || (theme === "system" && typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches);

  return (
    <div className="relative bg-linear-to-b from-background/40 to-background/60 backdrop-blur-xl border border-border rounded-3xl overflow-hidden shadow-2xl">
      <div className="relative w-full aspect-16/10">
        <Image
          src={isDark ? "/DashboardHome-Darkmode.png" : "/DashboardHome.png"}
          alt="SASTify Dashboard"
          fill
          className="object-cover"
          priority
        />
      </div>
    </div>
  );
}

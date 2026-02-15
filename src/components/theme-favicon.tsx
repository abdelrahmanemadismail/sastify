"use client";

import { useTheme } from "next-themes";
import { useEffect } from "react";

/**
 * Theme-Aware Favicon Component
 * Switches favicon based on system/user theme preference
 */
export function ThemeFavicon() {
  const { theme, systemTheme } = useTheme();

  useEffect(() => {
    const currentTheme = theme === "system" ? systemTheme : theme;
    const favicon = document.querySelector('link[rel="icon"]') as HTMLLinkElement;

    if (!favicon) return;

    // Update favicon based on theme
    if (currentTheme === "dark") {
      favicon.href = "/favicon-dark.ico";
    } else {
      favicon.href = "/favicon-light.ico";
    }
  }, [theme, systemTheme]);

  return null;
}

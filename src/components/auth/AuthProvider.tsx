"use client";

import { ReactNode, useEffect } from "react";
import { initializeAuthStore } from "@/lib/auth-store";

export function AuthProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    // Initialize auth store from sessionStorage
    initializeAuthStore();
  }, []);

  return <>{children}</>;
}

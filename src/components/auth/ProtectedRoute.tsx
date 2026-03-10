"use client";

import { ReactNode, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";

interface ProtectedRouteProps {
  children: ReactNode;
  requireActivation?: boolean;
}

export function ProtectedRoute({ children, requireActivation = true }: ProtectedRouteProps) {
  const router = useRouter();
  const { isAuthenticated, isAccountActivated, isInitialized } = useAuth();

  useEffect(() => {
    if (!isInitialized) return;

    if (!isAuthenticated) {
      router.push("/auth/login");
      return;
    }

    if (requireActivation && !isAccountActivated) {
      router.push("/auth/activate");
    }
  }, [isAuthenticated, isAccountActivated, isInitialized, router, requireActivation]);

  if (!isInitialized || !isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

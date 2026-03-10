"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { authService } from "@/lib/auth-service";

/**
 * Root-level activation route (no locale required)
 * Activates account and redirects to locale-aware login
 * Useful for email links that don't know user's locale preference
 */
export default function RootActivatePage() {
  const router = useRouter();
  const params = useParams();
  const token = params.token as string;

  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const activate = async () => {
      try {
        await authService.activateAccountByLink(token);
        setStatus("success");
        // Redirect to en/auth/login by default, backend can detect locale later
        setTimeout(() => {
          router.push("/en/auth/login?activated=true");
        }, 2000);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Activation failed");
        setStatus("error");
      }
    };

    if (token) {
      activate();
    }
  }, [token, router]);

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-2 text-center">
        <div className="space-y-2">
          <h1 className="text-2xl font-bold">Activating Account...</h1>

          {status === "loading" && (
            <p className="text-sm text-gray-600">Please wait...</p>
          )}

          {status === "success" && (
            <div className="rounded-md bg-green-50 p-4">
              <p className="text-sm text-green-800">
                Account activated successfully!
              </p>
              <p className="mt-2 text-xs text-green-700">
                Redirecting to login...
              </p>
            </div>
          )}

          {status === "error" && (
            <div className="rounded-md bg-red-50 p-4">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

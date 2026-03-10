"use client";

import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { authService } from "@/lib/auth-service";

export default function ActivateLinkPage() {
  const t = useTranslations();
  const params = useParams();
  const router = useRouter();
  const token = params.token as string;

  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const activate = async () => {
      try {
        await authService.activateAccountByLink(token);
        setStatus("success");
        setTimeout(() => {
          router.push("/auth/login");
        }, 2000);
      } catch (err) {
        setError(err instanceof Error ? err.message : t("error.unknown"));
        setStatus("error");
      }
    };

    if (token) {
      activate();
    }
  }, [token, router, t]);

  return (
    <div className="w-full max-w-md space-y-2 text-center">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold">{t("auth.activating_account")}</h1>

        {status === "loading" && (
          <p className="text-sm text-muted-foreground">{t("common.please_wait")}</p>
        )}

        {status === "success" && (
          <div className="rounded-md bg-green-50 p-4 dark:bg-green-900/20">
            <p className="text-sm text-green-800 dark:text-green-400">
              {t("auth.account_activated_success")}
            </p>
            <p className="mt-2 text-xs text-green-700 dark:text-green-300">
              {t("auth.redirecting_to_login")}
            </p>
          </div>
        )}

        {status === "error" && (
          <div className="rounded-md bg-red-50 p-4 dark:bg-red-900/20">
            <p className="text-sm text-red-800 dark:text-red-400">{error}</p>
          </div>
        )}
      </div>
    </div>
  );
}

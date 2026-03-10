"use client";

import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function ResetSuccessPage() {
  const t = useTranslations();
  const router = useRouter();

  return (
    <div className="w-full max-w-md space-y-4 text-center">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-emerald-500/40 bg-emerald-500/10">
        <svg
          viewBox="0 0 24 24"
          className="h-8 w-8 text-emerald-500"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M20 6 9 17l-5-5" />
        </svg>
      </div>

      <div className="space-y-2">
        <h1 className="text-2xl font-bold">{t("auth.reset_success_title")}</h1>
        <p className="text-sm text-muted-foreground">
          {t("auth.reset_success_description")}
        </p>
      </div>

      <Button onClick={() => router.push("/auth/login")} className="w-full">
        {t("auth.login_with_new_password")}
      </Button>
    </div>
  );
}

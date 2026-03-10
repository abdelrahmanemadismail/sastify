"use client";

import { useTranslations } from "next-intl";
import { ActivationForm } from "@/components/auth/ActivationForm";

export default function ActivatePage() {
  const t = useTranslations();

  return (
    <div className="w-full max-w-md space-y-2">
      <div className="text-center">
        <h1 className="text-2xl font-bold">{t("auth.verify_email")}</h1>
        <p className="text-sm text-muted-foreground">
          {t("auth.enter_code_sent_to_email")}
        </p>
      </div>

      <ActivationForm />
    </div>
  );
}

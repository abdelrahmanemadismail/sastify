"use client";

import { useTranslations } from "next-intl";
import { ForgotPasswordVerificationForm } from "@/components/auth/ForgotPasswordVerificationForm";

export default function VerifyCodePage() {
  const t = useTranslations();

  return (
    <div className="w-full max-w-md space-y-2">
      <div className="text-center">
        <h1 className="text-2xl font-bold">{t("auth.verification_title")}</h1>
        <p className="text-sm text-muted-foreground">
          {t("auth.verification_description")}
        </p>
      </div>

      <ForgotPasswordVerificationForm />
    </div>
  );
}

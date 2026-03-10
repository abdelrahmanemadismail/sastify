"use client";

import { useTranslations } from "next-intl";
import { ForgotPasswordForm } from "@/components/auth/ForgotPasswordForm";

export default function ForgotPasswordPage() {
  const t = useTranslations();

  return (
    <div className="w-full max-w-md space-y-2">
      <div className="text-center">
        <h1 className="text-2xl font-bold">{t("auth.forgot_password_title")}</h1>
        <p className="text-sm text-muted-foreground">
          {t("auth.forgot_password_description")}
        </p>
      </div>

      <ForgotPasswordForm />
    </div>
  );
}

"use client";

import { useTranslations } from "next-intl";
import { ResetPasswordForm } from "@/components/auth/ResetPasswordForm";
import { useParams } from "next/navigation";

export default function ResetPasswordPage() {
  const t = useTranslations();
  const params = useParams();
  const token = params.token as string;

  return (
    <div className="w-full max-w-md space-y-2">
      <div className="text-center">
        <h1 className="text-2xl font-bold">{t("auth.new_password_title")}</h1>
        <p className="text-sm text-muted-foreground">
          {t("auth.new_password_description")}
        </p>
      </div>

      {token && <ResetPasswordForm token={token} />}
    </div>
  );
}

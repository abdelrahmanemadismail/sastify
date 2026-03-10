"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { authService } from "@/lib/auth-service";
import { formValidation, type FormErrors } from "@/lib/form-validation";
import Link from "next/link";

export function ForgotPasswordForm() {
  const t = useTranslations();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [errors, setErrors] = useState<FormErrors<{ email: string }>>({});
  const [apiError, setApiError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const validateForm = () => {
    const newErrors: FormErrors<{ email: string }> = {};
    const error = formValidation.email(email);

    if (error) {
      newErrors.email = t(error);
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError(null);

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      await authService.forgotPassword({ email });
      if (typeof window !== "undefined") {
        sessionStorage.setItem("forgotPasswordEmail", email);
      }
      router.push(`/auth/verify-code?email=${encodeURIComponent(email)}`);
    } catch (err) {
      setApiError(err instanceof Error ? err.message : t("error.unknown"));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full space-y-6">
      {/* Error Alert */}
      {apiError && (
        <div className="rounded-lg bg-red-50 border border-red-200 p-4 text-sm text-red-700">
          {apiError}
        </div>
      )}

      {/* Email Input */}
      <div className="space-y-3">
        <div className="relative">
          <div className="absolute ltr:left-5 rtl:right-5 top-1/2 -translate-y-1/2 pointer-events-none z-10">
            <svg
              className="w-6 h-6 text-[#171B40] dark:text-[#E8E9EE]"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
            </svg>
          </div>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (errors.email) {
                setErrors({ email: undefined });
              }
            }}
            placeholder="Email"
            className="w-full rounded-[15px] bg-[#DFE0E7] dark:bg-[#0A0C1C]/50 border border-[#171B40] dark:border-[#E8E9EE]/30 px-5 py-3 ltr:pl-16 rtl:pr-16 text-base font-poppins text-[#171B40] dark:text-white placeholder:text-[#171B40]/60 dark:placeholder:text-[#E8E9EE]/60 focus:outline-none focus:ring-2 focus:ring-[#CD202F] transition-all"
            disabled={isLoading}
          />
        </div>
        {errors.email && (
          <p className="text-xs text-red-600 dark:text-red-400 font-medium">{errors.email}</p>
        )}
      </div>

      {/* Submit Button */}
      <div className="flex justify-center">
        <button
          type="submit"
          disabled={isLoading}
          className="px-8 py-3 flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-[#CD202F] to-[#1D2250] text-white font-poppins font-medium text-base hover:shadow-lg hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <svg
              className="w-5 h-5 animate-spin"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
          ) : (
            <>
              <span>{t("auth.continue")}</span>
              <svg
                className="w-6 h-6 ltr:ml-2 rtl:mr-2 rtl:scale-x-[-1]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 7l5 5m0 0l-5 5m5-5H6"
                />
              </svg>
            </>
          )}
        </button>
      </div>

      {/* Back to Login Link */}
      <p className="text-center text-sm font-poppins text-[#171B40] dark:text-[#E8E9EE]">
        {t("auth.remember_password")}{" "}
        <Link
          href="/auth/login"
          className="font-semibold text-[#CD202F] hover:text-[#900B09] dark:hover:text-[#E8495F] transition-colors"
        >
          {t("auth.back_to_login")}
        </Link>
      </p>
    </form>
  );
}

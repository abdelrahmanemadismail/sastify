"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { authService } from "@/lib/auth-service";
import { formValidation, type FormErrors } from "@/lib/form-validation";
import type { ResetPasswordRequest } from "@/lib/auth-service";

interface ResetPasswordFormProps {
  token: string;
}

export function ResetPasswordForm({ token }: ResetPasswordFormProps) {
  const t = useTranslations();
  const router = useRouter();

  const [formData, setFormData] = useState<ResetPasswordRequest>({
    new_password: "",
    confirm_password: "",
  });

  const [errors, setErrors] = useState<FormErrors<ResetPasswordRequest>>({});
  const [apiError, setApiError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const validateForm = () => {
    const newErrors: FormErrors<ResetPasswordRequest> = {};

    const passwordError = formValidation.password(formData.new_password);
    if (passwordError) {
      newErrors.new_password = t(passwordError);
    }

    const matchError = formValidation.passwordMatch(
      formData.new_password,
      formData.confirm_password
    );
    if (matchError) {
      newErrors.confirm_password = t(matchError);
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
      await authService.resetPassword(token, formData);
      router.push("/auth/reset-success");
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

      {/* New Password Input */}
      <div className="space-y-3">
        <div className="relative">
          <div className="absolute ltr:left-5 rtl:right-5 top-1/2 -translate-y-1/2 pointer-events-none z-10">
            <svg
              className="w-6 h-6 text-[#171B40] dark:text-[#E8E9EE]"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M18 8h-1V6c0-2.76-2.24-5-5-5s-5 2.24-5 5v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z" />
            </svg>
          </div>
          <input
            id="new_password"
            type={showPassword ? "text" : "password"}
            value={formData.new_password}
            onChange={(e) => {
              setFormData({ ...formData, new_password: e.target.value });
              if (errors.new_password) {
                setErrors({ ...errors, new_password: undefined });
              }
            }}
            placeholder={t("auth.new_password")}
            className="w-full rounded-[15px] bg-[#DFE0E7] dark:bg-[#0A0C1C]/50 border border-[#171B40] dark:border-[#E8E9EE]/30 px-5 py-3 ltr:pl-16 rtl:pr-16 text-base font-poppins text-[#171B40] dark:text-white placeholder:text-[#171B40]/60 dark:placeholder:text-[#E8E9EE]/60 focus:outline-none focus:ring-2 focus:ring-[#CD202F] transition-all ltr:pr-14 rtl:pl-14"
            disabled={isLoading}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute ltr:right-5 rtl:left-5 top-1/2 -translate-y-1/2 text-[#171B40] dark:text-[#E8E9EE] hover:text-[#CD202F] dark:hover:text-[#CD202F] transition-colors z-10"
          >
            {showPassword ? (
              <svg
                className="w-6 h-6"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 15c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3z" />
              </svg>
            ) : (
              <svg
                className="w-6 h-6"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46A11.804 11.804 0 001 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2zm5.31-7.78l3.15 3.15.02-.02c-.48-.35-1.06-.59-1.69-.59-.92 0-1.72.37-2.31.97l.83.49z" />
              </svg>
            )}
          </button>
        </div>
        {errors.new_password && (
          <p className="text-xs text-red-600 dark:text-red-400 font-medium">{errors.new_password}</p>
        )}
      </div>

      {/* Confirm Password Input */}
      <div className="space-y-3">
        <div className="relative">
          <div className="absolute ltr:left-5 rtl:right-5 top-1/2 -translate-y-1/2 pointer-events-none z-10">
            <svg
              className="w-6 h-6 text-[#171B40] dark:text-[#E8E9EE]"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M18 8h-1V6c0-2.76-2.24-5-5-5s-5 2.24-5 5v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z" />
            </svg>
          </div>
          <input
            id="confirm_password"
            type={showConfirmPassword ? "text" : "password"}
            value={formData.confirm_password}
            onChange={(e) => {
              setFormData({ ...formData, confirm_password: e.target.value });
              if (errors.confirm_password) {
                setErrors({ ...errors, confirm_password: undefined });
              }
            }}
            placeholder={t("auth.confirm_password")}
            className="w-full rounded-[15px] bg-[#DFE0E7] dark:bg-[#0A0C1C]/50 border border-[#171B40] dark:border-[#E8E9EE]/30 px-5 py-3 ltr:pl-16 rtl:pr-16 text-base font-poppins text-[#171B40] dark:text-white placeholder:text-[#171B40]/60 dark:placeholder:text-[#E8E9EE]/60 focus:outline-none focus:ring-2 focus:ring-[#CD202F] transition-all ltr:pr-14 rtl:pl-14"
            disabled={isLoading}
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute ltr:right-5 rtl:left-5 top-1/2 -translate-y-1/2 text-[#171B40] dark:text-[#E8E9EE] hover:text-[#CD202F] dark:hover:text-[#CD202F] transition-colors z-10"
          >
            {showConfirmPassword ? (
              <svg
                className="w-6 h-6"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 15c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3z" />
              </svg>
            ) : (
              <svg
                className="w-6 h-6"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46A11.804 11.804 0 001 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2zm5.31-7.78l3.15 3.15.02-.02c-.48-.35-1.06-.59-1.69-.59-.92 0-1.72.37-2.31.97l.83.49z" />
              </svg>
            )}
          </button>
        </div>
        {errors.confirm_password && (
          <p className="text-xs text-red-600 dark:text-red-400 font-medium">{errors.confirm_password}</p>
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
              <span>{t("auth.save_new_password")}</span>
              <svg
                className="w-6 h-6 ltr:ml-2 rtl:mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </>
          )}
        </button>
      </div>
    </form>
  );
}

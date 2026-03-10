"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { type FormErrors } from "@/lib/form-validation";
import Link from "next/link";
import type { LoginRequest } from "@/lib/auth-service";

interface LoginFormProps {
  onOTPRequired?: (username: string) => void;
}

export function LoginForm({ onOTPRequired }: LoginFormProps) {
  const t = useTranslations();
  const router = useRouter();
  const { login, isLoading } = useAuth();

  const [formData, setFormData] = useState<LoginRequest & { rememberMe?: boolean }>({
    identifier: "",
    password: "",
    rememberMe: false,
  });

  const [errors, setErrors] = useState<FormErrors<LoginRequest>>({});
  const [apiError, setApiError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const validateForm = () => {
    const newErrors: FormErrors<LoginRequest> = {};

    if (!formData.identifier.trim()) {
      newErrors.identifier = t("validation.required");
    }

    if (!formData.password) {
      newErrors.password = t("validation.required");
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

    const result = await login({
      identifier: formData.identifier,
      password: formData.password,
    });

    if (result.success) {
      router.push("/dashboard");
    } else if (result.requires2FA) {
      onOTPRequired?.(formData.identifier);
    } else {
      setApiError(result.error || t("error.login_failed"));
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
            id="identifier"
            type="text"
            value={formData.identifier}
            onChange={(e) => {
              setFormData({ ...formData, identifier: e.target.value });
              if (errors.identifier) {
                setErrors({ ...errors, identifier: undefined });
              }
            }}
            placeholder="Email"
            className="w-full rounded-[15px] bg-[#DFE0E7] dark:bg-[#0A0C1C]/50 border border-[#171B40] dark:border-[#E8E9EE]/30 px-5 py-3 ltr:pl-16 rtl:pr-16 text-base font-poppins text-[#171B40] dark:text-white placeholder:text-[#171B40]/60 dark:placeholder:text-[#E8E9EE]/60 focus:outline-none focus:ring-2 focus:ring-[#CD202F] transition-all"
            disabled={isLoading}
          />
        </div>
        {errors.identifier && (
          <p className="text-xs text-red-600 dark:text-red-400 font-medium">{errors.identifier}</p>
        )}
      </div>

      {/* Password Input */}
      <div className="space-y-3">
        <div className="relative">
          <div className="absolute ltr:left-5 rtl:right-5 top-1/2 -translate-y-1/2 pointer-events-none z-10">
            <svg
              className="w-6 h-6 text-[#171B40] dark:text-[#E8E9EE]"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M18 8h-1V6c0-2.76-2.24-5-5-5s-5 2.24-5 5v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zM9 6c0-1.66 1.34-3 3-3s3 1.34 3 3v2H9V6zm9 14H6V10h12v10zm-6-3c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2z" />
            </svg>
          </div>
          <input
            id="password"
            type={showPassword ? "text" : "password"}
            value={formData.password}
            onChange={(e) => {
              setFormData({ ...formData, password: e.target.value });
              if (errors.password) {
                setErrors({ ...errors, password: undefined });
              }
            }}
            placeholder="Password"
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
        {errors.password && (
          <p className="text-xs text-red-600 dark:text-red-400 font-medium">{errors.password}</p>
        )}
      </div>

      {/* Remember Me & Forgot Password */}
      <div className="flex items-center justify-between text-sm font-poppins">
        <label className="flex items-center gap-2 cursor-pointer group">
          <input
            type="checkbox"
            checked={formData.rememberMe || false}
            onChange={(e) =>
              setFormData({ ...formData, rememberMe: e.target.checked })
            }
            className="w-4 h-4 rounded border-[#171B40] dark:border-[#E8E9EE] accent-[#CD202F] cursor-pointer"
          />
          <span className="text-[#171B40] dark:text-[#E8E9EE] select-none">{t("auth.remember_me")}</span>
        </label>
        <Link
          href="/auth/forgot-password"
          className="text-[#171B40] dark:text-[#E8E9EE] hover:text-[#CD202F] dark:hover:text-[#CD202F] transition-colors"
        >
          {t("auth.forgot_password")}
        </Link>
      </div>

      {/* Login Button */}
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
            <span>{t("auth.login")}</span>
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

      {/* Divider */}
      <div className="flex items-center gap-3 my-6">
        <div className="flex-1 h-px bg-[#171B40]/20 dark:bg-[#E8E9EE]/20" />
        <span className="text-sm font-poppins text-[#171B40] dark:text-[#E8E9EE]">
          {t("auth.or_continue_with")}
        </span>
        <div className="flex-1 h-px bg-[#171B40]/20 dark:bg-[#E8E9EE]/20" />
      </div>

      {/* Google Sign In */}
      <button
        type="button"
        className="w-full flex items-center justify-center gap-3 rounded-lg border border-[#171B40]/20 dark:border-[#E8E9EE]/30 bg-white dark:bg-[#0A0C1C]/30 px-4 py-3 font-poppins text-[#171B40] dark:text-[#E8E9EE] hover:bg-[#F5F5F5] dark:hover:bg-[#0A0C1C]/50 transition-colors"
      >
        <svg className="w-5 h-5" viewBox="0 0 24 24">
          <path
            fill="#4285F4"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="#34A853"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="#FBBC05"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
          />
          <path
            fill="#EB4335"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
          />
        </svg>
        <span className="text-sm font-medium">Google</span>
      </button>

      {/* Register Link */}
      <p className="text-center text-sm font-poppins text-[#171B40] dark:text-[#E8E9EE]">
        {t("auth.dont_have_account")}{" "}
        <Link
          href="/auth/register"
          className="font-semibold text-[#CD202F] hover:text-[#900B09] dark:hover:text-[#E8495F] transition-colors"
        >
          {t("auth.register")}
        </Link>
      </p>
    </form>
  );
}

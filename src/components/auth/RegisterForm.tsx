"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { formValidation, type FormErrors } from "@/lib/form-validation";
import Link from "next/link";
import type { RegisterRequest } from "@/lib/auth-service";

export function RegisterForm() {
  const t = useTranslations();
  const router = useRouter();
  const { register, isLoading } = useAuth();

  const [formData, setFormData] = useState<RegisterRequest>({
    first_name: "",
    last_name: "",
    username: "",
    email: "",
    password: "",
    confirm_password: "",
  });

  const [errors, setErrors] = useState<FormErrors<RegisterRequest>>({});
  const [apiError, setApiError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const validateForm = () => {
    const newErrors: FormErrors<RegisterRequest> = {};

    const firstNameError = formValidation.firstName(formData.first_name);
    if (firstNameError) {
      newErrors.first_name = t(firstNameError);
    }

    const lastNameError = formValidation.lastName(formData.last_name);
    if (lastNameError) {
      newErrors.last_name = t(lastNameError);
    }

    const usernameError = formValidation.username(formData.username);
    if (usernameError) {
      newErrors.username = t(usernameError);
    }

    const emailError = formValidation.email(formData.email);
    if (emailError) {
      newErrors.email = t(emailError);
    }

    const passwordError = formValidation.password(formData.password);
    if (passwordError) {
      newErrors.password = t(passwordError);
    }

    const matchError = formValidation.passwordMatch(
      formData.password,
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

    const result = await register(formData);

    if (result.success) {
      // User is auto-logged in, redirect to activation page
      router.push("/auth/activate");
    } else {
      const error = result.error;
      if (error && typeof error === "string" && error.includes("Validation")) {
        // Try to parse as validation error
        try {
          const parsed = JSON.parse(error);
          if (parsed.details && typeof parsed.details === "object") {
            const validationErrors: Record<string, string> = {};
            for (const [field, messages] of Object.entries(parsed.details as Record<string, string[]>)) {
              validationErrors[field] = messages[0] || "Validation error";
            }
            setErrors(validationErrors as FormErrors<RegisterRequest>);
          } else {
            setApiError(error);
          }
        } catch {
          setApiError(error);
        }
      } else {
        setApiError(error || t("error.registration_failed"));
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full space-y-5">
      {apiError && (
        <div className="rounded-[15px] bg-red-50 p-3 text-sm text-red-800 dark:bg-red-900/20 dark:text-red-400">
          {apiError}
        </div>
      )}

      {/* Name Fields */}
      <div className="grid grid-cols-2 gap-4">
        {/* First Name */}
        <div className="space-y-2">
          <div className="relative">
            {/* User Icon */}
            <div className="absolute ltr:left-5 rtl:right-5 top-1/2 -translate-y-1/2 text-[#171B40] dark:text-[#E8E9EE] pointer-events-none">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
              </svg>
            </div>
            <input
              id="first_name"
              type="text"
              value={formData.first_name}
              onChange={(e) => {
                setFormData({ ...formData, first_name: e.target.value });
                if (errors.first_name) {
                  setErrors({ ...errors, first_name: undefined });
                }
              }}
              placeholder={t("auth.first_name")}
              className="w-full rounded-[15px] bg-[#DFE0E7] dark:bg-[#0A0C1C]/50 border border-[#171B40] dark:border-[#E8E9EE]/30 px-5 py-3 ltr:pl-14 rtl:pr-14 text-base font-poppins text-[#171B40] dark:text-white placeholder:text-[#171B40]/60 dark:placeholder:text-[#E8E9EE]/60 focus:outline-none focus:ring-2 focus:ring-[#CD202F] transition-all"
              disabled={isLoading}
            />
          </div>
          {errors.first_name && (
            <p className="text-xs text-red-500 px-2">{errors.first_name}</p>
          )}
        </div>

        {/* Last Name */}
        <div className="space-y-2">
          <div className="relative">
            {/* User Icon */}
            <div className="absolute ltr:left-5 rtl:right-5 top-1/2 -translate-y-1/2 text-[#171B40] dark:text-[#E8E9EE] pointer-events-none">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
              </svg>
            </div>
            <input
              id="last_name"
              type="text"
              value={formData.last_name}
              onChange={(e) => {
                setFormData({ ...formData, last_name: e.target.value });
                if (errors.last_name) {
                  setErrors({ ...errors, last_name: undefined });
                }
              }}
              placeholder={t("auth.last_name")}
              className="w-full rounded-[15px] bg-[#DFE0E7] dark:bg-[#0A0C1C]/50 border border-[#171B40] dark:border-[#E8E9EE]/30 px-5 py-3 ltr:pl-14 rtl:pr-14 text-base font-poppins text-[#171B40] dark:text-white placeholder:text-[#171B40]/60 dark:placeholder:text-[#E8E9EE]/60 focus:outline-none focus:ring-2 focus:ring-[#CD202F] transition-all"
              disabled={isLoading}
            />
          </div>
          {errors.last_name && (
            <p className="text-xs text-red-500 px-2">{errors.last_name}</p>
          )}
        </div>
      </div>

      {/* Username */}
      <div className="space-y-2">
        <div className="relative">
          {/* At Icon */}
          <div className="absolute ltr:left-5 rtl:right-5 top-1/2 -translate-y-1/2 text-[#171B40] dark:text-[#E8E9EE] pointer-events-none">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10h5v-2h-5c-4.34 0-8-3.66-8-8s3.66-8 8-8 8 3.66 8 8v1.43c0 .79-.71 1.57-1.5 1.57s-1.5-.78-1.5-1.57V12c0-2.76-2.24-5-5-5s-5 2.24-5 5 2.24 5 5 5c1.38 0 2.64-.56 3.54-1.47.65.89 1.77 1.47 2.96 1.47 1.97 0 3.5-1.6 3.5-3.57V12c0-5.52-4.48-10-10-10zm0 13c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3z"/>
            </svg>
          </div>
          <input
            id="username"
            type="text"
            value={formData.username}
            onChange={(e) => {
              setFormData({ ...formData, username: e.target.value });
              if (errors.username) {
                setErrors({ ...errors, username: undefined });
              }
            }}
            placeholder={t("auth.username")}
            className="w-full rounded-[15px] bg-[#DFE0E7] dark:bg-[#0A0C1C]/50 border border-[#171B40] dark:border-[#E8E9EE]/30 px-5 py-3 ltr:pl-14 rtl:pr-14 text-base font-poppins text-[#171B40] dark:text-white placeholder:text-[#171B40]/60 dark:placeholder:text-[#E8E9EE]/60 focus:outline-none focus:ring-2 focus:ring-[#CD202F] transition-all"
            disabled={isLoading}
          />
        </div>
        {errors.username && (
          <p className="text-xs text-red-500 px-2">{errors.username}</p>
        )}
      </div>

      {/* Email */}
      <div className="space-y-2">
        <div className="relative">
          {/* Mail Icon */}
          <div className="absolute ltr:left-5 rtl:right-5 top-1/2 -translate-y-1/2 text-[#171B40] dark:text-[#E8E9EE] pointer-events-none">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
            </svg>
          </div>
          <input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => {
              setFormData({ ...formData, email: e.target.value });
              if (errors.email) {
                setErrors({ ...errors, email: undefined });
              }
            }}
            placeholder="Email"
            className="w-full rounded-[15px] bg-[#DFE0E7] dark:bg-[#0A0C1C]/50 border border-[#171B40] dark:border-[#E8E9EE]/30 px-5 py-3 ltr:pl-14 rtl:pr-14 text-base font-poppins text-[#171B40] dark:text-white placeholder:text-[#171B40]/60 dark:placeholder:text-[#E8E9EE]/60 focus:outline-none focus:ring-2 focus:ring-[#CD202F] transition-all"
            disabled={isLoading}
          />
        </div>
        {errors.email && <p className="text-xs text-red-500 px-2">{errors.email}</p>}
      </div>

      {/* Password */}
      <div className="space-y-2">
        <div className="relative">
          {/* Lock Icon */}
          <div className="absolute ltr:left-5 rtl:right-5 top-1/2 -translate-y-1/2 text-[#171B40] dark:text-[#E8E9EE] pointer-events-none">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/>
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
            className="w-full rounded-[15px] bg-[#DFE0E7] dark:bg-[#0A0C1C]/50 border border-[#171B40] dark:border-[#E8E9EE]/30 px-5 py-3 ltr:pl-14 rtl:pr-14 text-base font-poppins text-[#171B40] dark:text-white placeholder:text-[#171B40]/60 dark:placeholder:text-[#E8E9EE]/60 focus:outline-none focus:ring-2 focus:ring-[#CD202F] transition-all ltr:pr-14 rtl:pl-14"
            disabled={isLoading}
          />
          {/* Eye Toggle */}
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute ltr:right-5 rtl:left-5 top-1/2 -translate-y-1/2 text-[#171B40] dark:text-[#E8E9EE] hover:text-[#CD202F] dark:hover:text-[#CD202F] transition-colors"
            tabIndex={-1}
          >
            {showPassword ? (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46C3.08 8.3 1.78 10.02 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2zm4.31-.78l3.15 3.15.02-.16c0-1.66-1.34-3-3-3l-.17.01z"/>
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
              </svg>
            )}
          </button>
        </div>
        {errors.password && (
          <p className="text-xs text-red-500 px-2">{errors.password}</p>
        )}
      </div>

      {/* Confirm Password */}
      <div className="space-y-2">
        <div className="relative">
          {/* Lock Icon */}
          <div className="absolute ltr:left-5 rtl:right-5 top-1/2 -translate-y-1/2 text-[#171B40] dark:text-[#E8E9EE] pointer-events-none">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/>
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
            className="w-full rounded-[15px] bg-[#DFE0E7] dark:bg-[#0A0C1C]/50 border border-[#171B40] dark:border-[#E8E9EE]/30 px-5 py-3 ltr:pl-14 rtl:pr-14 text-base font-poppins text-[#171B40] dark:text-white placeholder:text-[#171B40]/60 dark:placeholder:text-[#E8E9EE]/60 focus:outline-none focus:ring-2 focus:ring-[#CD202F] transition-all ltr:pr-14 rtl:pl-14"
            disabled={isLoading}
          />
          {/* Eye Toggle */}
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute ltr:right-5 rtl:left-5 top-1/2 -translate-y-1/2 text-[#171B40] dark:text-[#E8E9EE] hover:text-[#CD202F] dark:hover:text-[#CD202F] transition-colors"
            tabIndex={-1}
          >
            {showConfirmPassword ? (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46C3.08 8.3 1.78 10.02 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2zm4.31-.78l3.15 3.15.02-.16c0-1.66-1.34-3-3-3l-.17.01z"/>
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
              </svg>
            )}
          </button>
        </div>
        {errors.confirm_password && (
          <p className="text-xs text-red-500 px-2">{errors.confirm_password}</p>
        )}
      </div>

      {/* Register Button */}
      <div className="flex justify-center pt-2">
        <button
          type="submit"
          disabled={isLoading}
          className="px-8 py-3 flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-[#CD202F] to-[#1D2250] text-white font-poppins font-medium text-base hover:shadow-lg hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <>
              <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
              </svg>
              {t("common.loading")}
            </>
          ) : (
            <>{t("auth.register")}</>
          )}
        </button>
      </div>

      {/* Divider - Or continue with */}
      <div className="relative py-2">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-[#171B40]/20 dark:border-[#E8E9EE]/20"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-4 bg-[#DDDEE5]/90 dark:bg-[#1D2250]/50 text-[#171B40] dark:text-[#E8E9EE] font-poppins">
            {t("auth.or_continue_with")}
          </span>
        </div>
      </div>

      {/* Google Button */}
      <button
        type="button"
        onClick={() => {
          // TODO: Implement Google OAuth
          console.log("Google OAuth not yet implemented");
        }}
        className="w-full px-6 py-3 flex items-center justify-center gap-3 rounded-lg bg-white dark:bg-[#0A0C1C] border border-[#171B40] dark:border-[#E8E9EE]/30 text-[#171B40] dark:text-white font-poppins font-medium text-base hover:shadow-lg hover:scale-105 transition-all"
      >
        <svg className="w-5 h-5" viewBox="0 0 24 24">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
        </svg>
        Google
      </button>

      {/* Login Link */}
      <p className="text-center text-sm font-poppins text-[#171B40] dark:text-[#E8E9EE] pt-2">
        {t("auth.already_have_account")}{" "}
        <Link href="/auth/login" className="text-[#CD202F] font-semibold hover:underline">
          {t("auth.login")}
        </Link>
      </p>
    </form>
  );
}

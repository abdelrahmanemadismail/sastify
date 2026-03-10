"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter, useSearchParams } from "next/navigation";
import { authService } from "@/lib/auth-service";
import { formValidation, type FormErrors } from "@/lib/form-validation";

const OTP_LENGTH = 6;
const RESEND_SECONDS = 30;

export function ForgotPasswordVerificationForm() {
  const t = useTranslations();
  const router = useRouter();
  const searchParams = useSearchParams();
  const emailFromQuery = searchParams.get("email") || "";

  const [digits, setDigits] = useState<string[]>(Array(OTP_LENGTH).fill(""));
  const [errors, setErrors] = useState<FormErrors<{ otp: string }>>({});
  const [apiError, setApiError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(RESEND_SECONDS);

  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);

  const otpValue = useMemo(() => digits.join(""), [digits]);

  const email = useMemo(() => {
    if (emailFromQuery) {
      return emailFromQuery;
    }
    if (typeof window === "undefined") {
      return "";
    }
    return sessionStorage.getItem("forgotPasswordEmail") || "";
  }, [emailFromQuery]);

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  useEffect(() => {
    if (resendCountdown <= 0) return;
    const timer = setTimeout(() => {
      setResendCountdown((prev) => prev - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [resendCountdown]);

  const validateForm = () => {
    const newErrors: FormErrors<{ otp: string }> = {};
    const error = formValidation.otp(otpValue);

    if (error) {
      newErrors.otp = t(error);
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setApiError(null);

    if (!validateForm()) {
      return;
    }

    router.push(`/auth/reset-password/${otpValue}`);
  };

  const handleChange = (index: number, value: string) => {
    const digit = value.replace(/\D/g, "").slice(-1);
    const nextDigits = [...digits];
    nextDigits[index] = digit;
    setDigits(nextDigits);

    if (errors.otp) {
      setErrors({ otp: undefined });
    }

    if (digit && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Backspace" && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (event: React.ClipboardEvent<HTMLInputElement>) => {
    const pasted = event.clipboardData.getData("text").replace(/\D/g, "").slice(0, OTP_LENGTH);
    if (!pasted) return;

    const nextDigits = Array(OTP_LENGTH).fill("").map((_, idx) => pasted[idx] || "");
    setDigits(nextDigits);
    const nextIndex = Math.min(pasted.length, OTP_LENGTH - 1);
    inputRefs.current[nextIndex]?.focus();
  };

  const handleResend = async () => {
    if (!email) {
      setApiError(t("auth.resend_requires_email"));
      return;
    }

    setIsLoading(true);
    setApiError(null);

    try {
      await authService.forgotPassword({ email });
      setResendCountdown(RESEND_SECONDS);
    } catch (err) {
      setApiError(err instanceof Error ? err.message : t("error.unknown"));
    } finally {
      setIsLoading(false);
    }
  };

  const formattedCountdown = `00:${String(resendCountdown).padStart(2, "0")}`;

  return (
    <form onSubmit={handleSubmit} className="w-full space-y-6">
      {/* Error Alert */}
      {apiError && (
        <div className="rounded-lg bg-red-50 border border-red-200 p-4 text-sm text-red-700">
          {apiError}
        </div>
      )}

      {/* OTP Input Fields */}
      <div className="space-y-3">
        {email && (
          <p className="text-sm text-center font-poppins text-[#171B40] dark:text-[#E8E9EE]">
            {t("auth.code_sent_to")} <span className="font-semibold">{email}</span>
          </p>
        )}
        <div className="flex items-center justify-center gap-3">
          {digits.map((digit, index) => (
            <input
              key={index}
              ref={(node) => {
                inputRefs.current[index] = node;
              }}
              value={digit}
              onChange={(event) => handleChange(index, event.target.value)}
              onKeyDown={(event) => handleKeyDown(index, event)}
              onPaste={handlePaste}
              type="text"
              inputMode="numeric"
              maxLength={1}
              className="h-14 w-14 rounded-[15px] bg-[#DFE0E7] dark:bg-[#0A0C1C]/50 border border-[#171B40] dark:border-[#E8E9EE]/30 text-center text-2xl font-bold font-poppins text-[#171B40] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#CD202F] transition-all"
              disabled={isLoading}
            />
          ))}
        </div>
        {errors.otp && (
          <p className="text-xs text-red-600 dark:text-red-400 font-medium text-center">{errors.otp}</p>
        )}
      </div>

      {/* Countdown Timer */}
      <p className="text-center text-sm font-poppins text-[#171B40] dark:text-[#E8E9EE] tabular-nums">
        {t("auth.code_expires_in")} {formattedCountdown}
      </p>

      {/* Resend Code */}
      <div className="text-center text-sm font-poppins text-[#171B40] dark:text-[#E8E9EE]">
        {t("auth.didnt_receive_code")}{" "}
        <button
          type="button"
          onClick={handleResend}
          disabled={resendCountdown > 0 || isLoading}
          className="font-semibold text-[#CD202F] hover:text-[#900B09] dark:hover:text-[#E8495F] transition-colors disabled:cursor-not-allowed disabled:opacity-50"
        >
          {t("auth.resend")}
        </button>
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
    </form>
  );
}

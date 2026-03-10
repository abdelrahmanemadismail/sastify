"use client";

import { useState, useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { formValidation, type FormErrors } from "@/lib/form-validation";

interface OtpFormProps {
  username: string;
  onBack?: () => void;
}

export function OtpForm({ username, onBack }: OtpFormProps) {
  const t = useTranslations();
  const router = useRouter();
  const { otpLogin, isLoading } = useAuth();

  const [otp, setOtp] = useState("");
  const [errors, setErrors] = useState<FormErrors<{ otp: string }>>({});
  const [apiError, setApiError] = useState<string | null>(null);
  const [resendCountdown, setResendCountdown] = useState(0);

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    if (resendCountdown <= 0) return;

    const timer = setTimeout(() => {
      setResendCountdown(resendCountdown - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [resendCountdown]);

  const validateForm = () => {
    const newErrors: FormErrors<{ otp: string }> = {};
    const error = formValidation.otp(otp);

    if (error) {
      newErrors.otp = t(error);
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

    const result = await otpLogin(username, otp);

    if (result.success) {
      router.push("/dashboard");
    } else {
      setApiError(result.error || t("error.otp_failed"));
    }
  };

  const handleResend = () => {
    // TODO: Implement resend OTP logic
    setResendCountdown(60);
  };

  return (
    <form onSubmit={handleSubmit} className="w-full space-y-6">
      {/* Error Alert */}
      {apiError && (
        <div className="rounded-lg bg-red-50 border border-red-200 p-4 text-sm text-red-700">
          {apiError}
        </div>
      )}

      {/* OTP Input */}
      <div className="space-y-3">
        <p className="text-sm text-center font-poppins text-[#171B40] dark:text-[#E8E9EE]">
          {t("auth.otp_sent_to")} <span className="font-semibold">{username}</span>
        </p>
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
            ref={inputRef}
            id="otp"
            type="text"
            value={otp}
            onChange={(e) => {
              const value = e.target.value.replace(/\D/g, "").slice(0, 6);
              setOtp(value);
              if (errors.otp) {
                setErrors({ otp: undefined });
              }
            }}
            maxLength={6}
            placeholder="000000"
            className="w-full rounded-[15px] bg-[#DFE0E7] dark:bg-[#0A0C1C]/50 border border-[#171B40] dark:border-[#E8E9EE]/30 px-5 py-3 ltr:pl-16 rtl:pr-16 text-center text-2xl tracking-widest font-poppins text-[#171B40] dark:text-white placeholder:text-[#171B40]/60 dark:placeholder:text-[#E8E9EE]/60 focus:outline-none focus:ring-2 focus:ring-[#CD202F] transition-all"
            disabled={isLoading}
          />
        </div>
        {errors.otp && (
          <p className="text-xs text-red-600 dark:text-red-400 font-medium text-center">{errors.otp}</p>
        )}
      </div>

      {/* Verify Button */}
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
              <span>{t("auth.verify_otp")}</span>
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

      {/* Resend Code */}
      <div className="text-center text-sm font-poppins text-[#171B40] dark:text-[#E8E9EE]">
        {t("auth.didnt_receive_code")}{" "}
        <button
          type="button"
          onClick={handleResend}
          disabled={resendCountdown > 0 || isLoading}
          className="font-semibold text-[#CD202F] hover:text-[#900B09] dark:hover:text-[#E8495F] transition-colors disabled:cursor-not-allowed disabled:opacity-50"
        >
          {resendCountdown > 0
            ? t("auth.resend_in", { seconds: resendCountdown })
            : t("auth.resend_otp")}
        </button>
      </div>

      {/* Back Button */}
      {onBack && (
        <div className="flex justify-center">
          <button
            type="button"
            onClick={onBack}
            disabled={isLoading}
            className="px-8 py-3 flex items-center justify-center gap-2 rounded-lg border border-[#171B40] dark:border-[#E8E9EE]/30 bg-transparent text-[#171B40] dark:text-[#E8E9EE] font-poppins font-medium text-base hover:bg-[#DFE0E7] dark:hover:bg-[#0A0C1C]/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg
              className="w-6 h-6 rtl:scale-x-[-1]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11 17l-5-5m0 0l5-5m-5 5h12"
              />
            </svg>
            <span>{t("common.back")}</span>
          </button>
        </div>
      )}
    </form>
  );
}

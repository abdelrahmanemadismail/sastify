"use client";

import { useState, useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { authService } from "@/lib/auth-service";
import { Button } from "@/components/ui/button";
import { formValidation, type FormErrors } from "@/lib/form-validation";

export function ActivationForm() {
  const t = useTranslations();
  const router = useRouter();
  const { user, isLoading: authLoading, fetchProfile } = useAuth();

  const [otp, setOtp] = useState("");
  const [errors, setErrors] = useState<FormErrors<{ otp: string }>>({});
  const [apiError, setApiError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(0);
  const [otpValidityCountdown, setOtpValidityCountdown] = useState(180); // 3 minutes = 180 seconds
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

  // OTP validity countdown timer (3 minutes)
  useEffect(() => {
    if (otpValidityCountdown <= 0) return;

    const timer = setTimeout(() => {
      setOtpValidityCountdown(otpValidityCountdown - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [otpValidityCountdown]);

  if (user?.is_activated_account) {
    return (
      <div className="rounded-md bg-green-50 p-4 text-center dark:bg-green-900/20">
        <p className="text-sm text-green-800 dark:text-green-400">
          {t("auth.account_already_activated")}
        </p>
      </div>
    );
  }

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

    setIsLoading(true);

    try {
      await authService.activateAccount({ otp });

      // Refresh user profile to get updated activation status
      // This MUST succeed before redirecting
      await fetchProfile();

      router.push("/dashboard");
    } catch (err) {
      setApiError(err instanceof Error ? err.message : t("error.unknown"));
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    setIsLoading(true);
    setApiError(null);

    try {
      await authService.sendActivationCode();
      setResendCountdown(60);
      setOtpValidityCountdown(180); // Reset OTP validity to 3 minutes
      setOtp(""); // Clear OTP input
    } catch (err) {
      setApiError(err instanceof Error ? err.message : t("error.unknown"));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full space-y-4">
      {apiError && (
        <div className="rounded-md bg-red-50 p-3 text-sm text-red-800 dark:bg-red-900/20 dark:text-red-400">
          {apiError}
        </div>
      )}

      <div className="space-y-2">
        <label htmlFor="otp" className="text-sm font-medium">
          {t("auth.enter_activation_code")}
        </label>
        <p className="text-xs text-muted-foreground">
          {t("auth.activation_code_sent_to")} {user?.email}
        </p>
        {otpValidityCountdown > 0 && (
          <p className="text-xs text-orange-600 dark:text-orange-400">
            {t("auth.code_expires_in", {
              minutes: Math.floor(otpValidityCountdown / 60),
              seconds: String(otpValidityCountdown % 60).padStart(2, "0")
            })}
          </p>
        )}
        {otpValidityCountdown === 0 && (
          <p className="text-xs text-red-600 dark:text-red-400">
            {t("auth.code_expired")}
          </p>
        )}
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
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-center text-2xl tracking-widest placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          disabled={isLoading || authLoading}
        />
        {errors.otp && <p className="text-xs text-red-500">{errors.otp}</p>}
      </div>

      <Button type="submit" className="w-full" disabled={isLoading || authLoading}>
        {isLoading ? t("common.loading") : t("auth.activate_account")}
      </Button>

      <Button
        type="button"
        variant="outline"
        className="w-full"
        disabled={resendCountdown > 0 || isLoading || authLoading}
        onClick={handleResend}
      >
        {resendCountdown > 0
          ? t("auth.resend_in", { seconds: resendCountdown })
          : t("auth.resend_code")}
      </Button>
    </form>
  );
}

"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useAuth } from "@/hooks/useAuth";
import { authService } from "@/lib/auth-service";
import { formValidation, type FormErrors } from "@/lib/form-validation";
import type { ChangePasswordRequest } from "@/lib/auth-service";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Eye, EyeOff } from "lucide-react";

export function ChangePasswordForm() {
  const t = useTranslations();
  const { isLoading: authLoading } = useAuth();

  const [formData, setFormData] = useState<ChangePasswordRequest>({
    old_password: "",
    new_password: "",
    confirm_password: "",
  });

  const [errors, setErrors] = useState<FormErrors<ChangePasswordRequest>>({});
  const [apiError, setApiError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const validateForm = () => {
    const newErrors: FormErrors<ChangePasswordRequest> = {};

    if (!formData.old_password) {
      newErrors.old_password = t("validation.required");
    }

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
      await authService.changePassword(formData);
      setSubmitted(true);
      setFormData({
        old_password: "",
        new_password: "",
        confirm_password: "",
      });
    } catch (err) {
      setApiError(err instanceof Error ? err.message : t("error.unknown"));
    } finally {
      setIsLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="rounded-md border border-success/30 bg-success/10 px-3 py-2 text-sm text-success">
        {t("auth.password_changed_success")}
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {apiError && (
        <div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {apiError}
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="old_password">{t("auth.current_password")}</Label>
        <div className="relative">
          <Input
            id="old_password"
            type={showOldPassword ? "text" : "password"}
            value={formData.old_password}
            onChange={(e) => {
              setFormData({ ...formData, old_password: e.target.value });
              if (errors.old_password) {
                setErrors({ ...errors, old_password: undefined });
              }
            }}
            disabled={isLoading || authLoading}
            className={cn(
              "ltr:pr-10 rtl:pl-10",
              errors.old_password && "border-destructive focus-visible:ring-destructive"
            )}
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => setShowOldPassword(!showOldPassword)}
            className="absolute ltr:right-2 rtl:left-2 top-1/2 h-7 w-7 -translate-y-1/2"
          >
            {showOldPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </Button>
        </div>
        {errors.old_password && (
          <p className="text-xs text-destructive">{errors.old_password}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="new_password">{t("auth.new_password")}</Label>
        <div className="relative">
          <Input
            id="new_password"
            type={showNewPassword ? "text" : "password"}
            value={formData.new_password}
            onChange={(e) => {
              setFormData({ ...formData, new_password: e.target.value });
              if (errors.new_password) {
                setErrors({ ...errors, new_password: undefined });
              }
            }}
            disabled={isLoading || authLoading}
            className={cn(
              "ltr:pr-10 rtl:pl-10",
              errors.new_password && "border-destructive focus-visible:ring-destructive"
            )}
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => setShowNewPassword(!showNewPassword)}
            className="absolute ltr:right-2 rtl:left-2 top-1/2 h-7 w-7 -translate-y-1/2"
          >
            {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </Button>
        </div>
        {errors.new_password && (
          <p className="text-xs text-destructive">{errors.new_password}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirm_password">{t("auth.confirm_password")}</Label>
        <div className="relative">
          <Input
            id="confirm_password"
            type={showConfirmPassword ? "text" : "password"}
            value={formData.confirm_password}
            onChange={(e) => {
              setFormData({ ...formData, confirm_password: e.target.value });
              if (errors.confirm_password) {
                setErrors({ ...errors, confirm_password: undefined });
              }
            }}
            disabled={isLoading || authLoading}
            className={cn(
              "ltr:pr-10 rtl:pl-10",
              errors.confirm_password && "border-destructive focus-visible:ring-destructive"
            )}
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute ltr:right-2 rtl:left-2 top-1/2 h-7 w-7 -translate-y-1/2"
          >
            {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </Button>
        </div>
        {errors.confirm_password && (
          <p className="text-xs text-destructive">{errors.confirm_password}</p>
        )}
      </div>

      <div className="flex justify-end">
        <Button type="submit" disabled={isLoading || authLoading}>
          {isLoading ? t("common.loading") : t("auth.change_password")}
        </Button>
      </div>
    </form>
  );
}

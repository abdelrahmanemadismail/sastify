"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { useAuth } from "@/hooks/useAuth";
import { authService } from "@/lib/auth-service";
import { Button } from "@/components/ui/button";
import { formValidation, type FormErrors } from "@/lib/form-validation";

interface ProfileFormData {
  first_name: string;
  last_name: string;
}

export default function ProfilePage() {
  const t = useTranslations();
  const { user, fetchProfile, isLoading } = useAuth();

  const [formData, setFormData] = useState<ProfileFormData>({
    first_name: "",
    last_name: "",
  });

  const [errors, setErrors] = useState<FormErrors<ProfileFormData>>({});
  const [apiError, setApiError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Initialize form data with user data
  useEffect(() => {
    if (user) {
      setFormData({
        first_name: user.first_name,
        last_name: user.last_name,
      });
    }
  }, [user]);

  const validateForm = () => {
    const newErrors: FormErrors<ProfileFormData> = {};

    const firstNameError = formValidation.firstName(formData.first_name);
    if (firstNameError) {
      newErrors.first_name = t(firstNameError);
    }

    const lastNameError = formValidation.lastName(formData.last_name);
    if (lastNameError) {
      newErrors.last_name = t(lastNameError);
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError(null);
    setSubmitted(false);

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      await authService.updateProfile(formData);
      await fetchProfile();
      setSubmitted(true);
      setTimeout(() => setSubmitted(false), 3000);
    } catch (err) {
      setApiError(err instanceof Error ? err.message : t("error.unknown"));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">{t("profile.edit")}</h1>
        <p className="text-muted-foreground">{t("common.update_profile")}</p>
      </div>

      <div className="rounded-lg border border-border bg-card p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {apiError && (
            <div className="rounded-md bg-red-50 p-3 text-sm text-red-800 dark:bg-red-900/20 dark:text-red-400">
              {apiError}
            </div>
          )}

          {submitted && (
            <div className="rounded-md bg-green-50 p-3 text-sm text-green-800 dark:bg-green-900/20 dark:text-green-400">
              {t("profile.save")}d successfully!
            </div>
          )}

          <div className="space-y-2">
            <label htmlFor="first_name" className="text-sm font-medium">
              {t("auth.first_name")}
            </label>
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
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              disabled={isSubmitting || isLoading}
            />
            {errors.first_name && (
              <p className="text-xs text-red-500">{errors.first_name}</p>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="last_name" className="text-sm font-medium">
              {t("auth.last_name")}
            </label>
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
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              disabled={isSubmitting || isLoading}
            />
            {errors.last_name && (
              <p className="text-xs text-red-500">{errors.last_name}</p>
            )}
          </div>

          <div className="flex gap-2">
            <Button type="submit" disabled={isSubmitting || isLoading}>
              {isSubmitting ? t("common.loading") : t("profile.save")}
            </Button>
            <Button type="button" variant="outline" onClick={() => {
              setFormData({
                first_name: user?.first_name || "",
                last_name: user?.last_name || "",
              });
              setErrors({});
              setApiError(null);
            }} disabled={isSubmitting || isLoading}>
              {t("profile.cancel")}
            </Button>
          </div>
        </form>
      </div>

      {/* Read-only user info */}
      <div className="mt-8 rounded-lg border border-border bg-card p-6">
        <h2 className="text-lg font-semibold mb-4">{t("profile.view_profile")}</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-muted-foreground">{t("auth.username")}</p>
            <p className="font-medium">{user?.username}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">{t("auth.email")}</p>
            <p className="font-medium">{user?.email}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

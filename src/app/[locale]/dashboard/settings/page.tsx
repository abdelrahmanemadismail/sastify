"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { useAuth } from "@/hooks/useAuth";
import { ChangePasswordForm } from "@/components/auth/ChangePasswordForm";
import { Button } from "@/components/ui/button";
import { authService } from "@/lib/auth-service";
import { Edit2 } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

export default function SettingsPage() {
  const t = useTranslations();
  const { user, isLoading } = useAuth();

  const [profileData, setProfileData] = useState({
    first_name: "",
    last_name: "",
    username: "",
    email: "",
  });

  const [profileSaving, setProfileSaving] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);

  const [is2FAEnabled, setIs2FAEnabled] = useState(false);
  const [twoFALoading, setTwoFALoading] = useState(false);
  const [twoFAError, setTwoFAError] = useState<string | null>(null);
  const [twoFASuccess, setTwoFASuccess] = useState<"enabled" | "disabled" | null>(null);

  useEffect(() => {
    setProfileData({
      first_name: user?.first_name || "",
      last_name: user?.last_name || "",
      username: user?.username || "",
      email: user?.email || "",
    });
    setIs2FAEnabled(Boolean(user?.is_2FA_enabled));
  }, [user]);

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfileData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleProfileSave = async () => {
    setProfileSaving(true);
    setProfileError(null);
    setProfileSuccess(false);

    try {
      await authService.updateProfile({
        first_name: profileData.first_name,
        last_name: profileData.last_name,
      });
      setProfileSuccess(true);
      setTimeout(() => setProfileSuccess(false), 3000);
    } catch (err) {
      setProfileError(err instanceof Error ? err.message : t("error.unknown"));
    } finally {
      setProfileSaving(false);
    }
  };

  const handleToggle2FA = async (nextValue: boolean) => {
    setTwoFALoading(true);
    setTwoFAError(null);
    setTwoFASuccess(null);

    try {
      if (nextValue) {
        await authService.enable2FA();
        setTwoFASuccess("enabled");
      } else {
        await authService.disable2FA();
        setTwoFASuccess("disabled");
      }
      setIs2FAEnabled(nextValue);
      setTimeout(() => setTwoFASuccess(null), 3000);
    } catch (err) {
      setTwoFAError(err instanceof Error ? err.message : t("error.unknown"));
    } finally {
      setTwoFALoading(false);
    }
  };

  return (
    <div className="flex-1 space-y-6">
      <div className="space-y-0.5">
        <h2 className="text-2xl font-bold tracking-tight">
          {t("dashboard.settings") || "Settings"}
        </h2>
        <p className="text-muted-foreground">
          {t("common.manage_account_settings") || "Manage your account settings and preferences"}
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>{t("dashboard.profile_settings") || "Profile Settings"}</CardTitle>
            <CardDescription>
              {t("common.update_profile") || "Update your personal information."}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-wrap items-center gap-4">
              <Avatar className="h-14 w-14">
                <AvatarFallback className="text-base font-semibold">
                  {user?.first_name?.charAt(0)?.toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
              <div className="space-y-1">
                <p className="text-sm font-medium">
                  {user?.first_name || ""} {user?.last_name || ""}
                </p>
                <p className="text-xs text-muted-foreground">
                  {user?.email || ""}
                </p>
              </div>
              <div className="ml-auto flex items-center gap-2">
                <Badge variant={user?.is_activated_account ? "default" : "secondary"}>
                  {user?.is_activated_account
                    ? t("dashboard.account_active") || "Active"
                    : t("dashboard.account_inactive") || "Inactive"}
                </Badge>
                <Button variant="outline" size="sm" disabled>
                  <Edit2 className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="first_name">{t("auth.first_name") || "First name"}</Label>
                <Input
                  id="first_name"
                  name="first_name"
                  value={profileData.first_name}
                  onChange={handleProfileChange}
                  placeholder="John"
                  autoComplete="given-name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="last_name">{t("auth.last_name") || "Last name"}</Label>
                <Input
                  id="last_name"
                  name="last_name"
                  value={profileData.last_name}
                  onChange={handleProfileChange}
                  placeholder="Doe"
                  autoComplete="family-name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="username">{t("auth.username") || "Username"}</Label>
                <Input
                  id="username"
                  name="username"
                  value={profileData.username}
                  disabled
                  readOnly
                />
                <p className="text-xs text-muted-foreground">
                  {t("dashboard.username_readonly") || "Username cannot be changed."}
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">{t("auth.email") || "Email"}</Label>
                <Input
                  id="email"
                  type="email"
                  name="email"
                  value={profileData.email}
                  disabled
                  readOnly
                />
                <p className="text-xs text-muted-foreground">
                  {t("dashboard.email_readonly") || "Email is managed by your organization."}
                </p>
              </div>
            </div>

            {profileError && (
              <div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {profileError}
              </div>
            )}
            {profileSuccess && (
              <div className="rounded-md border border-success/30 bg-success/10 px-3 py-2 text-sm text-success">
                {t("common.success") || "Profile updated successfully"}
              </div>
            )}
          </CardContent>
          <CardFooter className="justify-end">
            <Button
              onClick={handleProfileSave}
              disabled={profileSaving || isLoading}
            >
              {profileSaving
                ? t("common.loading")
                : t("dashboard.update_settings") || "Update settings"}
            </Button>
          </CardFooter>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{t("dashboard.security_settings") || "Security"}</CardTitle>
              <CardDescription>
                {t("dashboard.security_settings_description") ||
                  "Manage authentication options for your account."}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between gap-4">
                <div className="space-y-1">
                  <p className="text-sm font-medium">
                    {t("dashboard.2fa_checking") || "Two-factor authentication"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {t("dashboard.2fa_description") ||
                      "Add an extra layer of security to your account."}
                  </p>
                </div>
                <Switch
                  checked={is2FAEnabled}
                  onCheckedChange={handleToggle2FA}
                  disabled={twoFALoading || isLoading}
                />
              </div>

              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Badge variant={is2FAEnabled ? "default" : "secondary"}>
                  {is2FAEnabled
                    ? t("dashboard.2fa_enabled") || "Enabled"
                    : t("dashboard.2fa_disabled") || "Disabled"}
                </Badge>
                {twoFALoading && <span>{t("common.loading") || "Updating"}...</span>}
              </div>

              {twoFAError && (
                <div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                  {twoFAError}
                </div>
              )}
              {twoFASuccess && (
                <div className="rounded-md border border-success/30 bg-success/10 px-3 py-2 text-sm text-success">
                  {twoFASuccess === "enabled"
                    ? t("dashboard.2fa_enabled") || "2FA Enabled"
                    : t("dashboard.2fa_disabled") || "2FA Disabled"}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t("auth.change_password") || "Change Password"}</CardTitle>
              <CardDescription>
                {t("auth.change_password_description") ||
                  "Update your password to keep your account secure."}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ChangePasswordForm />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

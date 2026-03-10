"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Plus, CheckCircle2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { teamService, AddMemberRequest } from "@/lib/team-service";
import { ApiError } from "@/lib/api-client";

interface AddMemberDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  teamId: number | null;
  onSuccess: () => void;
}

export function AddMemberDialog({
  open,
  onOpenChange,
  teamId,
  onSuccess,
}: AddMemberDialogProps) {
  const t = useTranslations();
  const [memberName, setMemberName] = useState("");
  const [memberEmail, setMemberEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{
    name?: string;
    email?: string;
    general?: string;
  }>({});
  const [showSuccess, setShowSuccess] = useState(false);

  const resetForm = () => {
    setMemberName("");
    setMemberEmail("");
    setErrors({});
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    if (!memberName.trim()) {
      setErrors({ name: t("dashboard.member_name_required") });
      return;
    }

    if (!memberEmail.trim()) {
      setErrors({ email: t("dashboard.member_email_required") });
      return;
    }

    if (!teamId) {
      setErrors({ general: t("dashboard.select_team_first") });
      return;
    }

    setIsLoading(true);
    try {
      const request: AddMemberRequest = {
        identifier: memberEmail.trim(),
        role: "member",
        team_id: teamId,
      };

      await teamService.addMember(request);
      setShowSuccess(true);
      resetForm();
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.statusCode === 400) {
          setErrors({
            email: t("dashboard.email_already_registered"),
          });
        } else if (err.statusCode === 404) {
          setErrors({
            email: t("dashboard.user_not_found"),
          });
        } else if (err.statusCode === 422 && err.details) {
          setErrors({ general: err.message });
        } else {
          setErrors({ general: err.message });
        }
      } else {
        setErrors({ general: t("dashboard.add_member_error") });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    resetForm();
    setShowSuccess(false);
    onOpenChange(false);
  };

  const handleBackFromSuccess = () => {
    handleClose();
    onSuccess();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        {!showSuccess ? (
          <>
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold">
                {t("dashboard.add_new_member")}
              </DialogTitle>
              <DialogDescription>
                {t("dashboard.add_member_description")}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="memberName">
                  {t("dashboard.member_name")}
                </Label>
                <Input
                  id="memberName"
                  type="text"
                  placeholder={t("dashboard.member_name_placeholder")}
                  value={memberName}
                  onChange={(e) => setMemberName(e.target.value)}
                  disabled={isLoading}
                  className={errors.name ? "border-destructive" : ""}
                />
                {errors.name && (
                  <p className="text-sm text-destructive mt-1">{errors.name}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="memberEmail">
                  {t("dashboard.member_email")}
                </Label>
                <Input
                  id="memberEmail"
                  type="email"
                  placeholder={t("dashboard.member_email_placeholder")}
                  value={memberEmail}
                  onChange={(e) => setMemberEmail(e.target.value)}
                  disabled={isLoading}
                  className={errors.email ? "border-destructive" : ""}
                />
                {errors.email && (
                  <p className="text-sm text-destructive mt-1">{errors.email}</p>
                )}
              </div>

              {/* Role selection skipped for now as per user request */}
              {/* <div className="space-y-2">
                <Label htmlFor="memberRole">
                  {t("dashboard.select_member_role")}
                </Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder={t("dashboard.select_role")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="member">Member</SelectItem>
                    <SelectItem value="viewer">Viewer</SelectItem>
                  </SelectContent>
                </Select>
              </div> */}

              {errors.general && (
                <p className="text-sm text-destructive">{errors.general}</p>
              )}

              <div className="flex gap-3 justify-end">
                <Button
                  type="button"
                  variant="destructive"
                  onClick={handleClose}
                  disabled={isLoading}
                >
                  {t("common.cancel")}
                </Button>
                <Button
                  type="submit"
                  disabled={isLoading}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  {isLoading
                    ? t("common.adding")
                    : t("dashboard.add_member_button")}
                </Button>
              </div>
            </form>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-8 space-y-6">
            <div className="relative">
              <div className="w-24 h-24 rounded-full bg-primary flex items-center justify-center">
                <CheckCircle2 className="w-12 h-12 text-primary-foreground" />
              </div>
            </div>
            <div className="text-center space-y-2">
              <h3 className="text-2xl font-bold text-foreground">
                {t("dashboard.member_added_successfully")}
              </h3>
            </div>
            <Button
              onClick={handleBackFromSuccess}
            >
              {t("common.back")}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

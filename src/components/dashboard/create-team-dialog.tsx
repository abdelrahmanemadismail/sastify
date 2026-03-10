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
import { teamService } from "@/lib/team-service";
import { ApiError } from "@/lib/api-client";
import { getValidationErrors } from "@/lib/error-handler";

interface CreateTeamDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function CreateTeamDialog({
  open,
  onOpenChange,
  onSuccess,
}: CreateTeamDialogProps) {
  const t = useTranslations();
  const [teamName, setTeamName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!teamName.trim()) {
      setError(t("dashboard.team_name_required"));
      return;
    }

    setIsLoading(true);
    try {
      await teamService.createTeam(teamName.trim());
      setShowSuccess(true);
      setTeamName("");
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.statusCode === 422 && err.details) {
          const validationErrors = getValidationErrors(err);
          setError(validationErrors.name || err.message);
        } else {
          setError(err.message);
        }
      } else {
        setError(t("dashboard.create_team_error"));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setTeamName("");
    setError(null);
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
                {t("dashboard.create_team")}
              </DialogTitle>
              <DialogDescription>
                {t("dashboard.create_team_description")}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="teamName">{t("dashboard.team_name")}</Label>
                <Input
                  id="teamName"
                  type="text"
                  placeholder={t("dashboard.team_name_placeholder")}
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  disabled={isLoading}
                  className={error ? "border-destructive" : ""}
                />
                {error && (
                  <p className="text-sm text-destructive mt-1">{error}</p>
                )}
              </div>
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
                    ? t("common.creating")
                    : t("dashboard.create_team_button")}
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
                {t("dashboard.team_added_successfully")}
              </h3>
            </div>
            <div className="flex gap-3">
              <Button
                onClick={handleBackFromSuccess}
                variant="destructive"
              >
                {t("common.back")}
              </Button>
              <Button
                onClick={() => {
                  handleClose();
                  onSuccess();
                }}
              >
                <Plus className="w-4 h-4 mr-2" />
                {t("dashboard.add_new_member")}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

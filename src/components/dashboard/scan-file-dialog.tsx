"use client";

import { useState, useRef } from "react";
import { useTranslations } from "next-intl";
import { Upload, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { scanService, StartScanResponse } from "@/lib/scan-service";
import { projectService } from "@/lib/project-service";
import { ApiError } from "@/lib/api-client";
import { cn } from "@/lib/utils";

interface ScanFileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onScanReady: (payload: {
    directResult: StartScanResponse["data"];
    fileName: string;
  }) => void;
}

export function ScanFileDialog({
  open,
  onOpenChange,
  onScanReady,
}: ScanFileDialogProps) {
  const t = useTranslations();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatePDF, setGeneratePDF] = useState(true);
  const [generateHTML, setGenerateHTML] = useState(false);
  const [useAI, setUseAI] = useState(false);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      // Validate file type and size (e.g., max 50MB)
      const maxSize = 50 * 1024 * 1024;
      if (file.size > maxSize) {
        setError(t("dashboard.file_too_large"));
        setSelectedFile(null);
        return;
      }
      setSelectedFile(file);
      setError(null);
    }
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
    const files = event.dataTransfer.files;
    if (files && files.length > 0) {
      const file = files[0];
      const maxSize = 50 * 1024 * 1024;
      if (file.size > maxSize) {
        setError(t("dashboard.file_too_large"));
        setSelectedFile(null);
        return;
      }
      setSelectedFile(file);
      setError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!selectedFile) {
      setError(t("dashboard.file_required"));
      return;
    }

    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append("project", selectedFile);

      const projectId = await projectService.uploadProject(formData);
      const response = await scanService.startScan(projectId, {
        pdf: generatePDF,
        html: generateHTML,
        ai: useAI,
      });

      onScanReady({
        directResult: response.data,
        fileName: selectedFile.name,
      });

      setSelectedFile(null);
      setGeneratePDF(true);
      setGenerateHTML(false);
      setUseAI(false);
      onOpenChange(false);
    } catch (err) {
      const errorMessage = err instanceof ApiError
        ? err.message
        : t("dashboard.scan_file_error");
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      setSelectedFile(null);
      setError(null);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <>
          <DialogHeader>
            <DialogTitle>{t("dashboard.scan_new_file")}</DialogTitle>
            <DialogDescription>
              {t("dashboard.upload_file_to_scan")}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* File Upload Area */}
            <div
              className={cn(
                "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors",
                selectedFile
                  ? "border-green-500 bg-green-50 dark:bg-green-950"
                  : "border-gray-300 hover:border-gray-400 dark:border-gray-600 dark:hover:border-gray-500"
              )}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                onChange={handleFileSelect}
                accept=".js,.ts,.jsx,.tsx,.py,.java,.cpp,.c,.cs,.go,.rb,.php,.swift,.kt,.rs,.scala,.groovy,.lua"
              />
              <div className="space-y-2">
                <Upload className="w-10 h-10 mx-auto text-gray-400" />
                {selectedFile ? (
                  <>
                    <p className="font-medium text-green-700 dark:text-green-300">
                      {selectedFile.name}
                    </p>
                    <p className="text-sm text-green-600 dark:text-green-400">
                      {(selectedFile.size / 1024).toFixed(2)} KB
                    </p>
                  </>
                ) : (
                  <>
                    <p className="font-medium">
                      {t("dashboard.drag_drop_file")}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {t("dashboard.or_click_to_select")}
                    </p>
                  </>
                )}
              </div>
            </div>

            {error && (
              <div className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950 rounded p-3">
                {error}
              </div>
            )}

            {/* Options */}
            <div className="space-y-3 border-t pt-4">
              <Label className="text-base font-medium">
                {t("dashboard.report_options")}
              </Label>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="generatePDF"
                    checked={generatePDF}
                    onCheckedChange={(checked) =>
                      setGeneratePDF(checked as boolean)
                    }
                  />
                  <Label
                    htmlFor="generatePDF"
                    className="font-normal cursor-pointer"
                  >
                    {t("dashboard.generate_pdf_report")}
                  </Label>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="generateHTML"
                      checked={generateHTML}
                      onCheckedChange={(checked) =>
                        setGenerateHTML(checked as boolean)
                      }
                    />
                    <Label
                      htmlFor="generateHTML"
                      className="font-normal cursor-pointer"
                    >
                      {t("dashboard.generate_html_report")}
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="useAI"
                      checked={useAI}
                      onCheckedChange={(checked) => setUseAI(checked as boolean)}
                    />
                    <Label
                      htmlFor="useAI"
                      className="font-normal cursor-pointer"
                    >
                      {t("dashboard.use_ai_analysis")}
                    </Label>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isLoading}
              >
                {t("common.cancel")}
              </Button>
              <Button
                type="submit"
                disabled={!selectedFile || isLoading}
                className="min-w-[120px]"
              >
                {isLoading && (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                )}
                {isLoading
                  ? t("dashboard.uploading")
                  : t("dashboard.start_scan")}
              </Button>
            </div>
          </form>
        </>
      </DialogContent>
    </Dialog>
  );
}

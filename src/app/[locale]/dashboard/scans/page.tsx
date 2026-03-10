"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { Search, FileUp, FolderOpen, AlertCircle, Loader2, Square } from "lucide-react";
import { useTranslations } from "next-intl";
import JSZip from "jszip";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { DashboardPageWrapper } from "@/components/dashboard/page-wrapper";
import { ScanFileDialog } from "@/components/dashboard/scan-file-dialog";
import { useScans } from "@/hooks/useScans";
import { useProjects } from "@/hooks/useProjects";
import { useScanProcess } from "@/hooks/useScanProcess";
import { projectService } from "@/lib/project-service";
import {
  normalizeSeverity,
  scanService,
  ScanWebSocketResult,
  StartScanResponse,
} from "@/lib/scan-service";
import { ApiError } from "@/lib/api-client";
import { useAuthStore } from "@/lib/auth-store";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const historicalFindings404ScanIds = new Set<number>();
const historicalFindingsInFlightScanIds = new Set<number>();
interface ScanOptions {
  pdf: boolean;
  html: boolean;
  ai: boolean;
}

interface ScanReadyPayload {
  directResult: StartScanResponse["data"];
  fileName: string;
}

type ScanPhase = "idle" | "uploading" | "scanning" | "results";

export default function ScansPage() {
  const t = useTranslations();
  const accessToken = useAuthStore((state) => state.accessToken);
  const { scans, error: scansError, fetchScans } = useScans();
  const { projects, isLoading: projectsLoading } = useProjects();
  const {
    scanning,
    currentStep,
    scanResult,
    error: scanError,
    progress,
    steps,
    startScan,
    stopScan,
    reset,
  } = useScanProcess();

  const [scanModalOpen, setShowScanModal] = useState(false);
  const [gitModalOpen, setGitModalOpen] = useState(false);
  const [scanFileDialogOpen, setScanFileDialogOpen] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);
  const [activeProjectId, setActiveProjectId] = useState<number | null>(null);
  const [activeProjectName, setActiveProjectName] = useState("");
  const [scanPhase, setScanPhase] = useState<ScanPhase>("idle");
  const [gitProvider, setGitProvider] = useState("github");
  const [repoUrl, setRepoUrl] = useState("");
  const [repoBranch, setRepoBranch] = useState("");
  const [repoToken, setRepoToken] = useState("");
  const [gitError, setGitError] = useState<string | null>(null);
  const [isImportingGit, setIsImportingGit] = useState(false);
  const [isUploadingFolder, setIsUploadingFolder] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [downloadError, setDownloadError] = useState<string | null>(null);
  const [scanOptions, setScanOptions] = useState<ScanOptions>({
    pdf: true,
    html: false,
    ai: false,
  });
  const [historicalSeverityStats, setHistoricalSeverityStats] = useState({
    C: 0,
    H: 0,
    M: 0,
    L: 0,
  });
  const [directScanResult, setDirectScanResult] = useState<ScanWebSocketResult | null>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);

  const handleScanClick = (projectId: number) => {
    setSelectedProjectId(projectId);
    setShowScanModal(true);
  };

  useEffect(() => {
    if (scanResult) {
      setScanPhase("results");
      fetchScans();
    }
  }, [fetchScans, scanResult]);

  useEffect(() => {
    let cancelled = false;

    const loadHistoricalSeverityStats = async () => {
      const successfulScans = scans
        .filter(
          (scan) =>
            scan.state === "success" &&
            scan.generated_reports_count > 0 &&
            !historicalFindings404ScanIds.has(scan.scan_id) &&
            !historicalFindingsInFlightScanIds.has(scan.scan_id)
        )
        .slice(0, 4);

      if (successfulScans.length === 0) {
        if (!cancelled) {
          setHistoricalSeverityStats({ C: 0, H: 0, M: 0, L: 0 });
        }
        return;
      }

      const totals = { C: 0, H: 0, M: 0, L: 0 };

      await Promise.all(
        successfulScans.map(async (scan) => {
          if (scan.vulnerabilities_count === 0) {
            return;
          }

          historicalFindingsInFlightScanIds.add(scan.scan_id);

          let page = 1;
          let totalPages = 1;

          try {
            while (page <= totalPages) {
              const response = await scanService.fetchFindings(scan.scan_id, page, 100);
              response.data.forEach((finding) => {
                const normalizedSeverity = normalizeSeverity(finding.severity);
                if (normalizedSeverity) {
                  totals[normalizedSeverity] += 1;
                }
              });
              totalPages =
                typeof response.message === "string"
                  ? totalPages
                  : response.message.total_pages ?? totalPages;
              page += 1;
            }
          } catch (error) {
            // Some historical scans can exist without persisted findings; ignore and continue.
            if (error instanceof ApiError && error.statusCode === 404) {
              historicalFindings404ScanIds.add(scan.scan_id);
              return;
            }

            if (!(error instanceof ApiError && error.statusCode === 404)) {
              throw error;
            }
          } finally {
            historicalFindingsInFlightScanIds.delete(scan.scan_id);
          }
        })
      );

      if (!cancelled) {
        setHistoricalSeverityStats(totals);
      }
    };

    loadHistoricalSeverityStats().catch(() => {
      if (!cancelled) {
        setHistoricalSeverityStats({ C: 0, H: 0, M: 0, L: 0 });
      }
    });

    return () => {
      cancelled = true;
    };
  }, [scans]);

  const handleStartScan = async () => {
    if (selectedProjectId === null) return;

    const selectedProject = projects.find((project) => project.id === selectedProjectId);
    setActiveProjectId(selectedProjectId);
    setActiveProjectName(selectedProject?.name ?? "");
    setScanPhase("scanning");
    setShowScanModal(false);

    await startScan(selectedProjectId, scanOptions);
  };

  const handleScanReady = async (payload: ScanReadyPayload) => {
    const mappedResult: ScanWebSocketResult = {
      duration: payload.directResult.duration,
      findings_count: payload.directResult.findings_count,
      generated_on: payload.directResult.generated_on,
      pdf_download_link: payload.directResult.pdf_download_link,
      html_download_link: payload.directResult.html_download_link,
      findings: [],
      severityCount: { C: 0, H: 0, M: 0, L: 0 },
    };

    setActiveProjectId(null);
    setActiveProjectName(payload.fileName);
    setDirectScanResult(mappedResult);
    setScanPhase("results");
    await fetchScans();
  };

  const handleStartNewScan = () => {
    reset();
    setScanPhase("idle");
    setActiveProjectId(null);
    setActiveProjectName("");
    setDownloadError(null);
    setActionError(null);
    setDirectScanResult(null);
  };

  const triggerFolderUpload = () => {
    folderInputRef.current?.click();
  };

  const handleFolderProjectUploadAndScan = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const folderFiles = Array.from(event.target.files || []);
    event.target.value = "";

    if (folderFiles.length === 0) {
      return;
    }

    setActionError(null);
    setDirectScanResult(null);
    setIsUploadingFolder(true);
    setScanPhase("uploading");

    try {
      const zip = new JSZip();

      for (const file of folderFiles) {
        const path = file.webkitRelativePath || file.name;
        zip.file(path, file);
      }

      const rootFolder =
        folderFiles[0].webkitRelativePath?.split("/")[0] ||
        `project-${Date.now()}`;

      setActiveProjectName(rootFolder);

      const zipBlob = await zip.generateAsync({
        type: "blob",
        compression: "DEFLATE",
        compressionOptions: { level: 6 },
      });

      const zipFile = new File([zipBlob], `${rootFolder}.zip`, {
        type: "application/zip",
      });

      const formData = new FormData();
      formData.append("project", zipFile);

      const projectId = await projectService.uploadProject(formData);

      setActiveProjectId(projectId);
      setScanPhase("scanning");
      await startScan(projectId, { pdf: true, html: false, ai: false });
    } catch (err) {
      setActionError(err instanceof Error ? err.message : t("dashboard.upload_failed"));
      setScanPhase("idle");
      setActiveProjectId(null);
      setActiveProjectName("");
    } finally {
      setIsUploadingFolder(false);
    }
  };

  const handleGitImportAndScan = async () => {
    if (!repoUrl.trim()) {
      setGitError(t("dashboard.repo_url_required"));
      return;
    }

    setGitError(null);
    setIsImportingGit(true);

    try {
      if (!accessToken) {
        throw new Error("Session expired. Please login again.");
      }

      if (gitProvider !== "github" && !repoToken.trim()) {
        throw new Error(t("dashboard.access_token_required_for_provider"));
      }

      const projectId = await projectService.uploadGitProject(
        repoToken.trim() || undefined,
        repoBranch.trim(),
        gitProvider,
        repoUrl.trim()
      );

      setActiveProjectId(projectId);
      setScanPhase("uploading");

      try {
        const uploadedProject = await projectService.fetchProjectDetails(projectId);
        setActiveProjectName(uploadedProject.name);
      } catch {
        setActiveProjectName(repoUrl.trim());
      }

      setGitModalOpen(false);
      setRepoUrl("");
      setRepoBranch("");
      setRepoToken("");
      setScanPhase("scanning");
      await startScan(projectId, { pdf: true, html: false, ai: false });
    } catch (err) {
      setGitError(err instanceof Error ? err.message : t("dashboard.upload_failed"));
    } finally {
      setIsImportingGit(false);
    }
  };

  const handleDownload = async (link: string) => {
    setDownloadError(null);
    try {
      await scanService.downloadReport(link);
    } catch {
      setDownloadError(t("dashboard.download_failed"));
    }
  };

  const selectedProject = projects.find((p) => p.id === selectedProjectId);
  const recentScans = scans.slice(0, 4);
  const displayedScanResult = scanResult ?? directScanResult;

  const severityStats = useMemo(() => {
    if (displayedScanResult?.severityCount) {
      return {
        C: displayedScanResult.severityCount.C ?? 0,
        H: displayedScanResult.severityCount.H ?? 0,
        M: displayedScanResult.severityCount.M ?? 0,
        L: displayedScanResult.severityCount.L ?? 0,
      };
    }

    return historicalSeverityStats;
  }, [displayedScanResult, historicalSeverityStats]);

  const totalMappedSeverities = useMemo(
    () => severityStats.C + severityStats.H + severityStats.M + severityStats.L,
    [severityStats]
  );

  const hasUnmappedResultSeverities =
    Boolean(displayedScanResult) &&
    (displayedScanResult?.findings_count ?? 0) > 0 &&
    totalMappedSeverities === 0;

  const shouldShowSeverityBreakdown = !hasUnmappedResultSeverities;

  const resolvedCurrentStep = currentStep >= 0 ? steps[currentStep] : t("dashboard.initializing");

  const findings = displayedScanResult?.findings ?? [];

  const formatPath = (path: string) => {
    const parts = path.split("/project-");
    return parts[1]?.split("/").slice(1).join("/") || path;
  };

  return (
    <DashboardPageWrapper
      title={t("dashboard.new_scan") || "New Scan"}
      translationKey="new_scan"
      icon={<Search className="w-8 h-8" />}
    >
      {/* Error Alerts */}
      {scansError && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg mb-6">
          {scansError}
        </div>
      )}

      {scanError && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg mb-6">
          {scanError || t("dashboard.scan_failed")}
        </div>
      )}

      {downloadError && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg mb-6">
          {downloadError}
        </div>
      )}

      {actionError && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg mb-6">
          {actionError}
        </div>
      )}

      <input
        ref={folderInputRef}
        type="file"
        className="hidden"
        onChange={handleFolderProjectUploadAndScan}
        multiple
        {...({ webkitdirectory: "true", directory: "" } as Record<string, string>)}
      />

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column - Scan Options */}
        <div className="lg:col-span-2 space-y-6">
          {/* Styled Scan Actions */}
          <Card className="p-5 sm:p-6 bg-card border-border shadow-sm">
            <div className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <button
                  type="button"
                  className="h-24 rounded-2xl bg-muted/40 border border-border hover:bg-muted/60 transition-colors flex items-center justify-start px-6 gap-4"
                  onClick={() => setScanFileDialogOpen(true)}
                >
                  <div className="h-12 w-12 rounded-xl bg-background flex items-center justify-center border border-border/50">
                    <FileUp className="w-6 h-6 text-foreground" />
                  </div>
                  <span className="text-xl font-semibold tracking-tight text-foreground">{t("dashboard.scan_new_file")}</span>
                </button>

                <button
                  type="button"
                  className="h-24 rounded-2xl bg-muted/40 border border-border hover:bg-muted/60 transition-colors flex items-center justify-start px-6 gap-4 disabled:opacity-60"
                  onClick={triggerFolderUpload}
                  disabled={isUploadingFolder || scanning}
                >
                  <div className="h-12 w-12 rounded-xl bg-background flex items-center justify-center border border-border/50">
                    <Search className="w-6 h-6 text-foreground" />
                  </div>
                  <span className="text-xl font-semibold tracking-tight text-foreground">
                    {isUploadingFolder ? t("dashboard.uploading_project") : t("dashboard.scan_new_project")}
                  </span>
                </button>
              </div>

              <button
                type="button"
                className="w-full h-24 rounded-2xl bg-muted/30 border border-border hover:bg-muted/50 transition-colors flex items-center justify-start px-6 gap-4"
                onClick={() => setGitModalOpen(true)}
              >
                <div className="h-12 w-12 rounded-xl bg-red-500/90 text-white flex items-center justify-center">
                  <FolderOpen className="w-6 h-6" />
                </div>
                <span className="text-xl font-semibold tracking-tight text-foreground">{t("dashboard.git_import")}</span>
              </button>

              <button
                type="button"
                className="w-full h-28 rounded-2xl bg-muted/20 border border-dashed border-border hover:bg-muted/40 transition-colors flex items-center justify-center gap-4 disabled:opacity-60"
                onClick={triggerFolderUpload}
                disabled={isUploadingFolder || scanning}
              >
                <div className="h-12 w-12 rounded-xl bg-background flex items-center justify-center border border-border/50">
                  <FileUp className="w-6 h-6 text-foreground" />
                </div>
                <span className="text-xl sm:text-2xl font-semibold tracking-tight text-foreground">{t("dashboard.drag_project_or_file")}</span>
              </button>
            </div>
          </Card>

          {/* Projects List for Quick Scanning */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">{t("dashboard.recent_projects")}</h3>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {projectsLoading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex justify-between items-center p-3 border rounded">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-8 w-20" />
                  </div>
                ))
              ) : projects.length > 0 ? (
                projects.slice(0, 5).map((project) => (
                  <div
                    key={project.id}
                    className="flex justify-between items-center p-3 border rounded hover:bg-accent transition-colors"
                  >
                    <span className="font-medium truncate">{project.name}</span>
                    <Button
                      size="sm"
                      onClick={() => handleScanClick(project.id)}
                      disabled={scanning}
                    >
                      {t("dashboard.quick_scan")}
                    </Button>
                  </div>
                ))
              ) : (
                <div className="text-center py-6 text-muted-foreground">
                  {t("dashboard.no_projects_found")}
                </div>
              )}
            </div>
          </Card>

          {/* Scanning Progress */}
          {scanPhase === "uploading" && (
            <Card className="p-6 border-blue-200 bg-blue-50 dark:bg-blue-950 dark:border-blue-800">
              <div className="flex items-center gap-3 text-blue-900 dark:text-blue-100">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span className="font-medium">{t("dashboard.uploading_project")}</span>
              </div>
            </Card>
          )}

          {scanPhase === "scanning" && (
            <Card className="p-6 border-blue-200 bg-blue-50 dark:bg-blue-950 dark:border-blue-800">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-blue-500 animate-pulse" />
                  <h3 className="font-semibold text-blue-900 dark:text-blue-100">
                    {t("dashboard.scan_progress")}
                  </h3>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
                  <div
                    className="bg-blue-600 h-full transition-all duration-300 rounded-full"
                    style={{ width: `${progress}%` }}
                  />
                </div>

                {/* Progress Percentage */}
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                    {progress}%
                  </p>
                  <p className="text-xs text-blue-700 dark:text-blue-300">
                    {t("dashboard.scan_step_current", {
                      step: currentStep + 1,
                      total: steps.length,
                    })}
                  </p>
                </div>

                {/* Status Messages */}
                <div className="space-y-2 text-sm text-blue-800 dark:text-blue-200 max-h-52 overflow-y-auto">
                  <p className="font-medium">{resolvedCurrentStep}</p>
                  <ul className="space-y-1">
                    {steps.map((step, idx) => (
                      <li
                        key={step}
                        className={`text-xs ${
                          idx < currentStep
                            ? "text-green-700 dark:text-green-300"
                            : idx === currentStep
                              ? "font-semibold"
                              : "text-blue-700/70 dark:text-blue-300/70"
                        }`}
                      >
                        {step}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="flex justify-end">
                  <Button
                    type="button"
                    variant="destructive"
                    disabled={!scanning || activeProjectId === null}
                    onClick={() => {
                      if (activeProjectId !== null) {
                        stopScan(activeProjectId);
                        setScanPhase("idle");
                      }
                    }}
                  >
                    <Square className="w-4 h-4 mr-2" />
                    {t("dashboard.stop_scan")}
                  </Button>
                </div>
              </div>
            </Card>
          )}

          {scanPhase === "results" && displayedScanResult && (
            <Card className="p-6 border-green-200 bg-green-50 dark:bg-green-950 dark:border-green-800">
              <div className="space-y-5">
                <h3 className="text-xl font-semibold text-green-900 dark:text-green-100">
                  {t("dashboard.scan_results")}
                </h3>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="text-sm">
                    <p className="text-muted-foreground">{t("dashboard.target_project")}</p>
                    <p className="font-medium">{activeProjectName || "-"}</p>
                  </div>
                  <div className="text-sm">
                    <p className="text-muted-foreground">{t("dashboard.scan_duration")}</p>
                    <p className="font-medium">{String(displayedScanResult.duration)}</p>
                  </div>
                  <div className="text-sm">
                    <p className="text-muted-foreground">{t("dashboard.total_findings")}</p>
                    <p className="font-medium">{displayedScanResult.findings_count}</p>
                  </div>
                  <div className="text-sm">
                    <p className="text-muted-foreground">{t("dashboard.scan_date")}</p>
                    <p className="font-medium">{new Date(displayedScanResult.generated_on).toLocaleString()}</p>
                  </div>
                </div>

                {shouldShowSeverityBreakdown && (
                  <div className="flex flex-wrap gap-2">
                    <Badge className="bg-red-600">C {severityStats.C}</Badge>
                    <Badge className="bg-orange-600">H {severityStats.H}</Badge>
                    <Badge className="bg-yellow-600">M {severityStats.M}</Badge>
                    <Badge className="bg-gray-600">L {severityStats.L}</Badge>
                  </div>
                )}

                <div className="flex flex-wrap gap-3">
                  {displayedScanResult.pdf_download_link && (
                    <Button type="button" onClick={() => handleDownload(displayedScanResult.pdf_download_link!)}>
                      {t("dashboard.download_pdf_report")}
                    </Button>
                  )}
                  {displayedScanResult.html_download_link && (
                    <Button type="button" variant="outline" onClick={() => handleDownload(displayedScanResult.html_download_link!)}>
                      {t("dashboard.download_html_report")}
                    </Button>
                  )}
                  <Button type="button" variant="secondary" onClick={handleStartNewScan}>
                    {t("dashboard.start_new_scan")}
                  </Button>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium">{t("dashboard.vulnerability_list")}</h4>
                  <div className="max-h-60 overflow-y-auto space-y-2">
                    {findings.length > 0 ? (
                      findings.map((finding, index) => (
                        <div key={`${finding.title}-${index}`} className="p-3 rounded border bg-background">
                          <p className="font-medium">{finding.title}</p>
                          <p className="text-xs text-muted-foreground">{formatPath(finding.path)}</p>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground">{t("dashboard.no_findings")}</p>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          )}
        </div>

        {/* Right Column - Sidebar */}
        <div className="space-y-6">
          {/* Latest Scans Overview */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">{t("dashboard.latest_scans_overview")}</h3>
            <div className="space-y-3">
              <div className="text-center">
                <p className="text-3xl font-bold">{recentScans.length}</p>
                <p className="text-sm text-muted-foreground">{t("dashboard.scans")} this week</p>
              </div>

              {/* Severity Stats */}
              {shouldShowSeverityBreakdown && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{t("dashboard.critical_bugs")}</span>
                    <Badge className="bg-red-600">C {severityStats.C}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{t("dashboard.high_bugs")}</span>
                    <Badge className="bg-orange-600">H {severityStats.H}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{t("dashboard.medium_bugs")}</span>
                    <Badge className="bg-yellow-600">M {severityStats.M}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{t("dashboard.low_bugs")}</span>
                    <Badge className="bg-gray-600">L {severityStats.L}</Badge>
                  </div>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>

      {/* Scan Options Modal */}
      <Dialog open={scanModalOpen} onOpenChange={setShowScanModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t("dashboard.scanning_options")}</DialogTitle>
            <DialogDescription>
              {t("dashboard.select_options")}{" "}
              <span className="font-medium">{selectedProject?.name}</span>
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Report Format Options */}
            <div className="space-y-3">
              <h4 className="font-medium text-sm">{t("dashboard.report_name")}</h4>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="pdf"
                  checked={scanOptions.pdf}
                  onCheckedChange={(checked) =>
                    setScanOptions({ ...scanOptions, pdf: checked as boolean })
                  }
                />
                <label
                  htmlFor="pdf"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                >
                  {t("dashboard.pdf_report")}
                </label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="html"
                  checked={scanOptions.html}
                  onCheckedChange={(checked) =>
                    setScanOptions({ ...scanOptions, html: checked as boolean })
                  }
                />
                <label
                  htmlFor="html"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                >
                  {t("dashboard.html_report")}
                </label>
              </div>
            </div>

            {/* AI Analysis Option */}
            <div className="space-y-3 pt-4 border-t">
              <h4 className="font-medium text-sm flex items-center gap-2">
                AI Analysis <Badge className="bg-blue-600">Pro</Badge>
              </h4>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="ai"
                  checked={scanOptions.ai}
                  onCheckedChange={(checked) =>
                    setScanOptions({ ...scanOptions, ai: checked as boolean })
                  }
                />
                <label
                  htmlFor="ai"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                >
                  {t("dashboard.enable_ai")}
                </label>
              </div>
            </div>
          </div>

          {/* Helper Text */}
          <div className="rounded-lg bg-blue-50 dark:bg-blue-950 p-3 flex gap-2">
            <AlertCircle className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-blue-900 dark:text-blue-300">
              {t("dashboard.report_options_info")}
            </p>
          </div>

          <DialogFooter className="pt-4">
            <Button
              variant="outline"
              onClick={() => setShowScanModal(false)}
              disabled={scanning}
            >
              {t("dashboard.cancel")}
            </Button>
            <Button
              onClick={handleStartScan}
              disabled={scanning}
              className="bg-green-600 hover:bg-green-700"
            >
              {scanning ? (
                <>
                  <span className="animate-spin mr-2">⟳</span>
                  {t("dashboard.scanning")}
                </>
              ) : (
                t("dashboard.start_scanning_project")
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={gitModalOpen} onOpenChange={setGitModalOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{t("dashboard.git_import")}</DialogTitle>
            <DialogDescription>{t("dashboard.upload_file_to_scan")}</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>{t("dashboard.repo_provider")}</Label>
              <Select value={gitProvider} onValueChange={setGitProvider}>
                <SelectTrigger>
                  <SelectValue placeholder={t("dashboard.repo_provider")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="github">GitHub</SelectItem>
                  <SelectItem value="gitlab">GitLab</SelectItem>
                  <SelectItem value="bitbucket">Bitbucket</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="repoUrl">{t("dashboard.repo_url")}</Label>
              <Input
                id="repoUrl"
                value={repoUrl}
                onChange={(event) => setRepoUrl(event.target.value)}
                placeholder={t("dashboard.repo_url_placeholder")}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="repoBranch">{t("dashboard.repo_branch")}</Label>
              <Input
                id="repoBranch"
                value={repoBranch}
                onChange={(event) => setRepoBranch(event.target.value)}
                placeholder={t("dashboard.repo_branch_placeholder")}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="repoToken">{t("dashboard.access_token")}</Label>
              <Input
                id="repoToken"
                type="password"
                value={repoToken}
                onChange={(event) => setRepoToken(event.target.value)}
                placeholder={t("dashboard.access_token_placeholder")}
              />
            </div>

            {gitError && (
              <div className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950 rounded p-3">
                {gitError}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setGitModalOpen(false)}
              disabled={isImportingGit}
            >
              {t("dashboard.cancel")}
            </Button>
            <Button onClick={handleGitImportAndScan} disabled={isImportingGit}>
              {isImportingGit ? t("dashboard.importing") : t("dashboard.import_repository")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ScanFileDialog
        open={scanFileDialogOpen}
        onOpenChange={setScanFileDialogOpen}
        onScanReady={handleScanReady}
      />
    </DashboardPageWrapper>
  );
}

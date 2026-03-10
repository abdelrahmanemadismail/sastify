"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { ArrowLeft, Download, FileText, Folder, RefreshCw, ShieldAlert } from "lucide-react";
import { DashboardPageWrapper } from "@/components/dashboard/page-wrapper";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { projectService, ProjectDetails } from "@/lib/project-service";
import { normalizeSeverity, scanService, Scan, SeverityCode, Finding } from "@/lib/scan-service";
import { reportService, Report } from "@/lib/report-service";

type SeveritySummary = Record<SeverityCode, number>;

const EMPTY_SEVERITY_SUMMARY: SeveritySummary = { C: 0, H: 0, M: 0, L: 0 };

const SEVERITY_BADGE_CLASS: Record<string, string> = {
  C: "bg-red-600",
  H: "bg-orange-600",
  M: "bg-yellow-600",
  L: "bg-gray-600",
};

export default function ProjectDetailsPage() {
  const t = useTranslations();
  const locale = useLocale();
  const params = useParams<{ projectId: string }>();

  const [project, setProject] = useState<ProjectDetails | null>(null);
  const [recentScans, setRecentScans] = useState<Scan[]>([]);
  const [severity, setSeverity] = useState<SeveritySummary>(EMPTY_SEVERITY_SUMMARY);
  const [findings, setFindings] = useState<Finding[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [downloadingReportId, setDownloadingReportId] = useState<number | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const projectId = useMemo(() => Number(params?.projectId), [params?.projectId]);

  useEffect(() => {
    let cancelled = false;

    const loadProjectDetails = async () => {
      if (!Number.isFinite(projectId) || projectId <= 0) {
        setError("Invalid project id");
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);
      setActionError(null);

      try {
        const [projectDetails, scansResponse] = await Promise.all([
          projectService.fetchProjectDetails(projectId),
          scanService.fetchProjectScans(projectId, 1, 10),
        ]);

        if (cancelled) {
          return;
        }

        setProject(projectDetails);
        setRecentScans(scansResponse.data);

        // This endpoint is currently unstable in some environments (CORS/500).
        // Treat reports loading as optional so project details still render.
        try {
          const reportsResponse = await reportService.fetchProjectReports(projectId, 1, 20);
          if (!cancelled) {
            setReports(reportsResponse.data);
          }
        } catch {
          // Fallback: use latest successful scan reports if project reports endpoint fails.
          const latestSuccessfulScanForReports = scansResponse.data
            .filter((scan) => scan.state === "success")
            .sort((a, b) => b.scan_id - a.scan_id)[0];

          if (latestSuccessfulScanForReports) {
            try {
              const fallbackReports = await scanService.fetchScanReports(
                latestSuccessfulScanForReports.scan_id,
                1,
                20
              );
              if (!cancelled) {
                setReports(fallbackReports.data);
              }
            } catch {
              if (!cancelled) {
                setReports([]);
              }
            }
          } else if (!cancelled) {
            setReports([]);
          }
        }

        const latestSuccessfulScan = scansResponse.data
          .filter((scan) => scan.state === "success")
          .sort((a, b) => b.scan_id - a.scan_id)[0];

        if (!latestSuccessfulScan || latestSuccessfulScan.vulnerabilities_count <= 0) {
          setSeverity({ ...EMPTY_SEVERITY_SUMMARY });
          return;
        }

        const summary: SeveritySummary = { ...EMPTY_SEVERITY_SUMMARY };
        const allFindings: Finding[] = [];
        let page = 1;
        let totalPages = 1;

        while (page <= totalPages) {
          const findingsResponse = await scanService.fetchFindings(latestSuccessfulScan.scan_id, page, 100);

          findingsResponse.data.forEach((finding) => {
            const normalizedSeverity = normalizeSeverity(finding.severity);
            if (normalizedSeverity) {
              summary[normalizedSeverity] += 1;
            }
            allFindings.push(finding);
          });

          totalPages =
            typeof findingsResponse.message === "string"
              ? totalPages
              : findingsResponse.message.total_pages ?? totalPages;

          page += 1;
        }

        if (!cancelled) {
          setSeverity(summary);
          setFindings(allFindings);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load project details");
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    loadProjectDetails();

    return () => {
      cancelled = true;
    };
  }, [projectId]);

  const handleRegenerate = async () => {
    setActionError(null);
    setIsRegenerating(true);
    try {
      const result = await projectService.regenerateReport(projectId);
      await reportService.downloadReport(result.data.download_link);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : t("dashboard.download_failed"));
    } finally {
      setIsRegenerating(false);
    }
  };

  const handleDownloadReport = async (report: Report) => {
    setActionError(null);
    setDownloadingReportId(report.id);
    try {
      await reportService.downloadReport(report.download_link);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : t("dashboard.download_failed"));
    } finally {
      setDownloadingReportId(null);
    }
  };

  return (
    <DashboardPageWrapper
      title={t("dashboard.project_details")}
      translationKey="projects"
      icon={<Folder className="w-8 h-8" />}
    >
      <div className="mb-6">
        <Link href={`/${locale}/dashboard/projects`}>
          <Button variant="outline" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t("dashboard.back_to_projects")}
          </Button>
        </Link>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      {actionError && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg mb-6">
          {actionError}
        </div>
      )}

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2">
          <Card className="p-6">
            <Skeleton className="h-6 w-48 mb-4" />
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-3/4 mb-2" />
            <Skeleton className="h-4 w-2/3" />
          </Card>
          <Card className="p-6">
            <Skeleton className="h-6 w-40 mb-4" />
            <Skeleton className="h-8 w-full mb-3" />
            <Skeleton className="h-8 w-full mb-3" />
            <Skeleton className="h-8 w-full" />
          </Card>
        </div>
      ) : project ? (
        <div className="space-y-6">
          {/* Project Overview */}
          <Card className="p-6">
            <div className="flex items-start justify-between flex-wrap gap-3 mb-4">
              <h2 className="text-xl font-semibold">{project.name}</h2>
              <Button
                size="sm"
                variant="outline"
                onClick={handleRegenerate}
                disabled={isRegenerating}
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${isRegenerating ? "animate-spin" : ""}`} />
                {isRegenerating ? t("common.loading") : t("dashboard.regenerate_report")}
              </Button>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 text-sm">
              <div>
                <p className="text-muted-foreground">{t("dashboard.type")}</p>
                <p className="font-medium">{project.type}</p>
              </div>
              <div>
                <p className="text-muted-foreground">{t("dashboard.uploaded")}</p>
                <p className="font-medium">{new Date(project.uploaded_on).toLocaleString()}</p>
              </div>
              <div>
                <p className="text-muted-foreground">{t("dashboard.last_scanned")}</p>
                <p className="font-medium">
                  {project.last_scanned_on
                    ? new Date(project.last_scanned_on).toLocaleString()
                    : t("dashboard.never")}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">ID</p>
                <p className="font-medium">{project.id}</p>
              </div>
            </div>

            <div className="grid gap-3 mt-5 sm:grid-cols-2">
              <div className="bg-blue-50 dark:bg-blue-950 p-3 rounded">
                <p className="text-muted-foreground text-sm">{t("dashboard.scans")}</p>
                <p className="text-2xl font-semibold">{project.scans_count}</p>
              </div>
              <div className="bg-green-50 dark:bg-green-950 p-3 rounded">
                <p className="text-muted-foreground text-sm">{t("dashboard.reports")}</p>
                <p className="text-2xl font-semibold">{project.reports_count}</p>
              </div>
            </div>
          </Card>

          {/* Severity Summary */}
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <ShieldAlert className="w-5 h-5 text-muted-foreground" />
              <h3 className="font-semibold">{t("dashboard.latest_scan_severity")}</h3>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {(["C", "H", "M", "L"] as SeverityCode[]).map((key) => (
                <div key={key} className="text-center border rounded-lg p-3">
                  <p className="text-2xl font-bold">{severity[key]}</p>
                  <Badge className={`mt-1 ${SEVERITY_BADGE_CLASS[key]}`}>
                    {key === "C" ? t("dashboard.critical_bugs") :
                     key === "H" ? t("dashboard.high_bugs") :
                     key === "M" ? t("dashboard.medium_bugs") :
                     t("dashboard.low_bugs")}
                  </Badge>
                </div>
              ))}
            </div>
          </Card>

          {/* Findings */}
          {findings.length > 0 && (
            <Card className="p-6">
              <h3 className="font-semibold mb-3">
                {t("dashboard.vulnerability_list")} ({findings.length})
              </h3>
              <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
                {findings.map((finding, idx) => {
                  const norm = normalizeSeverity(finding.severity);
                  return (
                    <div key={idx} className="border rounded-lg p-3 text-sm space-y-1">
                      <div className="flex items-start gap-2 flex-wrap">
                        <Badge className={`shrink-0 ${SEVERITY_BADGE_CLASS[norm ?? "L"]}`}>
                          {finding.severity}
                        </Badge>
                        <p className="font-medium flex-1">{finding.title}</p>
                      </div>
                      <p className="text-muted-foreground text-xs font-mono">
                        {finding.path}{finding.line ? `:${finding.line}` : ""}
                      </p>
                      {finding.message && (
                        <p className="text-muted-foreground text-xs line-clamp-2">{finding.message}</p>
                      )}
                      {Array.isArray(finding.cwe) && finding.cwe.length > 0 && (
                        <div className="flex flex-wrap gap-1 pt-1">
                          {finding.cwe.map((c) => (
                            <span key={c} className="text-xs bg-muted px-1.5 py-0.5 rounded">{c}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </Card>
          )}

          {/* Project Reports */}
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <FileText className="w-5 h-5 text-muted-foreground" />
              <h3 className="font-semibold">{t("dashboard.reports")}</h3>
            </div>
            {reports.length > 0 ? (
              <div className="space-y-2">
                {reports.map((report) => (
                  <div
                    key={report.id}
                    className="flex items-center justify-between gap-3 border rounded p-3 text-sm"
                  >
                    <div className="min-w-0">
                      <p className="font-medium truncate">{report.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(report.generated_on).toLocaleString()}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={downloadingReportId === report.id}
                      onClick={() => handleDownloadReport(report)}
                    >
                      <Download className="w-4 h-4 mr-1" />
                      {downloadingReportId === report.id ? t("common.loading") : t("dashboard.download")}
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">{t("dashboard.no_reports_found")}</p>
            )}
          </Card>

          {/* Scan History */}
          <Card className="p-6">
            <h3 className="font-semibold mb-3">{t("dashboard.recent_scans")} ({recentScans.length})</h3>
            {recentScans.length > 0 ? (
              <div className="space-y-2">
                {recentScans.map((scan) => (
                  <div key={scan.scan_id} className="border rounded p-3 text-sm">
                    <div className="grid gap-2 sm:grid-cols-3 lg:grid-cols-6">
                      <div>
                        <p className="text-muted-foreground">{t("dashboard.state")}</p>
                        <p className={`font-medium capitalize ${
                          scan.state === "success" ? "text-green-600 dark:text-green-400" :
                          scan.state === "failed" ? "text-red-600 dark:text-red-400" :
                          "text-yellow-600 dark:text-yellow-400"
                        }`}>{scan.state}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">{t("dashboard.findings")}</p>
                        <p className="font-medium">{scan.vulnerabilities_count}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">{t("dashboard.scan_duration")}</p>
                        <p className="font-medium">{scan.duration_in_sec}s</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">{t("dashboard.started_on")}</p>
                        <p className="font-medium">{new Date(scan.started_on).toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">{t("dashboard.completed_on")}</p>
                        <p className="font-medium">
                          {scan.completed_on ? new Date(scan.completed_on).toLocaleString() : "—"}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">{t("dashboard.reports")}</p>
                        <p className="font-medium">{scan.generated_reports_count}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">{t("dashboard.no_scans_found")}</p>
            )}
          </Card>
        </div>
      ) : null}
    </DashboardPageWrapper>
  );
}

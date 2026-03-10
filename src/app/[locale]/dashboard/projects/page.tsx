"use client";

import React, { useState, useMemo, useRef, useEffect } from "react";
import Link from "next/link";
import { Folder, Trash2, Search, Download, Play, Upload, ChevronRight } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DashboardPageWrapper } from "@/components/dashboard/page-wrapper";
import { useProjects } from "@/hooks/useProjects";
import { projectService } from "@/lib/project-service";
import { normalizeSeverity, scanService, SeverityCode } from "@/lib/scan-service";
import { reportService } from "@/lib/report-service";

type SeveritySummary = Record<SeverityCode, number>;

const EMPTY_SEVERITY_SUMMARY: SeveritySummary = { C: 0, H: 0, M: 0, L: 0 };

export default function ProjectsPage() {
  const t = useTranslations();
  const locale = useLocale();
  const {
    projects,
    isLoading,
    error,
    pagination,
    deleteProject,
    fetchProjects,
    setCurrentPage,
    setPerPage,
  } = useProjects();

  const [searchTerm, setSearchTerm] = useState("");
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [scanningProjectId, setScanningProjectId] = useState<number | null>(null);
  const [downloadingProjectId, setDownloadingProjectId] = useState<number | null>(null);
  const [isUploadingAndScanning, setIsUploadingAndScanning] = useState(false);
  const [severityByProject, setSeverityByProject] = useState<Record<number, SeveritySummary>>({});
  const [severityLoadingByProject, setSeverityLoadingByProject] = useState<Record<number, boolean>>({});
  const uploadInputRef = useRef<HTMLInputElement>(null);

  // Filter projects based on search term
  const filteredProjects = useMemo(() => {
    return projects.filter((project) =>
      project.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [projects, searchTerm]);

  const handleDeleteClick = (projectId: number) => {
    setProjectToDelete(projectId);
    setDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (projectToDelete === null) return;
    setIsDeleting(true);
    const success = await deleteProject(projectToDelete);
    setIsDeleting(false);
    if (success) {
      setDeleteConfirmOpen(false);
      setProjectToDelete(null);
    }
  };

  const triggerUploadProjectScan = () => {
    uploadInputRef.current?.click();
  };

  const handleUploadProjectChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) {
      return;
    }

    setActionError(null);
    setActionMessage(null);
    setIsUploadingAndScanning(true);

    try {
      const formData = new FormData();
      formData.append("project", file);
      const projectId = await projectService.uploadProject(formData);
      const scanResponse = await scanService.startScan(projectId, {
        pdf: true,
        html: false,
        ai: false,
      });

      setActionMessage(t("dashboard.scan_started"));

      if (scanResponse.data.pdf_download_link) {
        await scanService.downloadReport(scanResponse.data.pdf_download_link);
        setActionMessage(t("dashboard.download") + " OK");
      }
    } catch (err) {
      setActionError(err instanceof Error ? err.message : t("dashboard.scan_failed"));
    } finally {
      setIsUploadingAndScanning(false);
      await refreshProjects();
    }
  };

  const handleScanProject = async (projectId: number) => {
    setActionError(null);
    setActionMessage(null);
    setScanningProjectId(projectId);

    try {
      const scanResponse = await scanService.startScan(projectId, {
        pdf: true,
        html: false,
        ai: false,
      });

      setActionMessage(t("dashboard.scan_started"));

      if (scanResponse.data.pdf_download_link) {
        await scanService.downloadReport(scanResponse.data.pdf_download_link);
      }
    } catch (err) {
      setActionError(err instanceof Error ? err.message : t("dashboard.scan_failed"));
    } finally {
      setScanningProjectId(null);
      await refreshProjects();
    }
  };

  const handleDownloadResult = async (projectId: number) => {
    setActionError(null);
    setActionMessage(null);
    setDownloadingProjectId(projectId);

    try {
      const regenerated = await projectService.regenerateReport(projectId);
      await reportService.downloadReport(regenerated.data.download_link);
      setActionMessage(t("dashboard.download") + " OK");
    } catch (err) {
      setActionError(err instanceof Error ? err.message : t("dashboard.download_failed"));
    } finally {
      setDownloadingProjectId(null);
    }
  };

  const refreshProjects = async () => {
    await fetchProjects(pagination.currentPage, pagination.perPage);
  };

  useEffect(() => {
    let cancelled = false;

    const loadProjectSeverities = async () => {
      const ids = projects.map((project) => project.id);
      if (ids.length === 0) {
        setSeverityByProject({});
        setSeverityLoadingByProject({});
        return;
      }

      setSeverityLoadingByProject((prev) => {
        const next = { ...prev };
        ids.forEach((id) => {
          next[id] = true;
        });
        return next;
      });

      await Promise.all(
        projects.map(async (project) => {
          try {
            if (project.scans_count === 0) {
              if (!cancelled) {
                setSeverityByProject((prev) => ({
                  ...prev,
                  [project.id]: { ...EMPTY_SEVERITY_SUMMARY },
                }));
              }
              return;
            }

            const scansResponse = await scanService.fetchProjectScans(project.id, 1, 20);
            const latestSuccessfulScan = scansResponse.data
              .filter((scan) => scan.state === "success")
              .sort((a, b) => b.scan_id - a.scan_id)[0];

            if (!latestSuccessfulScan || latestSuccessfulScan.vulnerabilities_count <= 0) {
              if (!cancelled) {
                setSeverityByProject((prev) => ({
                  ...prev,
                  [project.id]: { ...EMPTY_SEVERITY_SUMMARY },
                }));
              }
              return;
            }

            const severitySummary: SeveritySummary = { ...EMPTY_SEVERITY_SUMMARY };
            let page = 1;
            let totalPages = 1;

            while (page <= totalPages) {
              const findingsResponse = await scanService.fetchFindings(
                latestSuccessfulScan.scan_id,
                page,
                100
              );

              findingsResponse.data.forEach((finding) => {
                const normalizedSeverity = normalizeSeverity(finding.severity);
                if (normalizedSeverity) {
                  severitySummary[normalizedSeverity] += 1;
                }
              });

              totalPages =
                typeof findingsResponse.message === "string"
                  ? totalPages
                  : findingsResponse.message.total_pages ?? totalPages;

              page += 1;
            }

            if (!cancelled) {
              setSeverityByProject((prev) => ({
                ...prev,
                [project.id]: severitySummary,
              }));
            }
          } catch {
            if (!cancelled) {
              setSeverityByProject((prev) => ({
                ...prev,
                [project.id]: { ...EMPTY_SEVERITY_SUMMARY },
              }));
            }
          } finally {
            if (!cancelled) {
              setSeverityLoadingByProject((prev) => ({ ...prev, [project.id]: false }));
            }
          }
        })
      );
    };

    loadProjectSeverities();

    return () => {
      cancelled = true;
    };
  }, [projects]);

  return (
    <DashboardPageWrapper
      title={t("dashboard.projects") || "Projects"}
      translationKey="projects"
      icon={<Folder className="w-8 h-8" />}
    >
      {/* Error Alert */}
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

      {actionMessage && (
        <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg mb-6">
          {actionMessage}
        </div>
      )}

      <input
        ref={uploadInputRef}
        type="file"
        className="hidden"
        accept=".zip,.tar,.tar.gz,.rar,.7z"
        onChange={handleUploadProjectChange}
      />

      {/* Search and Filters */}
      <div className="flex gap-4 mb-6 flex-col sm:flex-row">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder={t("dashboard.search_project") || "Search projects..."}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select
          value={pagination.perPage.toString()}
          onValueChange={(value) => setPerPage(parseInt(value))}
        >
          <SelectTrigger className="w-[120px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="5">5 {t("dashboard.per_page")}</SelectItem>
            <SelectItem value="10">10 {t("dashboard.per_page")}</SelectItem>
            <SelectItem value="20">20 {t("dashboard.per_page")}</SelectItem>
            <SelectItem value="50">50 {t("dashboard.per_page")}</SelectItem>
          </SelectContent>
        </Select>

        <Button
          type="button"
          variant="outline"
          onClick={triggerUploadProjectScan}
          disabled={isUploadingAndScanning}
        >
          <Upload className="w-4 h-4 mr-2" />
          {isUploadingAndScanning
            ? t("dashboard.uploading_project")
            : t("dashboard.scan_new_project")}
        </Button>
      </div>

      <p className="text-xs text-muted-foreground mb-4">
        {t("dashboard.search_current_page_only")}
      </p>

      {/* Projects Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {isLoading
          ? Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="p-6">
                <Skeleton className="h-4 w-3/4 mb-3" />
                <Skeleton className="h-3 w-1/2 mb-4" />
                <Skeleton className="h-3 w-full mb-2" />
                <Skeleton className="h-3 w-full mb-4" />
                <Skeleton className="h-8 w-full" />
              </Card>
            ))
          : filteredProjects.length > 0
          ? filteredProjects.map((project) => {
              const severity = severityByProject[project.id] ?? EMPTY_SEVERITY_SUMMARY;
              const isSeverityLoading = severityLoadingByProject[project.id];

              return (
              <Card key={project.id} className="p-6 hover:shadow-lg transition-shadow">
                <div className="space-y-4">
                  {/* Project Name and Type */}
                  <div>
                    <Link
                      href={`/${locale}/dashboard/projects/${project.id}`}
                      className="flex items-center justify-between gap-2 group"
                    >
                      <h3 className="font-semibold text-lg truncate group-hover:underline">
                        {project.name}
                      </h3>
                      <ChevronRight className="w-4 h-4 text-muted-foreground" />
                    </Link>
                    <p className="text-sm text-muted-foreground">
                      {t("dashboard.type")}: {project.type}
                    </p>
                  </div>

                  {/* Dates */}
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <p className="text-muted-foreground">{t("dashboard.uploaded")}</p>
                      <p className="font-medium">
                        {new Date(project.uploaded_on).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">{t("dashboard.last_scanned")}</p>
                      <p className="font-medium">
                        {project.last_scanned_on
                          ? new Date(project.last_scanned_on).toLocaleDateString()
                          : t("dashboard.never")}
                      </p>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="bg-blue-50 dark:bg-blue-950 p-2 rounded">
                      <p className="text-muted-foreground">{t("dashboard.scans")}</p>
                      <p className="font-bold text-lg">
                        {project.scans_count}
                      </p>
                    </div>
                    <div className="bg-green-50 dark:bg-green-950 p-2 rounded">
                      <p className="text-muted-foreground">{t("dashboard.reports")}</p>
                      <p className="font-bold text-lg">
                        {project.reports_count}
                      </p>
                    </div>
                  </div>

                  {/* Severity */}
                  <div className="space-y-2">
                    <p className="text-xs text-muted-foreground">{t("dashboard.severity_breakdown")}</p>
                    {isSeverityLoading ? (
                      <div className="grid grid-cols-4 gap-2">
                        <Skeleton className="h-6 w-full" />
                        <Skeleton className="h-6 w-full" />
                        <Skeleton className="h-6 w-full" />
                        <Skeleton className="h-6 w-full" />
                      </div>
                    ) : (
                      <div className="grid grid-cols-4 gap-2">
                        <Badge className="justify-center bg-red-600">C {severity.C}</Badge>
                        <Badge className="justify-center bg-orange-600">H {severity.H}</Badge>
                        <Badge className="justify-center bg-yellow-600">M {severity.M}</Badge>
                        <Badge className="justify-center bg-gray-600">L {severity.L}</Badge>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    disabled={scanningProjectId === project.id}
                    onClick={() => handleScanProject(project.id)}
                  >
                    <Play className="w-4 h-4 mr-2" />
                    {scanningProjectId === project.id
                      ? t("dashboard.scanning")
                      : t("dashboard.start_scan")}
                  </Button>

                  <Button
                    variant="secondary"
                    size="sm"
                    className="w-full"
                    disabled={downloadingProjectId === project.id}
                    onClick={() => handleDownloadResult(project.id)}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    {downloadingProjectId === project.id
                      ? t("common.loading")
                      : t("dashboard.download")}
                  </Button>

                  <Button
                    variant="destructive"
                    size="sm"
                    className="w-full"
                    onClick={() => handleDeleteClick(project.id)}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    {t("dashboard.delete")}
                  </Button>
                </div>
              </Card>
              );
            })
          : (
              <div className="col-span-full text-center py-12">
                <Folder className="w-12 h-12 mx-auto text-muted-foreground mb-4 opacity-50" />
                <p className="text-muted-foreground">
                  {searchTerm
                    ? t("dashboard.no_projects_match")
                    : t("dashboard.no_projects_found")}
                </p>
              </div>
            )}
      </div>

      {/* Pagination */}
      {!isLoading && !searchTerm && pagination.totalPages > 1 && (
        <div className="flex justify-between items-center mt-8">
          <p className="text-sm text-muted-foreground">
            {t("dashboard.showing")} {(pagination.currentPage - 1) * pagination.perPage + 1} {t("dashboard.to")}{" "}
            {Math.min(
              pagination.currentPage * pagination.perPage,
              pagination.totalItems
            )}{" "}
            {t("dashboard.of")} {pagination.totalItems} {t("dashboard.projects").toLowerCase()}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              disabled={pagination.currentPage === 1}
              onClick={() => setCurrentPage(pagination.currentPage - 1)}
            >
              {t("dashboard.previous")}
            </Button>
            <span className="px-4 py-2 text-sm font-medium">
              {t("dashboard.page")} {pagination.currentPage} {t("dashboard.of")} {pagination.totalPages}
            </span>
            <Button
              variant="outline"
              disabled={pagination.currentPage === pagination.totalPages}
              onClick={() => setCurrentPage(pagination.currentPage + 1)}
            >
              {t("dashboard.next")}
            </Button>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("dashboard.delete_project")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("dashboard.delete_project_confirm")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex justify-end gap-3">
            <AlertDialogCancel disabled={isDeleting}>
              {t("dashboard.cancel")}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? t("dashboard.deleting") : t("dashboard.delete")}
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardPageWrapper>
  );
}

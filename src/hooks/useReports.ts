"use client";

import { useState, useEffect, useCallback } from "react";
import { reportService, Report } from "@/lib/report-service";
import { ApiError } from "@/lib/api-client";
import { useAuthStore } from "@/lib/auth-store";

interface UseReportsReturn {
  reports: Report[];
  isLoading: boolean;
  isDownloading: boolean;
  isDownloadingReport: (reportId: number) => boolean;
  error: string | null;
  downloadError: string | null;
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    perPage: number;
  };

  fetchReports: (page?: number, perPage?: number) => Promise<void>;
  fetchProjectReports: (projectId: number, page?: number, perPage?: number) => Promise<void>;
  downloadReport: (fileLink: string, reportId: number) => Promise<boolean>;
  setCurrentPage: (page: number) => void;
  setPerPage: (perPage: number) => void;
  refreshData: () => Promise<void>;
}

/**
 * Custom hook for managing reports
 */
export function useReports(): UseReportsReturn {
  const accessToken = useAuthStore((state) => state.accessToken);
  const [reports, setReports] = useState<Report[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [downloadingReportIds, setDownloadingReportIds] = useState<Set<number>>(new Set());
  const [error, setError] = useState<string | null>(null);
  const [downloadError, setDownloadError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    perPage: 10,
  });

  /**
   * Fetch all reports with pagination
   */
  const fetchReports = useCallback(
    async (page: number = 1, perPage: number = 10) => {
      if (!accessToken) {
        setReports([]);
        setError(null);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);
      setDownloadError(null);
      try {
        const response = await reportService.fetchAllReports(page, perPage);
        const paginationMessage =
          typeof response.message === "string"
            ? { total_pages: 1, total_items: response.data.length, per_page: perPage }
            : response.message;
        setReports(response.data);
        setPagination({
          currentPage: page,
          totalPages: paginationMessage.total_pages ?? 1,
          totalItems: paginationMessage.total_items ?? response.data.length,
          perPage: paginationMessage.per_page ?? perPage,
        });
      } catch (err) {
        const errorMessage =
          err instanceof ApiError ? err.message : "Failed to load reports";
        setError(errorMessage);
        setReports([]);
      } finally {
        setIsLoading(false);
      }
    },
    [accessToken]
  );

  /**
   * Fetch reports for a specific project
   */
  const fetchProjectReports = useCallback(
    async (projectId: number, page: number = 1, perPage: number = 10) => {
      if (!accessToken) {
        setReports([]);
        setError(null);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);
      setDownloadError(null);
      try {
        const response = await reportService.fetchProjectReports(projectId, page, perPage);
        const paginationMessage =
          typeof response.message === "string"
            ? { total_pages: 1, total_items: response.data.length, per_page: perPage }
            : response.message;
        setReports(response.data);
        setPagination({
          currentPage: page,
          totalPages: paginationMessage.total_pages ?? 1,
          totalItems: paginationMessage.total_items ?? response.data.length,
          perPage: paginationMessage.per_page ?? perPage,
        });
      } catch (err) {
        const errorMessage =
          err instanceof ApiError ? err.message : "Failed to load project reports";
        setError(errorMessage);
        setReports([]);
      } finally {
        setIsLoading(false);
      }
    },
    [accessToken]
  );

  /**
   * Download a report
   */
  const downloadReport = useCallback(async (fileLink: string, reportId: number): Promise<boolean> => {
    setDownloadError(null);
    setDownloadingReportIds((prev) => new Set(prev).add(reportId));
    try {
      await reportService.downloadReport(fileLink);
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to download report";
      setDownloadError(errorMessage);
      return false;
    } finally {
      setDownloadingReportIds((prev) => {
        const next = new Set(prev);
        next.delete(reportId);
        return next;
      });
    }
  }, []);

  const isDownloadingReport = useCallback(
    (reportId: number) => downloadingReportIds.has(reportId),
    [downloadingReportIds]
  );

  /**
   * Update current page
   */
  const setCurrentPage = useCallback((page: number) => {
    setPagination((prev) => {
      const boundedPage = Math.max(1, Math.min(page, prev.totalPages || 1));
      return { ...prev, currentPage: boundedPage };
    });
  }, []);

  /**
   * Update per-page count
   */
  const setPerPage = useCallback((perPage: number) => {
    const allowed = [5, 10, 20, 50];
    const normalized = allowed.includes(perPage) ? perPage : 10;
    setPagination((prev) => ({ ...prev, perPage: normalized, currentPage: 1 }));
  }, []);

  /**
   * Refresh data
   */
  const refreshData = useCallback(async () => {
    await fetchReports(pagination.currentPage, pagination.perPage);
  }, [fetchReports, pagination.currentPage, pagination.perPage]);

  // Fetch reports on mount
  useEffect(() => {
    if (!accessToken) {
      return;
    }

    fetchReports(pagination.currentPage, pagination.perPage);
  }, [accessToken, pagination.currentPage, pagination.perPage, fetchReports]);

  return {
    reports,
    isLoading,
    isDownloading: downloadingReportIds.size > 0,
    isDownloadingReport,
    error,
    downloadError,
    pagination,
    fetchReports,
    fetchProjectReports,
    downloadReport,
    setCurrentPage,
    setPerPage,
    refreshData,
  };
}

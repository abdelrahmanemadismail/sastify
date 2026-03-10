"use client";

import { useState, useEffect, useCallback } from "react";
import { scanService, Scan, StartScanResponse } from "@/lib/scan-service";
import { ApiError, ApiResponse } from "@/lib/api-client";
import { useAuthStore } from "@/lib/auth-store";

interface UseScansReturn {
  scans: Scan[];
  isLoading: boolean;
  isScanning: boolean;
  error: string | null;
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    perPage: number;
  };

  fetchScans: (page?: number, perPage?: number) => Promise<void>;
  fetchProjectScans: (projectId: number, page?: number, perPage?: number) => Promise<void>;
  startScan: (
    projectId: number,
    options?: { pdf?: boolean; html?: boolean; ai?: boolean }
  ) => Promise<ApiResponse<StartScanResponse["data"]> | null>;
  setCurrentPage: (page: number) => void;
  setPerPage: (perPage: number) => void;
  refreshData: () => Promise<void>;
}

/**
 * Custom hook for managing scans
 */
export function useScans(): UseScansReturn {
  const accessToken = useAuthStore((state) => state.accessToken);
  const [scans, setScans] = useState<Scan[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    perPage: 10,
  });

  /**
   * Fetch all scans with pagination
   */
  const fetchScans = useCallback(
    async (page: number = 1, perPage: number = 10) => {
      if (!accessToken) {
        setScans([]);
        setError(null);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);
      try {
        const response = await scanService.fetchScans(page, perPage);
        const paginationMessage = typeof response.message === "string" ? undefined : response.message;
        setScans(response.data);
        setPagination({
          currentPage: page,
          totalPages: paginationMessage?.total_pages ?? 1,
          totalItems: paginationMessage?.total_items ?? response.data.length,
          perPage: paginationMessage?.per_page ?? perPage,
        });
      } catch (err) {
        const errorMessage =
          err instanceof ApiError ? err.message : "Failed to load scans";
        setError(errorMessage);
        setScans([]);
      } finally {
        setIsLoading(false);
      }
    },
    [accessToken]
  );

  /**
   * Fetch scans for a specific project
   */
  const fetchProjectScans = useCallback(
    async (projectId: number, page: number = 1, perPage: number = 10) => {
      if (!accessToken) {
        setScans([]);
        setError(null);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);
      try {
        const response = await scanService.fetchProjectScans(projectId, page, perPage);
        const paginationMessage = typeof response.message === "string" ? undefined : response.message;
        setScans(response.data);
        setPagination({
          currentPage: page,
          totalPages: paginationMessage?.total_pages ?? 1,
          totalItems: paginationMessage?.total_items ?? response.data.length,
          perPage: paginationMessage?.per_page ?? perPage,
        });
      } catch (err) {
        const errorMessage =
          err instanceof ApiError ? err.message : "Failed to load project scans";
        setError(errorMessage);
        setScans([]);
      } finally {
        setIsLoading(false);
      }
    },
    [accessToken]
  );

  /**
   * Start a scan on a project
   */
  const startScan = useCallback(
    async (
      projectId: number,
      options?: { pdf?: boolean; html?: boolean; ai?: boolean }
    ): Promise<ApiResponse<StartScanResponse["data"]> | null> => {
      setIsScanning(true);
      setError(null);
      try {
        const response = await scanService.startScan(projectId, options);
        return response;
      } catch (err) {
        const errorMessage =
          err instanceof ApiError ? err.message : "Failed to start scan";
        setError(errorMessage);
        return null;
      } finally {
        setIsScanning(false);
      }
    },
    []
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
    await fetchScans(pagination.currentPage, pagination.perPage);
  }, [fetchScans, pagination.currentPage, pagination.perPage]);

  // Fetch scans on mount
  useEffect(() => {
    if (!accessToken) {
      return;
    }

    fetchScans(pagination.currentPage, pagination.perPage);
  }, [accessToken, pagination.currentPage, pagination.perPage, fetchScans]);

  return {
    scans,
    isLoading,
    isScanning,
    error,
    pagination,
    fetchScans,
    fetchProjectScans,
    startScan,
    setCurrentPage,
    setPerPage,
    refreshData,
  };
}

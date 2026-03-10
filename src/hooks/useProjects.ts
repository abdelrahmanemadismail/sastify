"use client";

import { useState, useEffect, useCallback } from "react";
import { projectService, Project } from "@/lib/project-service";
import { ApiError } from "@/lib/api-client";
import { useAuthStore } from "@/lib/auth-store";

interface UseProjectsReturn {
  projects: Project[];
  isLoading: boolean;
  error: string | null;
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    perPage: number;
  };

  fetchProjects: (page?: number, perPage?: number) => Promise<void>;
  deleteProject: (projectId: number) => Promise<boolean>;
  setCurrentPage: (page: number) => void;
  setPerPage: (perPage: number) => void;
  refreshData: () => Promise<void>;
}

/**
 * Custom hook for managing user's projects
 */
export function useProjects(): UseProjectsReturn {
  const accessToken = useAuthStore((state) => state.accessToken);
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    perPage: 10,
  });

  /**
   * Fetch projects with optional pagination
   */
  const fetchProjects = useCallback(
    async (page: number = 1, perPage: number = 10) => {
      if (!accessToken) {
        setProjects([]);
        setError(null);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);
      try {
        const response = await projectService.fetchProjects(page, perPage);
        const paginationMessage = typeof response.message === "string" ? undefined : response.message;
        setProjects(response.data);
        setPagination({
          currentPage: page,
          totalPages: paginationMessage?.total_pages ?? 1,
          totalItems: paginationMessage?.total_items ?? response.data.length,
          perPage: paginationMessage?.per_page ?? perPage,
        });
      } catch (err) {
        const errorMessage =
          err instanceof ApiError ? err.message : "Failed to load projects";
        setError(errorMessage);
        setProjects([]);
      } finally {
        setIsLoading(false);
      }
    },
    [accessToken]
  );

  /**
   * Delete a project
   */
  const deleteProject = useCallback(async (projectId: number): Promise<boolean> => {
    setError(null);
    try {
      await projectService.deleteProject(projectId);
      // Remove from local state
      setProjects((prev) => prev.filter((p) => p.id !== projectId));
      return true;
    } catch (err) {
      const errorMessage =
        err instanceof ApiError ? err.message : "Failed to delete project";
      setError(errorMessage);
      return false;
    }
  }, []);

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
    await fetchProjects(pagination.currentPage, pagination.perPage);
  }, [fetchProjects, pagination.currentPage, pagination.perPage]);

  // Fetch projects on mount
  useEffect(() => {
    if (!accessToken) {
      return;
    }

    fetchProjects(pagination.currentPage, pagination.perPage);
  }, [accessToken, pagination.currentPage, pagination.perPage, fetchProjects]);

  return {
    projects,
    isLoading,
    error,
    pagination,
    fetchProjects,
    deleteProject,
    setCurrentPage,
    setPerPage,
    refreshData,
  };
}

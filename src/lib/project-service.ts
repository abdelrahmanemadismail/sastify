import { apiCall, apiCallFileUpload, apiCallWithFullResponse, ApiError } from "./api-client";
import { useAuthStore } from "./auth-store";

// Project types
export interface Project {
  id: number;
  name: string;
  type: string;
  uploaded_on: string;
  last_scanned_on: string | null;
  scans_count: number;
  reports_count: number;
}

export interface ProjectDetails extends Project {
  regenerate_report_link?: string;
}

export interface ProjectListResponse {
  data: Project[];
  message: {
    page: number;
    per_page: number;
    total_items: number;
    total_pages: number;
    count_this_page: number;
  };
  "status-code": number;
  success: boolean;
}

export interface DeleteProjectResponse {
  data: {
    deleted_scans: number;
    deleted_reports: number;
  };
  message: string;
  "status-code": number;
  success: boolean;
}

// Project API functions
export const projectService = {
  /**
   * Fetch all projects for the user with pagination
   */
  async fetchProjects(page: number = 1, perPage: number = 10) {
    return apiCallWithFullResponse<Project[]>(
      `/project?page=${page}&per-page=${perPage}`,
      {
        method: "GET",
      }
    );
  },

  /**
   * Get detailed information about a specific project
   */
  async fetchProjectDetails(projectId: number) {
    return apiCall<ProjectDetails>(
      `/project/${projectId}`,
      {
        method: "GET",
      }
    );
  },

  /**
   * Delete a project and all its associated scans and reports
   */
  async deleteProject(projectId: number) {
    return apiCallWithFullResponse<{
      deleted_scans: number;
      deleted_reports: number;
    }>(
      `/project/${projectId}`,
      {
        method: "DELETE",
      }
    );
  },

  /**
   * Regenerate a report for a project
   */
  async regenerateReport(projectId: number) {
    return apiCallWithFullResponse<{
      download_link: string;
      name: string;
    }>(`/project/${projectId}/report/regenerate`, {
      method: "GET",
    });
  },

  /**
   * Upload a project archive/file and return the created project id.
   */
  async uploadProject(formData: FormData): Promise<number> {
    const response = await apiCallFileUpload<{ project_id: number }>(
      "/project/upload",
      formData
    );

    return response.data.project_id;
  },

  /**
   * Import a project from a git provider and return the created project id.
   */
  async uploadGitProject(
    token: string | undefined,
    branch: string,
    provider: string,
    repo_url: string
  ): Promise<number> {
    const { accessToken } = useAuthStore.getState();

    if (!accessToken) {
      throw new ApiError(401, "Unauthorized", "Session expired. Please login again.");
    }

    const payload: {
      token?: string;
      branch: string;
      provider: string;
      repo_url: string;
    } = {
      branch,
      provider,
      repo_url,
    };

    if (token) {
      payload.token = token;
    }

    const response = await fetch("/api/project/git/upload", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      credentials: "include",
      body: JSON.stringify(payload),
    });

    const raw = await response.json();

    if (!response.ok || !raw?.success) {
      throw new ApiError(
        raw?.["status-code"] ?? response.status,
        raw?.message ?? "Git import failed",
        raw?.details
      );
    }

    if (typeof raw?.data?.project_id !== "number") {
      throw new ApiError(
        500,
        "Git import failed",
        "Invalid server response: missing project_id"
      );
    }

    return raw.data.project_id;
  },
};

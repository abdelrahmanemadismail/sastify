import { apiCall, apiCallWithFullResponse } from "./api-client";
import { useAuthStore } from "./auth-store";

// Report types
export interface Report {
  id: number;
  name: string;
  download_link: string;
  generated_on: string;
  type?: "pdf" | "html";
  target_project?: string;
  project_id?: number;
  project_name?: string;
}

export interface ReportListResponse {
  data: Report[];
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

export type ReportDetails = Report;

// Report API functions
export const reportService = {
  /**
   * Fetch all reports for the user with pagination
   */
  async fetchAllReports(page: number = 1, perPage: number = 10) {
    return apiCallWithFullResponse<Report[]>(
      `/report?page=${page}&per-page=${perPage}`,
      {
        method: "GET",
      }
    );
  },

  /**
   * Get detailed information about a specific report
   */
  async fetchReportDetails(reportId: number) {
    return apiCall<ReportDetails>(
      `/report/${reportId}`,
      {
        method: "GET",
      }
    );
  },

  /**
   * Fetch reports for a specific project
   */
  async fetchProjectReports(
    projectId: number,
    page: number = 1,
    perPage: number = 10
  ) {
    return apiCallWithFullResponse<Report[]>(
      `/project/${projectId}/report?page=${page}&per-page=${perPage}`,
      {
        method: "GET",
      }
    );
  },

  /**
   * Download a report file with authenticated request.
   */
  async downloadReport(downloadLink: string): Promise<void> {
    const { accessToken } = useAuthStore.getState();
    const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/api";
    const baseUrl = new URL(apiBaseUrl).origin;
    const fullUrl = downloadLink.startsWith("http") ? downloadLink : `${baseUrl}${downloadLink}`;

    const response = await fetch(fullUrl, {
      method: "GET",
      headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
      credentials: "include",
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error("Session expired. Please login again.");
      }
      if (response.status === 404) {
        throw new Error("Report file not found.");
      }
      throw new Error(`Download failed (${response.status})`);
    }

    const blob = await response.blob();
    const blobUrl = window.URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    const fileName =
      downloadLink.split("/").pop() ||
      `security-report-${Date.now()}`;

    anchor.href = blobUrl;
    anchor.download = fileName;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    window.URL.revokeObjectURL(blobUrl);
  },
};

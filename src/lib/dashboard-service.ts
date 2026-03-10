import { apiCall } from "./api-client";

// --- Response types ---

export interface MonthlyBugsResponse {
  monthly_bugs: Record<string, number>;
}

export interface BugsSummaryResponse {
  total_bugs: number;
  severity_breakdown: {
    C: number;
    H: number;
    M: number;
    L: number;
    [key: string]: number;
  };
  top_files_with_bugs: Record<string, number>;
}

export type BugsSummaryRange = "daily" | "weekly" | "monthly";

export interface TopProjectResponse {
  id: number;
  name: string;
  scan_count: number;
  total_vulns_count: number;
  reports_count?: number;
}

// --- Service ---

export const dashboardService = {
  /**
   * GET /api/dashboard/bugs-monthly-overview
   * Returns bugs count per month for the past year.
   */
  async getBugsMonthlyOverview(): Promise<MonthlyBugsResponse> {
    return apiCall<MonthlyBugsResponse>("/dashboard/bugs-monthly-overview", {
      method: "GET",
    });
  },

  /**
   * GET /api/dashboard/bugs-summary?range=<range>
   * Returns total bugs, severity breakdown, and top files with bugs.
   */
  async getBugsSummary(range: BugsSummaryRange): Promise<BugsSummaryResponse> {
    return apiCall<BugsSummaryResponse>(
      `/dashboard/bugs-summary?range=${range}`,
      { method: "GET" }
    );
  },

  /**
   * GET /api/dashboard/top-project-need-attention
   * Returns the project with the most vulnerabilities.
   */
  async getTopProjectNeedAttention(): Promise<TopProjectResponse> {
    return apiCall<TopProjectResponse>(
      "/dashboard/top-project-need-attention",
      { method: "GET" }
    );
  },
};

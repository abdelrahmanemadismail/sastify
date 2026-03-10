import { apiCall, apiCallWithFullResponse } from "./api-client";
import { useAuthStore } from "./auth-store";

export type SeverityCode = "C" | "H" | "M" | "L";

const SEVERITY_MAP: Record<string, SeverityCode> = {
  C: "C",
  CRITICAL: "C",
  H: "H",
  HIGH: "H",
  ERROR: "H",
  M: "M",
  MEDIUM: "M",
  WARNING: "M",
  WARN: "M",
  L: "L",
  LOW: "L",
  INFO: "L",
  INFORMATIONAL: "L",
};

export function normalizeSeverity(value: string | null | undefined): SeverityCode | null {
  if (!value) {
    return null;
  }

  return SEVERITY_MAP[value.trim().toUpperCase()] ?? null;
}

// Scan types
export interface Scan {
  scan_id: number;
  project_id: number;
  started_on: string;
  completed_on: string;
  state: "success" | "failed" | "running" | "pending";
  duration_in_sec: number;
  vulnerabilities_count: number;
  generated_reports_count: number;
}

export type ScanDetails = Scan;
type PaginatedMessage = {
  page: number;
  per_page: number;
  total_items: number;
  total_pages: number;
  count_this_page: number;
};

export interface ScanListResponse {
  data: Scan[];
  message: PaginatedMessage;
  "status-code": number;
  success: boolean;
}

export interface Finding {
  title: string;
  severity: string;
  message: string;
  path: string;
  line: number;
  code: string;
  cwe: string[];
  fix: string;
}

export interface FindingsResponse {
  data: Finding[];
  message: PaginatedMessage;
  "status-code": number;
  success: boolean;
}

export interface ScanReportResponse {
  data: Array<{
    id: number;
    name: string;
    download_link: string;
    generated_on: string;
  }>;
  message: PaginatedMessage;
  "status-code": number;
  success: boolean;
}

export interface StartScanResponse {
  data: {
    duration: number;
    findings_count: number;
    generated_on: string;
    pdf_download_link?: string;
    pdf_report_name?: string;
    html_download_link?: string;
    html_report_name?: string;
  };
  message: string;
  "status-code": number;
  success: boolean;
}

export interface ScanWebSocketResult {
  duration: number | string;
  findings_count: number;
  generated_on: string;
  pdf_download_link?: string;
  html_download_link?: string;
  findings: Array<{
    title: string;
    path: string;
    severity: string;
  }>;
  severityCount?: {
    C?: number;
    H?: number;
    M?: number;
    L?: number;
  };
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/api";

// Scan API functions
export const scanService = {
  /**
   * Fetch all scans for the user with pagination
   */
  async fetchScans(page: number = 1, perPage: number = 10) {
    return apiCallWithFullResponse<Scan[]>(
      `/scan?page=${page}&per-page=${perPage}`,
      {
        method: "GET",
      }
    );
  },

  /**
   * Fetch scans for a specific project
   */
  async fetchProjectScans(
    projectId: number,
    page: number = 1,
    perPage: number = 10
  ) {
    return apiCallWithFullResponse<Scan[]>(
      `/project/${projectId}/scan?page=${page}&per-page=${perPage}`,
      {
        method: "GET",
      }
    );
  },

  /**
   * Get detailed information about a specific scan
   */
  async fetchScanDetails(scanId: number) {
    return apiCall<ScanDetails>(
      `/scan/${scanId}`,
      {
        method: "GET",
      }
    );
  },

  /**
   * Start a scan on a project
   */
  async startScan(
    projectId: number,
    options?: {
      pdf?: boolean;
      html?: boolean;
      ai?: boolean;
    }
  ) {
    const params = new URLSearchParams();
    if (options?.pdf) params.append("pdf", "true");
    if (options?.html) params.append("html", "true");
    if (options?.ai) params.append("ai", "true");

    return apiCallWithFullResponse<StartScanResponse["data"]>(
      `/project/${projectId}/scan${params.toString() ? "?" + params.toString() : ""}`,
      {
        method: "POST",
      }
    );
  },

  /**
   * Fetch findings for a specific scan
   */
  async fetchFindings(
    scanId: number,
    page: number = 1,
    perPage: number = 10
  ) {
    return apiCallWithFullResponse<Finding[]>(
      `/scan/${scanId}/finding?page=${page}&per-page=${perPage}`,
      {
        method: "GET",
      }
    );
  },

  /**
   * Fetch reports for a specific scan
   */
  async fetchScanReports(
    scanId: number,
    page: number = 1,
    perPage: number = 10
  ) {
    return apiCallWithFullResponse<ScanReportResponse["data"]>(
      `/scan/${scanId}/report?page=${page}&per-page=${perPage}`,
      {
        method: "GET",
      }
    );
  },

  /**
   * Download report file from API using current auth token.
   */
  async downloadReport(link: string): Promise<void> {
    const { accessToken } = useAuthStore.getState();
    const apiHost = API_BASE_URL.replace(/\/api\/?$/, "");
    const url = link.startsWith("http") ? link : `${apiHost}${link}`;

    const response = await fetch(url, {
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
    const filename = link.split("/").pop() || "security-report";

    anchor.href = blobUrl;
    anchor.download = filename;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    window.URL.revokeObjectURL(blobUrl);
  },
};

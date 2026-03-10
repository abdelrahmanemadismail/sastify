"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuthStore } from "@/lib/auth-store";
import {
  type BugsSummaryRange,
  type MonthlyBugsResponse,
  type BugsSummaryResponse,
  type TopProjectResponse,
} from "@/lib/dashboard-service";
import { projectService } from "@/lib/project-service";
import {
  normalizeSeverity,
  scanService,
  type Finding,
  type Scan,
  type SeverityCode,
} from "@/lib/scan-service";
import { ApiError } from "@/lib/api-client";

type SeveritySummary = Record<SeverityCode, number>;

type ProjectDashboardSnapshot = {
  id: number;
  name: string;
  scan_count: number;
  reports_count: number;
  scans: Scan[];
  latestSuccessfulScan: Scan | null;
  rangeScan: Scan | null;
  latestFindings: Finding[];
  rangeFindings: Finding[];
};

const EMPTY_SEVERITY_SUMMARY: SeveritySummary = {
  C: 0,
  H: 0,
  M: 0,
  L: 0,
};

function getRangeStart(range: BugsSummaryRange) {
  const now = new Date();
  const start = new Date(now);

  if (range === "daily") {
    start.setDate(now.getDate() - 1);
    return start;
  }

  if (range === "weekly") {
    start.setDate(now.getDate() - 7);
    return start;
  }

  start.setMonth(now.getMonth() - 1);
  return start;
}

function isWithinRange(dateValue: string | null, start: Date) {
  if (!dateValue) {
    return false;
  }

  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) {
    return false;
  }

  return date >= start;
}

function buildSeveritySummary(findings: Finding[]) {
  const severitySummary: SeveritySummary = { ...EMPTY_SEVERITY_SUMMARY };

  findings.forEach((finding) => {
    const normalizedSeverity = normalizeSeverity(finding.severity);
    if (normalizedSeverity) {
      severitySummary[normalizedSeverity] += 1;
    }
  });

  return severitySummary;
}

async function fetchAllFindings(scanId: number) {
  const findings: Finding[] = [];
  let page = 1;
  let totalPages = 1;

  while (page <= totalPages) {
    const findingsResponse = await scanService.fetchFindings(scanId, page, 100);
    findings.push(...findingsResponse.data);
    totalPages =
      typeof findingsResponse.message === "string"
        ? totalPages
        : findingsResponse.message.total_pages ?? totalPages;
    page += 1;
  }

  return findings;
}

async function fetchAllProjects() {
  const projects = [];
  let page = 1;
  let totalPages = 1;

  while (page <= totalPages) {
    const response = await projectService.fetchProjects(page, 100);
    projects.push(...response.data);
    totalPages =
      typeof response.message === "string"
        ? totalPages
        : response.message.total_pages ?? totalPages;
    page += 1;
  }

  return projects;
}

async function fetchAllProjectScans(projectId: number) {
  const scans: Scan[] = [];
  let page = 1;
  let totalPages = 1;

  while (page <= totalPages) {
    const response = await scanService.fetchProjectScans(projectId, page, 100);
    scans.push(...response.data);
    totalPages =
      typeof response.message === "string"
        ? totalPages
        : response.message.total_pages ?? totalPages;
    page += 1;
  }

  return scans;
}

function deriveMonthlyBugsFromProjects(
  snapshots: ProjectDashboardSnapshot[]
): MonthlyBugsResponse {
  const oneYearAgo = new Date();
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

  const monthlyBugs = snapshots.reduce<Record<string, number>>((acc, snapshot) => {
    snapshot.scans
      .filter((scan) => scan.state === "success")
      .forEach((scan) => {
        const scanDate = new Date(scan.completed_on || scan.started_on);
        if (Number.isNaN(scanDate.getTime()) || scanDate < oneYearAgo) {
          return;
        }

        const monthKey = scanDate.toLocaleString("en-US", { month: "short" });
        acc[monthKey] = (acc[monthKey] ?? 0) + scan.vulnerabilities_count;
      });

    return acc;
  }, {});

  return { monthly_bugs: monthlyBugs };
}

function deriveBugsSummaryFromProjects(
  snapshots: ProjectDashboardSnapshot[]
): BugsSummaryResponse {
  const allFindings = snapshots.flatMap((snapshot) => snapshot.rangeFindings);
  const severityBreakdown = buildSeveritySummary(allFindings);
  const topFilesWithBugs = allFindings.reduce<Record<string, number>>((acc, finding) => {
    const path = finding.path || "Unknown file";
    acc[path] = (acc[path] ?? 0) + 1;
    return acc;
  }, {});

  return {
    total_bugs: allFindings.length,
    severity_breakdown: severityBreakdown,
    top_files_with_bugs: topFilesWithBugs,
  };
}

function deriveTopProjectFromProjects(
  snapshots: ProjectDashboardSnapshot[]
): TopProjectResponse | null {
  if (!snapshots.length) {
    return null;
  }

  const candidate = snapshots
    .map((snapshot) => ({
      ...snapshot,
      total_vulns_count: snapshot.latestFindings.length,
    }))
    .sort((a, b) => {
      if (b.total_vulns_count !== a.total_vulns_count) {
        return b.total_vulns_count - a.total_vulns_count;
      }
      if (b.scan_count !== a.scan_count) {
        return b.scan_count - a.scan_count;
      }
      return b.reports_count - a.reports_count;
    })[0];

  return {
    id: candidate.id,
    name: candidate.name,
    scan_count: candidate.scan_count,
    total_vulns_count: candidate.total_vulns_count,
    reports_count: candidate.reports_count,
  };
}

export function useDashboard(summaryRange: BugsSummaryRange = "monthly") {
  const accessToken = useAuthStore((state) => state.accessToken);

  const [monthlyBugs, setMonthlyBugs] = useState<MonthlyBugsResponse | null>(null);
  const [bugsSummary, setBugsSummary] = useState<BugsSummaryResponse | null>(null);
  const [topProject, setTopProject] = useState<TopProjectResponse | null>(null);

  const [loadingMonthly, setLoadingMonthly] = useState(false);
  const [loadingSummary, setLoadingSummary] = useState(false);
  const [loadingTopProject, setLoadingTopProject] = useState(false);

  const [errorMonthly, setErrorMonthly] = useState<string | null>(null);
  const [errorSummary, setErrorSummary] = useState<string | null>(null);
  const [errorTopProject, setErrorTopProject] = useState<string | null>(null);

  const getProjectDashboardSnapshots = useCallback(async (rangeStart: Date) => {
    const projects = (await fetchAllProjects()).filter((project) => project.scans_count > 0);

    return Promise.all(
      projects.map(async (project) => {
        try {
          const scans = await fetchAllProjectScans(project.id);
          const successfulScans = scans
            .filter((scan) => scan.state === "success")
            .sort((a, b) => b.scan_id - a.scan_id);

          const latestSuccessfulScan = successfulScans[0] ?? null;
          const rangeScan =
            successfulScans.find((scan) =>
              isWithinRange(scan.completed_on || scan.started_on, rangeStart)
            ) ?? null;

          if (!latestSuccessfulScan) {
            return {
              id: project.id,
              name: project.name,
              scan_count: project.scans_count,
              reports_count: project.reports_count,
              scans,
              latestSuccessfulScan: null,
              rangeScan: null,
              latestFindings: [],
              rangeFindings: [],
            } satisfies ProjectDashboardSnapshot;
          }

          const findingsByScanId = new Map<number, Finding[]>();
          const scanIds = Array.from(
            new Set(
              [latestSuccessfulScan.scan_id, rangeScan?.scan_id].filter(
                (scanId): scanId is number => typeof scanId === "number"
              )
            )
          );

          await Promise.all(
            scanIds.map(async (scanId) => {
              findingsByScanId.set(scanId, await fetchAllFindings(scanId));
            })
          );

          return {
            id: project.id,
            name: project.name,
            scan_count: project.scans_count,
            reports_count: project.reports_count,
            scans,
            latestSuccessfulScan,
            rangeScan,
            latestFindings: findingsByScanId.get(latestSuccessfulScan.scan_id) ?? [],
            rangeFindings: rangeScan
              ? (findingsByScanId.get(rangeScan.scan_id) ?? [])
              : [],
          } satisfies ProjectDashboardSnapshot;
        } catch {
          return {
            id: project.id,
            name: project.name,
            scan_count: project.scans_count,
            reports_count: project.reports_count,
            scans: [],
            latestSuccessfulScan: null,
            rangeScan: null,
            latestFindings: [],
            rangeFindings: [],
          } satisfies ProjectDashboardSnapshot;
        }
      })
    );
  }, []);

  const fetchDashboardData = useCallback(async () => {
    if (!accessToken) {
      return;
    }

    setLoadingMonthly(true);
    setLoadingSummary(true);
    setLoadingTopProject(true);

    setErrorMonthly(null);
    setErrorSummary(null);
    setErrorTopProject(null);

    try {
      const rangeStart = getRangeStart(summaryRange);
      const snapshots = await getProjectDashboardSnapshots(rangeStart);

      setMonthlyBugs(deriveMonthlyBugsFromProjects(snapshots));
      setBugsSummary(deriveBugsSummaryFromProjects(snapshots));
      setTopProject(deriveTopProjectFromProjects(snapshots));
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : "Failed to load dashboard data";

      setErrorMonthly(message);
      setErrorSummary(message);
      setErrorTopProject(message);

      setMonthlyBugs({ monthly_bugs: {} });
      setBugsSummary({
        total_bugs: 0,
        severity_breakdown: { ...EMPTY_SEVERITY_SUMMARY },
        top_files_with_bugs: {},
      });
      setTopProject(null);
    } finally {
      setLoadingMonthly(false);
      setLoadingSummary(false);
      setLoadingTopProject(false);
    }
  }, [accessToken, getProjectDashboardSnapshots, summaryRange]);

  useEffect(() => {
    if (!accessToken) {
      return;
    }

    fetchDashboardData();
  }, [accessToken, fetchDashboardData]);

  return {
    monthlyBugs,
    bugsSummary,
    topProject,
    loadingMonthly,
    loadingSummary,
    loadingTopProject,
    errorMonthly,
    errorSummary,
    errorTopProject,
    refetch: () => {
      fetchDashboardData();
    },
  };
}

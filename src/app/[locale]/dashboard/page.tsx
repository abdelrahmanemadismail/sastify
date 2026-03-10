"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import {
  AlertTriangle,
  Bug,
  CircleArrowOutUpRight,
  FileText,
  FolderOpen,
  RefreshCw,
  Shield,
  ScanLine,
} from "lucide-react";

import { useAuth } from "@/hooks/useAuth";
import { useDashboard } from "@/hooks/useDashboard";
import { type BugsSummaryRange } from "@/lib/dashboard-service";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";

const MONTH_ORDER = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

const MONTH_INDEX: Record<string, number> = {
  jan: 0,
  january: 0,
  feb: 1,
  february: 1,
  mar: 2,
  march: 2,
  apr: 3,
  april: 3,
  may: 4,
  jun: 5,
  june: 5,
  jul: 6,
  july: 6,
  aug: 7,
  august: 7,
  sep: 8,
  sept: 8,
  september: 8,
  oct: 9,
  october: 9,
  nov: 10,
  november: 10,
  dec: 11,
  december: 11,
};

function normalizeMonthKey(key: string): number | null {
  const monthIndex = MONTH_INDEX[key.trim().toLowerCase()];
  return Number.isInteger(monthIndex) ? monthIndex : null;
}

function pickSeverityValue(
  breakdown: Record<string, number> | undefined,
  aliases: string[]
): number {
  if (!breakdown) {
    return 0;
  }

  for (const alias of aliases) {
    const exact = breakdown[alias];
    if (typeof exact === "number") {
      return exact;
    }

    const upper = breakdown[alias.toUpperCase()];
    if (typeof upper === "number") {
      return upper;
    }

    const lower = breakdown[alias.toLowerCase()];
    if (typeof lower === "number") {
      return lower;
    }
  }

  return 0;
}

function SeverityPill({
  code,
  value,
  className,
}: {
  code: string;
  value: number;
  className: string;
}) {
  return (
    <div className={`flex h-11 items-stretch overflow-hidden rounded-xl border ${className}`}>
      <div className="grid w-14 place-items-center border-r text-2xl font-semibold">{code}</div>
      <div className="grid min-w-14 place-items-center px-3 text-xl font-semibold">{value}</div>
    </div>
  );
}

function TinyBarChart({
  values,
  color,
}: {
  values: number[];
  color: string;
}) {
  const max = Math.max(...values, 1);
  return (
    <div className="flex h-24 items-end gap-2 rounded-xl bg-slate-100 p-3">
      {values.map((value, index) => (
        <div
          key={`${color}-${index}`}
          className={`w-full rounded-full ${color}`}
          style={{ height: `${Math.max((value / max) * 100, 12)}%` }}
        />
      ))}
    </div>
  );
}

function TrendBadge({ value }: { value: number }) {
  const positive = value > 0;
  const neutral = value === 0;
  return (
    <span
      className={
        neutral
          ? "text-xs text-muted-foreground"
          : positive
            ? "text-xs font-medium text-rose-600"
            : "text-xs font-medium text-emerald-600"
      }
    >
      {neutral ? "0%" : `${positive ? "+" : ""}${value}%`}
    </span>
  );
}

export default function DashboardPage() {
  const t = useTranslations();
  const locale = useLocale();
  const { user } = useAuth();
  const [summaryRange, setSummaryRange] = useState<BugsSummaryRange>("monthly");
  const [scanView, setScanView] = useState<"latest" | "previous">("latest");

  const {
    monthlyBugs,
    bugsSummary,
    topProject,
    loadingMonthly,
    loadingSummary,
    loadingTopProject,
    errorMonthly,
    errorSummary,
    errorTopProject,
    refetch,
  } = useDashboard(summaryRange);

  const monthlyData = useMemo(() => {
    const buckets = new Array(12).fill(0);

    for (const [rawKey, rawValue] of Object.entries(monthlyBugs?.monthly_bugs ?? {})) {
      const monthIndex = normalizeMonthKey(rawKey);
      if (monthIndex === null) {
        continue;
      }

      const value = Number(rawValue);
      if (Number.isFinite(value)) {
        buckets[monthIndex] += value;
      }
    }

    const baseSeries = MONTH_ORDER.map((month, index) => ({
      month,
      count: buckets[index],
    }));

    if (scanView === "previous") {
      return baseSeries.map((item, index) => ({
        ...item,
        count: index === 0 ? 0 : baseSeries[index - 1].count,
      }));
    }

    return baseSeries;
  }, [monthlyBugs, scanView]);

  const severityBreakdown = bugsSummary?.severity_breakdown;
  const severity = {
    C: pickSeverityValue(severityBreakdown, ["C", "critical"]),
    H: pickSeverityValue(severityBreakdown, ["H", "high"]),
    M: pickSeverityValue(severityBreakdown, ["M", "medium"]),
    L: pickSeverityValue(severityBreakdown, ["L", "low"]),
  };
  const totalBugs =
    bugsSummary?.total_bugs ??
    severity.C + severity.H + severity.M + severity.L;

  const lastSevenCounts = useMemo(() => {
    if (monthlyData.length === 0) {
      return [0, 0, 0, 0, 0, 0, 0];
    }
    const points = monthlyData.slice(-7).map((point) => point.count);
    while (points.length < 7) {
      points.unshift(0);
    }
    return points;
  }, [monthlyData]);

  const resolvedSevenCounts = useMemo(() => {
    return lastSevenCounts.map((point, index) => {
      if (index === 0) {
        return 0;
      }
      return Math.max(lastSevenCounts[index - 1] - point, 0);
    });
  }, [lastSevenCounts]);

  const issueDelta = useMemo(() => {
    const first = lastSevenCounts[0] ?? 0;
    const last = lastSevenCounts[lastSevenCounts.length - 1] ?? 0;
    if (first <= 0) {
      return 0;
    }
    return Math.round(((last - first) / first) * 100);
  }, [lastSevenCounts]);

  const fixedCount = resolvedSevenCounts.reduce((sum, val) => sum + val, 0);
  const fixedDelta = useMemo(() => {
    const firstHalf = resolvedSevenCounts.slice(0, 3).reduce((sum, val) => sum + val, 0);
    const secondHalf = resolvedSevenCounts.slice(3, 6).reduce((sum, val) => sum + val, 0);
    if (firstHalf <= 0) {
      return secondHalf > 0 ? 100 : 0;
    }
    return Math.round(((secondHalf - firstHalf) / firstHalf) * 100);
  }, [resolvedSevenCounts]);

  const linePoints = useMemo(() => {
    const width = 700;
    const height = 220;
    const maxValue = Math.max(...lastSevenCounts, 1);
    return lastSevenCounts
      .map((value, index) => {
        const x = (index / 6) * width;
        const y = height - (value / maxValue) * (height - 24) - 12;
        return `${x},${y}`;
      })
      .join(" ");
  }, [lastSevenCounts]);

  return (
    <div className="flex-1 space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            {t("common.welcome")}, {user?.first_name}
          </h2>
          <p className="text-sm text-muted-foreground">{t("dashboard.security_overview")}</p>
        </div>
        <Button variant="outline" size="sm" onClick={refetch} className="gap-2">
          <RefreshCw className="h-4 w-4" />
          {t("dashboard.overview")}
        </Button>
      </div>

      <Card className="rounded-3xl border-slate-200 bg-gradient-to-b from-slate-100 to-white shadow-sm dark:border-slate-800 dark:from-slate-900 dark:to-slate-950">
        <CardHeader className="gap-4 pb-2">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <CardTitle className="text-3xl font-semibold tracking-tight text-slate-800 dark:text-slate-100">
                {t("dashboard.security_status_latest_scan")}
              </CardTitle>
              <CardDescription className="mt-1 max-w-3xl text-[15px]">
                {t("dashboard.security_status_description")}
              </CardDescription>
            </div>
            <div className="flex items-center gap-2 rounded-xl bg-white p-1 shadow-sm dark:bg-slate-900">
              <Button
                size="sm"
                variant={scanView === "latest" ? "secondary" : "ghost"}
                onClick={() => setScanView("latest")}
                className="rounded-lg"
              >
                {t("dashboard.latest_scan")}
              </Button>
              <Button
                size="sm"
                variant={scanView === "previous" ? "secondary" : "ghost"}
                onClick={() => setScanView("previous")}
                className="rounded-lg"
              >
                {t("dashboard.previous_scan")}
              </Button>
            </div>
          </div>
          <div className="pt-2">
            <Select
              value={summaryRange}
              onValueChange={(v) => setSummaryRange(v as BugsSummaryRange)}
            >
              <SelectTrigger className="h-9 w-36 rounded-xl bg-white dark:bg-slate-900">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">{t("dashboard.range_daily")}</SelectItem>
                <SelectItem value="weekly">{t("dashboard.range_weekly")}</SelectItem>
                <SelectItem value="monthly">{t("dashboard.range_monthly")}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="space-y-5 pt-2">
          {loadingSummary ? (
            <Skeleton className="h-36 w-full rounded-2xl" />
          ) : errorSummary ? (
            <p className="text-sm text-destructive">{errorSummary}</p>
          ) : (
            <>
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="grid h-16 w-16 place-items-center rounded-2xl bg-red-600 text-white">
                    <Bug className="h-9 w-9" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{t("dashboard.total_bugs")}</p>
                    <p className="text-5xl font-bold leading-none tracking-tight text-slate-900 dark:text-slate-100">
                      {totalBugs}
                    </p>
                  </div>
                </div>
                <div>
                  {loadingTopProject ? (
                    <Skeleton className="h-9 w-48 rounded-lg" />
                  ) : topProject ? (
                    <Link href={`/${locale}/dashboard/projects/${topProject.id}`}>
                      <Button className="rounded-xl bg-[#1f2f73] px-6 text-white hover:bg-[#21367d] dark:bg-[#2a3a89]">
                        {t("dashboard.latest_scan_report")}
                        <CircleArrowOutUpRight className="ml-2 h-4 w-4" />
                      </Button>
                    </Link>
                  ) : (
                    <Button disabled className="rounded-xl px-6">
                      {t("dashboard.latest_scan_report")}
                    </Button>
                  )}
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <SeverityPill code="C" value={severity.C} className="border-red-400 bg-red-50 text-red-700 dark:border-red-900/70 dark:bg-red-950/50" />
                <SeverityPill code="H" value={severity.H} className="border-rose-400 bg-rose-50 text-rose-700 dark:border-rose-900/70 dark:bg-rose-950/50" />
                <SeverityPill code="M" value={severity.M} className="border-amber-400 bg-amber-50 text-amber-700 dark:border-amber-900/70 dark:bg-amber-950/40" />
                <SeverityPill code="L" value={severity.L} className="border-emerald-400 bg-emerald-50 text-emerald-700 dark:border-emerald-900/70 dark:bg-emerald-950/40" />
              </div>
              {topProject && (
                <div className="text-sm text-muted-foreground space-y-0.5">
                  <p>
                    {t("dashboard.top_project_attention")}: <span className="font-semibold text-foreground">{topProject.name}</span>
                  </p>
                  <p>
                    {t("dashboard.scans")}: <span className="font-semibold text-foreground">{topProject.scan_count}</span>
                    {typeof topProject.reports_count === "number" && (
                      <>
                        {" "}• {t("dashboard.reports")}: <span className="font-semibold text-foreground">{topProject.reports_count}</span>
                      </>
                    )}
                  </p>
                </div>
              )}
              {errorTopProject && <p className="text-sm text-destructive">{errorTopProject}</p>}
            </>
          )}
        </CardContent>
      </Card>

      <section className="space-y-3">
        <div>
          <h3 className="text-3xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">
            {t("dashboard.security_risk_trend")}
          </h3>
          <p className="text-sm text-muted-foreground">{t("dashboard.security_risk_trend_description")}</p>
        </div>

        <div className="grid gap-4 lg:grid-cols-12">
          <Card className="rounded-3xl lg:col-span-7">
            <CardContent className="grid gap-4 p-4 sm:grid-cols-2">
              <div className="rounded-2xl bg-white p-3 shadow-sm ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800">
                <p className="mb-3 text-sm font-medium text-muted-foreground">
                  {t("dashboard.vulnerabilities_found_7d")}
                </p>
                {loadingMonthly ? (
                  <Skeleton className="h-24 w-full rounded-xl" />
                ) : (
                  <TinyBarChart values={lastSevenCounts} color="bg-rose-600" />
                )}
              </div>
              <div className="rounded-2xl bg-white p-3 shadow-sm ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800">
                <p className="mb-3 text-sm font-medium text-muted-foreground">
                  {t("dashboard.vulnerabilities_resolved_7d")}
                </p>
                {loadingMonthly ? (
                  <Skeleton className="h-24 w-full rounded-xl" />
                ) : (
                  <TinyBarChart values={resolvedSevenCounts} color="bg-indigo-900 dark:bg-indigo-400" />
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-3xl lg:col-span-5">
            <CardContent className="grid h-full items-center gap-6 p-6 sm:grid-cols-2">
              <div>
                <div className="mb-2 flex items-center gap-2 text-muted-foreground">
                  <AlertTriangle className="h-4 w-4 text-rose-500" />
                  <span className="text-sm font-medium">{t("dashboard.total_issues")}</span>
                </div>
                <div className="flex items-end gap-2">
                  <p className="text-5xl font-bold leading-none">{totalBugs}</p>
                  <TrendBadge value={issueDelta} />
                </div>
              </div>
              <div>
                <div className="mb-2 flex items-center gap-2 text-muted-foreground">
                  <Shield className="h-4 w-4 text-emerald-500" />
                  <span className="text-sm font-medium">{t("dashboard.total_fixed")}</span>
                </div>
                <div className="flex items-end gap-2">
                  <p className="text-5xl font-bold leading-none">{fixedCount}</p>
                  <TrendBadge value={-fixedDelta} />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="space-y-3">
        <div>
          <h3 className="text-3xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">
            {t("dashboard.high_risk_exposure_over_time")}
          </h3>
          <p className="text-sm text-muted-foreground">{t("dashboard.high_risk_exposure_description")}</p>
        </div>

        <Card className="rounded-3xl">
          <CardContent className="p-5">
            {loadingMonthly ? (
              <Skeleton className="h-64 w-full rounded-2xl" />
            ) : errorMonthly ? (
              <p className="text-sm text-destructive">{errorMonthly}</p>
            ) : (
              <div className="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800">
                <div className="relative h-56 w-full">
                  <svg className="h-full w-full" viewBox="0 0 700 220" preserveAspectRatio="none" aria-hidden="true">
                    {[1, 2, 3, 4].map((line) => (
                      <line
                        key={line}
                        x1="0"
                        y1={line * 44}
                        x2="700"
                        y2={line * 44}
                        stroke="currentColor"
                        className="text-slate-300/70 dark:text-slate-700/80"
                        strokeWidth="1"
                      />
                    ))}
                    <polyline
                      points={linePoints}
                      fill="none"
                      stroke="currentColor"
                      className="text-rose-700 dark:text-rose-400"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <div className="mt-2 grid grid-cols-7 gap-2 text-center text-sm font-medium text-slate-600 dark:text-slate-300">
                  {lastSevenCounts.map((_, index) => (
                    <span key={index}>{t("dashboard.scan_label", { number: index + 1 })}</span>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </section>

      <Card>
        <CardHeader>
          <CardTitle>{t("dashboard.quick_actions")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Link href={`/${locale}/dashboard/projects`}>
              <Button variant="outline" className="gap-2">
                <FolderOpen className="h-4 w-4" />
                {t("dashboard.view_all_projects")}
              </Button>
            </Link>
            <Link href={`/${locale}/dashboard/scans`}>
              <Button variant="outline" className="gap-2">
                <ScanLine className="h-4 w-4" />
                {t("dashboard.view_all_scans")}
              </Button>
            </Link>
            <Link href={`/${locale}/dashboard/reports`}>
              <Button variant="outline" className="gap-2">
                <FileText className="h-4 w-4" />
                {t("dashboard.view_all_reports")}
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

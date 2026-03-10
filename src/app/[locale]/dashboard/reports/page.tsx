"use client";

import React, { useState, useMemo } from "react";
import { BarChart3, Download, Search } from "lucide-react";
import { useTranslations } from "next-intl";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DashboardPageWrapper } from "@/components/dashboard/page-wrapper";
import { useReports } from "@/hooks/useReports";

export default function ReportsPage() {
  const t = useTranslations();
  const {
    reports,
    isLoading,
    error,
    downloadError,
    pagination,
    downloadReport,
    isDownloadingReport,
    setCurrentPage,
    setPerPage,
  } = useReports();

  const [searchTerm, setSearchTerm] = useState("");
  const [reportType, setReportType] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [sortBy, setSortBy] = useState("date_desc");

  // Apply old-code parity filters/sort on current paged data.
  const filteredReports = useMemo(() => {
    const filtered = reports.filter((report) => {
      const matchesSearch = report.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = reportType === "all" || report.type === reportType;
      const generatedAt = new Date(report.generated_on);
      const fromOk = !dateFrom || generatedAt >= new Date(dateFrom);
      const toDateExclusive = dateTo
        ? new Date(new Date(dateTo).getTime() + 24 * 60 * 60 * 1000)
        : null;
      const toOk = !toDateExclusive || generatedAt < toDateExclusive;

      return matchesSearch && matchesType && fromOk && toOk;
    });

    filtered.sort((a, b) => {
      if (sortBy === "name") {
        return a.name.localeCompare(b.name);
      }

      if (sortBy === "date_asc") {
        return new Date(a.generated_on).getTime() - new Date(b.generated_on).getTime();
      }

      return new Date(b.generated_on).getTime() - new Date(a.generated_on).getTime();
    });

    return filtered;
  }, [reports, searchTerm, reportType, dateFrom, dateTo, sortBy]);

  const handleDownload = async (link: string, reportId: number) => {
    await downloadReport(link, reportId);
  };

  return (
    <DashboardPageWrapper
      title={t("dashboard.security_reports") || "Security Reports"}
      translationKey="security_reports"
      icon={<BarChart3 className="w-8 h-8" />}
    >
      {/* Error Alert */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      {downloadError && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg mb-6">
          {downloadError}
        </div>
      )}

      {/* Search and Filters */}
      <div className="grid gap-4 mb-6 sm:grid-cols-2 lg:grid-cols-5">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder={t("dashboard.search_reports") || "Search reports..."}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <Select value={reportType} onValueChange={setReportType}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("dashboard.all_types")}</SelectItem>
            <SelectItem value="pdf">PDF</SelectItem>
            <SelectItem value="html">HTML</SelectItem>
          </SelectContent>
        </Select>

        <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
        <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />

        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="date_desc">{t("dashboard.sort_date_desc")}</SelectItem>
            <SelectItem value="date_asc">{t("dashboard.sort_date_asc")}</SelectItem>
            <SelectItem value="name">{t("dashboard.sort_name")}</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={pagination.perPage.toString()}
          onValueChange={(value) => setPerPage(parseInt(value))}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="5">5 {t("dashboard.per_page")}</SelectItem>
            <SelectItem value="10">10 {t("dashboard.per_page")}</SelectItem>
            <SelectItem value="20">20 {t("dashboard.per_page")}</SelectItem>
            <SelectItem value="50">50 {t("dashboard.per_page")}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Reports Table */}
      <div className="rounded-lg border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("dashboard.report_name")}</TableHead>
              <TableHead>{t("dashboard.target_project")}</TableHead>
              <TableHead>{t("dashboard.type")}</TableHead>
              <TableHead>{t("dashboard.generated_on")}</TableHead>
              <TableHead className="text-right">{t("dashboard.actions")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading
              ? Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell>
                      <Skeleton className="h-4 w-48" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-32" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-24" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-20" />
                    </TableCell>
                    <TableCell className="text-right">
                      <Skeleton className="h-8 w-24 ml-auto" />
                    </TableCell>
                  </TableRow>
                ))
              : filteredReports.length > 0
              ? filteredReports.map((report) => (
                  <TableRow key={report.id}>
                    <TableCell className="font-medium">
                      <div className="truncate">{report.name}</div>
                    </TableCell>
                    <TableCell>{report.target_project || report.project_name || "-"}</TableCell>
                    <TableCell>{report.type?.toUpperCase() || "-"}</TableCell>
                    <TableCell>
                      {new Date(report.generated_on).toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={isDownloadingReport(report.id)}
                        onClick={() => handleDownload(report.download_link, report.id)}
                      >
                        <Download className="w-4 h-4 mr-2" />
                        {t("dashboard.download")}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-12">
                      <BarChart3 className="w-12 h-12 mx-auto text-muted-foreground mb-4 opacity-50" />
                      <p className="text-muted-foreground">
                        {t("dashboard.no_reports_found")}
                      </p>
                    </TableCell>
                  </TableRow>
                )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {!isLoading && !searchTerm && reportType === "all" && !dateFrom && !dateTo && pagination.totalPages > 1 && (
        <div className="flex justify-between items-center mt-8">
          <p className="text-sm text-muted-foreground">
            {t("dashboard.showing")} {(pagination.currentPage - 1) * pagination.perPage + 1} {t("dashboard.to")}{" "}
            {Math.min(
              pagination.currentPage * pagination.perPage,
              pagination.totalItems
            )}{" "}
            {t("dashboard.of")} {pagination.totalItems} {t("dashboard.reports").toLowerCase()}
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
    </DashboardPageWrapper>
  );
}

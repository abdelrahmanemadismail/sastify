"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import {
  normalizeSeverity,
  scanService,
  ScanWebSocketResult,
  SeverityCode,
} from "@/lib/scan-service";
import { normalizeApiError } from "@/lib/error-handler";

interface ScanOptions {
  pdf?: boolean;
  html?: boolean;
  ai?: boolean;
}

interface ScanUpdatePayload {
  message?: string;
}

type SeverityCount = Record<SeverityCode, number>;

const FINDINGS_HYDRATION_MAX_RETRIES = 8;
const FINDINGS_HYDRATION_RETRY_DELAY_MS = 1000;

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/api";
const WS_URL = new URL(API_BASE_URL).origin;

const SCAN_STEPS = [
  "Preparing scan environment",
  "Initializing scanner engine",
  "Analyzing project structure",
  "Parsing source code",
  "Scanning in progress",
  "Excluding invalid files",
  "Running security checks",
  "Scanning uploaded files",
  "Completed scanning",
  "Reviewing detected issues",
  "Generating security reports",
  "Finalizing scan process",
  "Sorting issues severity",
  "Scan completed",
] as const;

export function useScanProcess() {
  const socketRef = useRef<Socket | null>(null);
  const finalizedRef = useRef(false);
  const [scanning, setScanning] = useState(false);
  const [currentStep, setCurrentStep] = useState(-1);
  const [scanResult, setScanResult] = useState<ScanWebSocketResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const disconnectSocket = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }
  }, []);

  const reset = useCallback(() => {
    disconnectSocket();
    finalizedRef.current = false;
    setScanning(false);
    setCurrentStep(-1);
    setScanResult(null);
    setError(null);
  }, [disconnectSocket]);

  const finalizeScan = useCallback(
    (result: ScanWebSocketResult) => {
      if (finalizedRef.current) {
        return;
      }

      finalizedRef.current = true;
      setCurrentStep(SCAN_STEPS.length - 1);
      setScanResult(result);
      setScanning(false);
      disconnectSocket();
    },
    [disconnectSocket]
  );

  const hydrateResultDetails = useCallback(
    async (projectId: number, baseResult: ScanWebSocketResult): Promise<ScanWebSocketResult> => {
      if (baseResult.findings_count <= 0) {
        return baseResult;
      }

      if ((baseResult.findings?.length ?? 0) > 0) {
        return baseResult;
      }

      const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

      for (let attempt = 0; attempt < FINDINGS_HYDRATION_MAX_RETRIES; attempt += 1) {
        try {
          const scansResponse = await scanService.fetchScans(1, 50);
          const latestScan = scansResponse.data
            .filter((scan) => scan.project_id === projectId && scan.state === "success")
            .sort((a, b) => b.scan_id - a.scan_id)[0];

          if (!latestScan) {
            await wait(FINDINGS_HYDRATION_RETRY_DELAY_MS);
            continue;
          }

          // If backend confirms no vulnerabilities, don't keep polling.
          if (latestScan.vulnerabilities_count === 0) {
            return {
              ...baseResult,
              findings: [],
              severityCount: { C: 0, H: 0, M: 0, L: 0 },
            };
          }

          const severityCount: SeverityCount = { C: 0, H: 0, M: 0, L: 0 };
          const findings: ScanWebSocketResult["findings"] = [];

          let page = 1;
          let totalPages = 1;

          while (page <= totalPages) {
            const findingsResponse = await scanService.fetchFindings(latestScan.scan_id, page, 100);

            for (const finding of findingsResponse.data) {
              const normalizedSeverity = normalizeSeverity(finding.severity);
              if (normalizedSeverity) {
                severityCount[normalizedSeverity] += 1;
              }
              findings.push({
                title: finding.title,
                path: finding.path,
                severity: finding.severity,
              });
            }

            totalPages =
              typeof findingsResponse.message === "string"
                ? totalPages
                : findingsResponse.message.total_pages ?? totalPages;
            page += 1;
          }

          if (findings.length > 0) {
            return {
              ...baseResult,
              findings,
              severityCount,
            };
          }
        } catch {
          // Findings may still be materializing right after scan completion; retry briefly.
        }

        await wait(FINDINGS_HYDRATION_RETRY_DELAY_MS);
      }

      return baseResult;
    },
    []
  );

  const startScan = useCallback(
    async (projectId: number, options: ScanOptions = {}) => {
      disconnectSocket();
      finalizedRef.current = false;
      setError(null);
      setScanResult(null);
      setCurrentStep(0);
      setScanning(true);

      const socket = io(WS_URL, {
        transports: ["websocket"],
        query: { project_id: String(projectId) },
        timeout: 10000,
        reconnectionAttempts: 3,
      });

      socketRef.current = socket;

      socket.on("scan_update", (payload: ScanUpdatePayload) => {
        if (!payload?.message) {
          return;
        }

        const idx = SCAN_STEPS.findIndex(
          (step) => step.toLowerCase() === payload.message?.toLowerCase()
        );

        if (idx !== -1) {
          setCurrentStep(idx);
        }
      });

      socket.on("scan_result", async (result: ScanWebSocketResult) => {
        const hydratedResult = await hydrateResultDetails(projectId, result);
        finalizeScan(hydratedResult);
      });

      socket.on("scan_stopped", () => {
        setScanning(false);
        disconnectSocket();
      });

      socket.on("connect_error", (socketError) => {
        const msg = socketError instanceof Error ? socketError.message : "WebSocket connection error";
        setError(msg);
        setScanning(false);
        disconnectSocket();
      });

      socket.on("error", (socketError) => {
        const msg = socketError instanceof Error ? socketError.message : "WebSocket error";
        setError(msg);
        setScanning(false);
        disconnectSocket();
      });

      socket.on("disconnect", (reason) => {
        if (!finalizedRef.current && reason !== "io client disconnect") {
          setError("WebSocket disconnected before scan completed");
          setScanning(false);
          disconnectSocket();
        }
      });

      try {
        const response = await scanService.startScan(projectId, options);

        // Fallback: some scans complete without emitting `scan_result` over websocket.
        // In that case, finalize from the API response payload so UI leaves progress state.
        const fallbackResult: ScanWebSocketResult = {
          duration: response.data.duration,
          findings_count: response.data.findings_count,
          generated_on: response.data.generated_on,
          pdf_download_link: response.data.pdf_download_link,
          html_download_link: response.data.html_download_link,
          findings: [],
          severityCount: { C: 0, H: 0, M: 0, L: 0 },
        };

        const hydratedResult = await hydrateResultDetails(projectId, fallbackResult);
        finalizeScan(hydratedResult);
      } catch (err) {
        const normalized = normalizeApiError(err);
        setError(normalized.message || "Failed to start scan");
        setScanning(false);
        disconnectSocket();
      }
    },
    [disconnectSocket, finalizeScan, hydrateResultDetails]
  );

  const stopScan = useCallback(
    (projectId: number) => {
      if (!socketRef.current) {
        return;
      }

      socketRef.current.emit("stop_scan", { project_id: String(projectId) });
      disconnectSocket();
      setScanning(false);
    },
    [disconnectSocket]
  );

  const progress = useMemo(() => {
    if (currentStep < 0) {
      return 0;
    }
    return Math.round(((currentStep + 1) / SCAN_STEPS.length) * 100);
  }, [currentStep]);

  useEffect(() => {
    return () => {
      disconnectSocket();
    };
  }, [disconnectSocket]);

  return {
    scanning,
    currentStep,
    scanResult,
    error,
    progress,
    steps: SCAN_STEPS,
    startScan,
    stopScan,
    reset,
  };
}

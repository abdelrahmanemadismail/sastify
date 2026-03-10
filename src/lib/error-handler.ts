import { ApiError } from "./api-client";

export interface NormalizedError {
  message: string;
  details?: string | Record<string, string[]>;
  statusCode: number;
  translationKey: string;
}

export function normalizeApiError(error: unknown): NormalizedError {
  if (error instanceof ApiError) {
    let translationKey = "error.unknown";

    switch (error.statusCode) {
      case 400:
        translationKey = "error.bad_request";
        break;
      case 401:
        translationKey = "error.unauthorized";
        break;
      case 403:
        translationKey = "error.forbidden";
        break;
      case 404:
        translationKey = "error.not_found";
        break;
      case 422:
        translationKey = "error.validation_error";
        break;
      case 423:
        translationKey = "error.account_locked";
        break;
      case 429:
        translationKey = "error.rate_limit";
        break;
      case 500:
        translationKey = "error.server_error";
        break;
    }

    return {
      message: error.message,
      details: error.details,
      statusCode: error.statusCode,
      translationKey,
    };
  }

  if (error instanceof Error) {
    return {
      message: error.message,
      statusCode: 500,
      translationKey: "error.unknown",
    };
  }

  return {
    message: "An unexpected error occurred",
    statusCode: 500,
    translationKey: "error.unknown",
  };
}

export function getErrorMessage(error: unknown): string {
  const normalized = normalizeApiError(error);
  return normalized.message;
}

export function getErrorDetails(error: unknown): string | Record<string, string[]> | undefined {
  const normalized = normalizeApiError(error);
  return normalized.details;
}

export function isValidationError(error: unknown): error is { details: Record<string, string[]> } {
  if (error instanceof ApiError) {
    return error.statusCode === 422 && typeof error.details === "object";
  }
  return false;
}

export function getValidationErrors(
  error: unknown
): Record<string, string> {
  if (!isValidationError(error)) {
    return {};
  }

  const result: Record<string, string> = {};
  const details = error.details as Record<string, string[]>;

  for (const [field, messages] of Object.entries(details)) {
    result[field] = messages[0] || "Validation error";
  }

  return result;
}

export function isAccountLocked(error: unknown): boolean {
  if (error instanceof ApiError) {
    return error.statusCode === 423;
  }
  return false;
}

export function isRateLimited(error: unknown): boolean {
  if (error instanceof ApiError) {
    return error.statusCode === 429;
  }
  return false;
}

export function isUnauthorized(error: unknown): boolean {
  if (error instanceof ApiError) {
    return error.statusCode === 401;
  }
  return false;
}

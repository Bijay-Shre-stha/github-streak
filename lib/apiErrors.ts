// Shared error shapes for API route handlers.

import { NextResponse } from "next/server";
import { GitHubApiError } from "./github";

export interface ApiErrorBody {
  error: string;
  code: string;
  retryAfter?: number;
  [extra: string]: unknown;
}

export interface ApiErrorResult {
  status: number;
  body: ApiErrorBody;
  headers: Record<string, string>;
}

const NO_STORE = { "Cache-Control": "no-store" };

function withRetryAfter(
  status: number,
  body: ApiErrorBody,
  retryAfter: number,
): ApiErrorResult {
  return {
    status,
    body: { ...body, retryAfter },
    headers: { ...NO_STORE, "Retry-After": String(retryAfter) },
  };
}

/** 429 for our own per-IP limiter. */
export function rateLimitedError(resetTime: number): ApiErrorResult {
  const seconds = Math.max(1, Math.ceil((resetTime - Date.now()) / 1000));
  return withRetryAfter(
    429,
    { error: "Rate limit exceeded", code: "RATE_LIMITED" },
    seconds,
  );
}

export function apiError(
  status: number,
  code: string,
  error: string,
  extra: Record<string, unknown> = {},
): ApiErrorResult {
  return { status, body: { error, code, ...extra }, headers: NO_STORE };
}

/** Map an exception thrown while talking to GitHub to an API error. */
export function errorFromException(
  error: unknown,
  fallbackMessage: string,
): ApiErrorResult {
  if (error instanceof GitHubApiError && error.status === 429) {
    return withRetryAfter(
      429,
      {
        error: "GitHub API rate limit reached. Please try again later.",
        code: "UPSTREAM_RATE_LIMITED",
      },
      error.retryAfter ?? 60,
    );
  }
  if (error instanceof GitHubApiError && error.status === 502) {
    return apiError(502, "UPSTREAM_ERROR", error.message);
  }
  return apiError(
    500,
    "INTERNAL_ERROR",
    error instanceof Error ? error.message : fallbackMessage,
  );
}

export function jsonError(e: ApiErrorResult): NextResponse {
  return NextResponse.json(e.body, { status: e.status, headers: e.headers });
}

/** Plain-text variant for the SVG image routes. */
export function textError(e: ApiErrorResult): NextResponse {
  return new NextResponse(e.body.error, { status: e.status, headers: e.headers });
}

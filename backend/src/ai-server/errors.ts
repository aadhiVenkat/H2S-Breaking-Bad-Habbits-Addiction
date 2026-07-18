/**
 * Shared error helpers for AI API routes (Express).
 */

import type { Response } from "express";

export type AiErrorCode =
  | "MISSING_KEY"
  | "RATE_LIMITED"
  | "PARSE_ERROR"
  | "PROVIDER_ERROR"
  | "BAD_REQUEST"
  | "NOT_CONFIGURED";

export class AiServerError extends Error {
  readonly code: AiErrorCode;
  readonly status: number;
  readonly provider?: "gemini";

  constructor(
    code: AiErrorCode,
    message: string,
    options?: { status?: number; provider?: "gemini"; cause?: unknown },
  ) {
    super(message, options?.cause !== undefined ? { cause: options.cause } : undefined);
    this.name = "AiServerError";
    this.code = code;
    this.provider = options?.provider;
    this.status =
      options?.status ??
      (code === "MISSING_KEY" || code === "NOT_CONFIGURED"
        ? 503
        : code === "RATE_LIMITED"
          ? 429
          : code === "BAD_REQUEST" || code === "PARSE_ERROR"
            ? 400
            : 502);
  }
}

export function missingKeyError(provider: "gemini"): AiServerError {
  return new AiServerError(
    "MISSING_KEY",
    "Gemini is not configured. Add GEMINI_API_KEY to your .env file (see .env.example).",
    { provider, status: 503 },
  );
}

export function rateLimitedError(provider: "gemini"): AiServerError {
  return new AiServerError(
    "RATE_LIMITED",
    "Gemini rate limit reached. Please wait a moment and try again.",
    { provider, status: 429 },
  );
}

export function parseError(detail?: string): AiServerError {
  return new AiServerError(
    "PARSE_ERROR",
    detail
      ? `AI response could not be parsed: ${detail}`
      : "AI response was not valid JSON or did not match the expected shape.",
    { status: 502 },
  );
}

export function badRequest(message: string): AiServerError {
  return new AiServerError("BAD_REQUEST", message, { status: 400 });
}

export function providerError(
  provider: "gemini",
  message: string,
  cause?: unknown,
): AiServerError {
  return new AiServerError("PROVIDER_ERROR", message, { provider, status: 502, cause });
}

export function sendError(res: Response, error: unknown): void {
  if (error instanceof AiServerError) {
    res.status(error.status).json({
      error: error.message,
      code: error.code,
      provider: error.provider ?? null,
    });
    return;
  }

  const message = error instanceof Error ? error.message : "Unexpected AI server error.";
  res.status(500).json({ error: message, code: "PROVIDER_ERROR" });
}

export function isRateLimitStatus(status: number): boolean {
  return status === 429;
}

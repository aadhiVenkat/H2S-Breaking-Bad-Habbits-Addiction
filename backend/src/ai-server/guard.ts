/**
 * Request abuse guards for AI API routes (rate limit, body size, prompt length).
 * In-memory buckets are per-process — fine for local/demo; use Redis in production.
 */

import type { Request } from "express";
import { AiServerError, badRequest } from "./errors.js";

export const MAX_PROMPT_CHARS = 8_000;
export const MAX_BODY_BYTES = 32_768;
export const RATE_LIMIT_MAX = 30;
export const RATE_LIMIT_WINDOW_MS = 60_000;

type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();

export function clientKey(req: Request): string {
  const forwarded = req.headers["x-forwarded-for"];
  if (typeof forwarded === "string") {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  } else if (Array.isArray(forwarded) && forwarded[0]) {
    const first = forwarded[0].split(",")[0]?.trim();
    if (first) return first;
  }
  const realIp = req.headers["x-real-ip"];
  if (typeof realIp === "string" && realIp.trim()) return realIp.trim();
  return req.ip || "local";
}

export function assertRateLimit(req: Request, max = RATE_LIMIT_MAX): void {
  const key = clientKey(req);
  const now = Date.now();
  const existing = buckets.get(key);

  if (!existing || now >= existing.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return;
  }

  if (existing.count >= max) {
    throw new AiServerError(
      "RATE_LIMITED",
      "Too many AI requests from this client. Please wait a moment and try again.",
      { status: 429 },
    );
  }

  existing.count += 1;
}

export function assertPromptLength(prompt: string | undefined | null, label = "prompt"): string {
  if (!prompt?.trim()) throw badRequest(`Missing ${label}.`);
  const trimmed = prompt.trim();
  if (trimmed.length > MAX_PROMPT_CHARS) {
    throw badRequest(`${label} exceeds ${MAX_PROMPT_CHARS} characters.`);
  }
  return trimmed;
}

export function assertJsonBody(body: unknown): unknown {
  if (body === undefined || body === null) {
    throw badRequest("Request body is required.");
  }
  return body;
}

/** Only allow same-origin relative app paths (blocks open redirects / javascript:). */
export function sanitizeInternalHref(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  const href = value.trim();
  if (!href.startsWith("/") || href.startsWith("//")) return undefined;
  if (href.includes(":") || href.includes("\\") || href.includes("\0")) return undefined;
  return href.slice(0, 200);
}

/** @internal test helper */
export function _resetRateLimitBuckets(): void {
  buckets.clear();
}

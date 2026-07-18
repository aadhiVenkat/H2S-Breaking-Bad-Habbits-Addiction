/**
 * Typed fetch helpers for Reclaim AI `/api/ai/*` routes on the Express backend.
 */

import { getGeminiApiKey } from "@/lib/auth/index";

export type AiProvider = "gemini" | "mock";

export type AiClientErrorCode =
  | "MISSING_KEY"
  | "RATE_LIMITED"
  | "PARSE_ERROR"
  | "PROVIDER_ERROR"
  | "BAD_REQUEST"
  | "NOT_CONFIGURED"
  | "NETWORK"
  | "UNKNOWN";

export interface AiMeta {
  provider: AiProvider;
  model: string;
  generatedAt: string;
}

export class AiClientError extends Error {
  readonly code: AiClientErrorCode;
  readonly status: number;
  readonly provider: AiProvider | null;

  constructor(
    message: string,
    options: { code: AiClientErrorCode; status?: number; provider?: AiProvider | null },
  ) {
    super(message);
    this.name = "AiClientError";
    this.code = options.code;
    this.status = options.status ?? 500;
    this.provider = options.provider ?? null;
  }
}

interface ErrorBody {
  error?: string;
  code?: string;
  provider?: AiProvider | null;
}

function mapCode(code: string | undefined): AiClientErrorCode {
  switch (code) {
    case "MISSING_KEY":
    case "RATE_LIMITED":
    case "PARSE_ERROR":
    case "PROVIDER_ERROR":
    case "BAD_REQUEST":
    case "NOT_CONFIGURED":
      return code;
    default:
      return "UNKNOWN";
  }
}

/** Express backend base URL (no trailing slash). */
export function getApiBaseUrl(): string {
  const raw = process.env.NEXT_PUBLIC_API_BASE_URL?.trim();
  if (raw) return raw.replace(/\/$/, "");
  return "http://localhost:4000";
}

function apiUrl(path: string): string {
  const base = getApiBaseUrl();
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${base}${normalized}`;
}

/** BYOK header when the logged-in user has stored a Gemini key. */
function aiHeaders(extra?: Record<string, string>): HeadersInit {
  const headers: Record<string, string> = { ...extra };
  const userKey = getGeminiApiKey();
  if (userKey) {
    headers["X-Gemini-Key"] = userKey;
  }
  return headers;
}

export async function postAi<T>(path: string, body: unknown): Promise<T & AiMeta> {
  let response: Response;
  try {
    response = await fetch(apiUrl(path), {
      method: "POST",
      headers: aiHeaders({ "Content-Type": "application/json" }),
      body: JSON.stringify(body),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Network request failed.";
    throw new AiClientError(message, { code: "NETWORK", status: 0 });
  }

  let payload: (T & AiMeta) | ErrorBody | null = null;
  try {
    payload = (await response.json()) as (T & AiMeta) | ErrorBody;
  } catch {
    payload = null;
  }

  if (!response.ok) {
    const err = (payload ?? {}) as ErrorBody;
    throw new AiClientError(err.error || `AI request failed (${response.status}).`, {
      code: mapCode(err.code),
      status: response.status,
      provider: err.provider ?? null,
    });
  }

  if (!payload || typeof payload !== "object") {
    throw new AiClientError("AI response was empty or invalid.", {
      code: "PARSE_ERROR",
      status: 502,
    });
  }

  return payload as T & AiMeta;
}

export async function getAiHealth(ping = false): Promise<{
  ok: boolean;
  ready: boolean;
  generatedAt: string;
  providers: {
    gemini: { configured: boolean; model: string; reachable: boolean | null };
  };
  routes: { gemini: string[] };
}> {
  const url = ping ? apiUrl("/api/ai/health?ping=1") : apiUrl("/api/ai/health");
  let response: Response;
  try {
    response = await fetch(url, { method: "GET", headers: aiHeaders() });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Network request failed.";
    throw new AiClientError(message, { code: "NETWORK", status: 0 });
  }

  if (!response.ok) {
    throw new AiClientError(`Health check failed (${response.status}).`, {
      code: "UNKNOWN",
      status: response.status,
    });
  }

  return response.json();
}

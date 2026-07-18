/**
 * Google Gemini server client for Reclaim AI routes.
 */

import type { Request } from "express";
import { GoogleGenerativeAI } from "@google/generative-ai";
import {
  AiServerError,
  isRateLimitStatus,
  missingKeyError,
  providerError,
  rateLimitedError,
} from "./errors.js";

export type GeminiChatMode = "text" | "json";

export function getGeminiModel(): string {
  return process.env.GEMINI_MODEL?.trim() || "gemini-2.0-flash";
}

/**
 * Prefer `X-Gemini-Key` when present and non-empty; otherwise fall back to env.
 */
export function resolveApiKey(req: Request): string | undefined {
  const headerKey = req.header("X-Gemini-Key")?.trim();
  if (headerKey) return headerKey;
  const envKey = process.env.GEMINI_API_KEY?.trim();
  return envKey || undefined;
}

export function hasGeminiKey(req?: Request): boolean {
  if (req) return Boolean(resolveApiKey(req));
  return Boolean(process.env.GEMINI_API_KEY?.trim());
}

function getClient(apiKey?: string): GoogleGenerativeAI {
  const key = apiKey?.trim() || process.env.GEMINI_API_KEY?.trim();
  if (!key) throw missingKeyError("gemini");
  return new GoogleGenerativeAI(key);
}

function statusFromError(error: unknown): number | undefined {
  if (!error || typeof error !== "object") return undefined;
  if ("status" in error) {
    const status = Number((error as { status?: number }).status);
    if (Number.isFinite(status)) return status;
  }
  if ("statusCode" in error) {
    const status = Number((error as { statusCode?: number }).statusCode);
    if (Number.isFinite(status)) return status;
  }
  return undefined;
}

export async function geminiChat(options: {
  system: string;
  user: string;
  mode?: GeminiChatMode;
  temperature?: number;
  /** Override; typically from `resolveApiKey(req)`. */
  apiKey?: string;
}): Promise<{ content: string; model: string }> {
  const modelName = getGeminiModel();
  const client = getClient(options.apiKey);
  const mode = options.mode ?? "text";

  try {
    const model = client.getGenerativeModel({
      model: modelName,
      systemInstruction: options.system,
      generationConfig: {
        temperature: options.temperature ?? 0.7,
        ...(mode === "json" ? { responseMimeType: "application/json" as const } : {}),
      },
    });

    const result = await model.generateContent(options.user);
    const content = result.response.text()?.trim();
    if (!content) {
      throw providerError("gemini", "Gemini returned an empty response.");
    }

    return { content, model: modelName };
  } catch (error) {
    if (error instanceof AiServerError) throw error;
    const status = statusFromError(error);
    if (status !== undefined && isRateLimitStatus(status)) throw rateLimitedError("gemini");
    if (error instanceof Error && /429|rate.?limit|resource.?exhausted/i.test(error.message)) {
      throw rateLimitedError("gemini");
    }
    const message = error instanceof Error ? error.message : "Gemini request failed.";
    throw providerError("gemini", message, error);
  }
}

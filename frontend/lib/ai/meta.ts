/**
 * UI helpers around AI response metadata from `lib/ai/client`.
 */

import type { AiMeta, AiProvider } from "@/lib/ai/client";

export type { AiMeta, AiProvider };
export type AiResponseMeta = Partial<AiMeta> | null;

export interface LastAiAction {
  label: string;
  provider?: AiProvider | string;
  model?: string;
  generatedAt: string;
}

const LAST_ACTION_KEY = "breakfree_last_ai_action";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

/** Pull provider/model/generatedAt off a service response when present. */
export function extractAiMeta(response: unknown): AiMeta | null {
  if (!isRecord(response)) return null;
  const provider = response.provider;
  const model = response.model;
  const generatedAt = response.generatedAt;
  if (
    (provider === "gemini" || provider === "mock") &&
    typeof model === "string" &&
    typeof generatedAt === "string"
  ) {
    return { provider, model, generatedAt };
  }
  // Partial meta still useful for badges
  if (typeof provider === "string" || typeof model === "string") {
    return {
      provider: (provider as AiProvider) || "gemini",
      model: typeof model === "string" ? model : "",
      generatedAt: typeof generatedAt === "string" ? generatedAt : new Date().toISOString(),
    };
  }
  return null;
}

export function providerDisplayName(provider?: string): string {
  if (!provider) return "AI";
  const lower = provider.toLowerCase();
  if (lower === "gemini") return "Gemini";
  if (lower === "mock") return "Reclaim AI";
  return provider;
}

export function recordLastAiAction(label: string, meta?: AiResponseMeta): void {
  if (typeof window === "undefined") return;
  const action: LastAiAction = {
    label,
    provider: meta?.provider,
    model: meta?.model,
    generatedAt: meta?.generatedAt ?? new Date().toISOString(),
  };
  try {
    sessionStorage.setItem(LAST_ACTION_KEY, JSON.stringify(action));
    window.dispatchEvent(new CustomEvent("breakfree:ai-action", { detail: action }));
  } catch {
    // ignore
  }
}

export function readLastAiAction(): LastAiAction | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(LAST_ACTION_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as LastAiAction;
  } catch {
    return null;
  }
}

export function getErrorMessage(err: unknown, fallback = "Something went wrong talking to the AI."): string {
  if (err instanceof Error && err.message) return err.message;
  if (typeof err === "string") return err;
  if (isRecord(err) && typeof err.error === "string") return err.error;
  if (isRecord(err) && typeof err.message === "string") return err.message;
  return fallback;
}

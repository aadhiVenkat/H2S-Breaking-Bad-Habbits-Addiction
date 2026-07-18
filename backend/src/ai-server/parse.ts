/**
 * JSON extraction + lightweight shape validation for AI responses.
 */

import type {
  AIInsight,
  HabitType,
  Nudge,
  NudgeTone,
  PlanWeek,
  RecoveryGoal,
  RecoveryPlan,
  ReplacementHabit,
  TriggerCategory,
} from "../../../frontend/types.js";
import { parseError } from "./errors.js";
import { sanitizeInternalHref } from "./guard.js";

const TRIGGER_CATEGORIES: TriggerCategory[] = [
  "stress",
  "boredom",
  "social",
  "loneliness",
  "anxiety",
  "fatigue",
  "celebration",
  "habit_cue",
  "conflict",
  "night_routine",
];

const NUDGE_TONES: NudgeTone[] = [
  "encouragement",
  "check_in",
  "milestone",
  "trigger_alert",
  "celebration",
];

const TREND_DIRECTIONS = ["improving", "steady", "needs_support"] as const;

const EMERGENCY_TOOL_IDS = ["breathing", "delay", "grounding", "distraction", "coach"] as const;

export function extractJson(text: string): unknown {
  const trimmed = text.trim();
  if (!trimmed) throw parseError("empty response");

  try {
    return JSON.parse(trimmed);
  } catch {
    // fall through to fence / substring extraction
  }

  const fence = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fence?.[1]) {
    try {
      return JSON.parse(fence[1].trim());
    } catch {
      // continue
    }
  }

  const start = trimmed.indexOf("{");
  const end = trimmed.lastIndexOf("}");
  if (start !== -1 && end > start) {
    try {
      return JSON.parse(trimmed.slice(start, end + 1));
    } catch {
      // continue
    }
  }

  const arrStart = trimmed.indexOf("[");
  const arrEnd = trimmed.lastIndexOf("]");
  if (arrStart !== -1 && arrEnd > arrStart) {
    try {
      return JSON.parse(trimmed.slice(arrStart, arrEnd + 1));
    } catch {
      // continue
    }
  }

  throw parseError("could not extract JSON from model output");
}

function asRecord(value: unknown, label: string): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw parseError(`expected object for ${label}`);
  }
  return value as Record<string, unknown>;
}

function asString(value: unknown, label: string): string {
  if (typeof value !== "string" || !value.trim()) {
    throw parseError(`expected non-empty string for ${label}`);
  }
  return value.trim();
}

function asStringArray(value: unknown, label: string, min = 1): string[] {
  if (!Array.isArray(value) || value.length < min || !value.every((v) => typeof v === "string" && v.trim())) {
    throw parseError(`expected string[] (min ${min}) for ${label}`);
  }
  return value.map((v) => (v as string).trim());
}

function asNumberArray(value: unknown, label: string): number[] {
  if (!Array.isArray(value) || !value.every((v) => typeof v === "number" && Number.isFinite(v))) {
    throw parseError(`expected number[] for ${label}`);
  }
  return value as number[];
}

function asTrigger(value: unknown): TriggerCategory {
  if (typeof value === "string" && (TRIGGER_CATEGORIES as string[]).includes(value)) {
    return value as TriggerCategory;
  }
  return "habit_cue";
}

function asTriggers(value: unknown): TriggerCategory[] {
  if (!Array.isArray(value)) return [];
  return value.map(asTrigger).filter(Boolean);
}

export function parseRecoveryPlan(
  raw: unknown,
  meta: { habit: HabitType; goal: RecoveryGoal },
): RecoveryPlan {
  const obj = asRecord(raw, "RecoveryPlan");
  const weeksRaw = obj.weeks;
  if (!Array.isArray(weeksRaw) || weeksRaw.length < 1) {
    throw parseError("RecoveryPlan.weeks must be a non-empty array");
  }

  const weeks: PlanWeek[] = weeksRaw.map((w, i) => {
    const week = asRecord(w, `weeks[${i}]`);
    return {
      weekNumber: typeof week.weekNumber === "number" ? week.weekNumber : i + 1,
      focus: asString(week.focus, `weeks[${i}].focus`),
      actions: asStringArray(week.actions, `weeks[${i}].actions`, 1),
    };
  });

  return {
    id: `plan-${Date.now()}`,
    createdAt: new Date().toISOString(),
    habit: meta.habit,
    goal: meta.goal,
    title: asString(obj.title, "title"),
    summary: asString(obj.summary, "summary"),
    weeks,
    dailyPractices: asStringArray(obj.dailyPractices, "dailyPractices", 1),
    milestoneDays:
      Array.isArray(obj.milestoneDays) && obj.milestoneDays.length
        ? asNumberArray(obj.milestoneDays, "milestoneDays")
        : [1, 3, 7, 14, 21, 30, 45, 60, 90],
  };
}

export function parseCheckInSummary(raw: unknown): { summary: string; guidance: string } {
  const obj = asRecord(raw, "check-in summary");
  return {
    summary: asString(obj.summary, "summary"),
    guidance: asString(obj.guidance, "guidance"),
  };
}

export function parseEmergencyIntervention(raw: unknown): {
  message: string;
  tools: { id: (typeof EMERGENCY_TOOL_IDS)[number]; label: string }[];
} {
  const obj = asRecord(raw, "emergency");
  const toolsRaw = obj.tools;
  if (!Array.isArray(toolsRaw) || toolsRaw.length < 1) {
    throw parseError("emergency.tools must be a non-empty array");
  }

  const tools = toolsRaw.slice(0, 3).map((t, i) => {
    const tool = asRecord(t, `tools[${i}]`);
    const id = typeof tool.id === "string" && (EMERGENCY_TOOL_IDS as readonly string[]).includes(tool.id)
      ? (tool.id as (typeof EMERGENCY_TOOL_IDS)[number])
      : "breathing";
    return {
      id,
      label: asString(tool.label, `tools[${i}].label`),
    };
  });

  return {
    message: asString(obj.message, "message"),
    tools,
  };
}

export function parseRelapseGuidance(raw: unknown): {
  message: string;
  updatedPlanNote: string;
  encouragement: string;
} {
  const obj = asRecord(raw, "relapse guidance");
  return {
    message: asString(obj.message, "message"),
    updatedPlanNote: asString(obj.updatedPlanNote, "updatedPlanNote"),
    encouragement: asString(obj.encouragement, "encouragement"),
  };
}

export function parseNudge(raw: unknown): Omit<Nudge, "id" | "createdAt"> & Partial<Pick<Nudge, "id" | "createdAt">> {
  const obj = asRecord(raw, "nudge");
  const toneRaw = typeof obj.tone === "string" ? obj.tone : "check_in";
  const tone = (NUDGE_TONES as string[]).includes(toneRaw) ? (toneRaw as NudgeTone) : "check_in";

  return {
    tone,
    message: asString(obj.message, "message").slice(0, 280),
    actionLabel: typeof obj.actionLabel === "string" ? obj.actionLabel.slice(0, 80) : undefined,
    actionHref: sanitizeInternalHref(obj.actionHref),
  };
}

export function parseNudges(raw: unknown): Nudge[] {
  const now = new Date().toISOString();
  if (Array.isArray(raw)) {
    return raw.slice(0, 3).map((item, i) => {
      const parsed = parseNudge(item);
      return {
        id: parsed.id ?? `nudge-${Date.now()}-${i}`,
        createdAt: parsed.createdAt ?? now,
        tone: parsed.tone,
        message: parsed.message,
        actionLabel: parsed.actionLabel,
        actionHref: parsed.actionHref,
      };
    });
  }

  const obj = asRecord(raw, "nudge response");
  if (Array.isArray(obj.nudges)) {
    return parseNudges(obj.nudges);
  }

  const parsed = parseNudge(obj);
  return [
    {
      id: `nudge-${Date.now()}`,
      createdAt: now,
      tone: parsed.tone,
      message: parsed.message,
      actionLabel: parsed.actionLabel,
      actionHref: parsed.actionHref,
    },
  ];
}

export function parseInsight(raw: unknown): AIInsight {
  const obj = asRecord(raw, "insight");
  const trendRaw = typeof obj.trendDirection === "string" ? obj.trendDirection : "steady";
  const trendDirection = (TREND_DIRECTIONS as readonly string[]).includes(trendRaw)
    ? (trendRaw as AIInsight["trendDirection"])
    : "steady";

  return {
    id: `insight-${Date.now()}`,
    createdAt: new Date().toISOString(),
    period: obj.period === "monthly" ? "monthly" : "weekly",
    headline: asString(obj.headline, "headline"),
    reflection: asString(obj.reflection, "reflection"),
    suggestions: asStringArray(obj.suggestions, "suggestions", 1).slice(0, 5),
    trendDirection,
  };
}

export function parseReplacements(raw: unknown): ReplacementHabit[] {
  const list = Array.isArray(raw)
    ? raw
    : Array.isArray(asRecord(raw, "replacements").replacements)
      ? (asRecord(raw, "replacements").replacements as unknown[])
      : null;

  if (!list || list.length < 1) {
    throw parseError("expected a non-empty replacements array");
  }

  return list.slice(0, 6).map((item, i) => {
    const obj = asRecord(item, `replacements[${i}]`);
    return {
      id: `rep-ai-${Date.now()}-${i}`,
      title: asString(obj.title, `replacements[${i}].title`),
      description: asString(obj.description, `replacements[${i}].description`),
      linkedTriggers: asTriggers(obj.linkedTriggers).slice(0, 4),
      timesUsed: 0,
      rating: null,
      savedByUser: false,
      aiGenerated: true,
    };
  });
}

export const JSON_SHAPE_HINTS = {
  plan: `Respond with JSON only:
{
  "title": string,
  "summary": string,
  "weeks": [{ "weekNumber": number, "focus": string, "actions": string[] }],
  "dailyPractices": string[],
  "milestoneDays": number[]
}`,
  checkin: `Respond with JSON only:
{ "summary": string, "guidance": string }`,
  emergency: `Respond with JSON only:
{
  "message": string,
  "tools": [{ "id": "breathing"|"delay"|"grounding"|"distraction"|"coach", "label": string }]
}`,
  relapse: `Respond with JSON only:
{ "message": string, "updatedPlanNote": string, "encouragement": string }`,
  nudge: `Respond with JSON only:
{
  "tone": "encouragement"|"check_in"|"milestone"|"trigger_alert"|"celebration",
  "message": string,
  "actionLabel"?: string,
  "actionHref"?: string
}`,
  insight: `Respond with JSON only:
{
  "headline": string,
  "reflection": string,
  "suggestions": string[],
  "trendDirection": "improving"|"steady"|"needs_support",
  "period": "weekly"
}`,
  replacements: `Respond with JSON only:
{
  "replacements": [
    {
      "title": string,
      "description": string,
      "linkedTriggers": string[]
    }
  ]
}
linkedTriggers must use only: ${TRIGGER_CATEGORIES.join(", ")}`,
} as const;

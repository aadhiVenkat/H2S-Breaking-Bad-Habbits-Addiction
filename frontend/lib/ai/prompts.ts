/**
 * Prompt templates for the Reclaim AI GenAI layer.
 *
 * Client services in `lib/ai/*Service.ts` build prompts here, then POST to
 * the Express backend at `NEXT_PUBLIC_API_BASE_URL/api/ai/<name>`.
 */

import type {
  AnalyticsSummary,
  ChatMessage,
  DailyCheckIn,
  HabitProfile,
  OnboardingAssessment,
  RelapseEvent,
} from "@/lib/types";
import { habitLabel, triggerLabel } from "@/lib/utils/labels";

export const SYSTEM_PROMPT = `You are the Reclaim AI Coach, a supportive, non-judgmental recovery companion
embedded in a habit-recovery app. Your job is to help people reduce, replace,
or quit compulsive habits (e.g. doomscrolling, smoking, vaping, alcohol,
junk food, gambling) with warmth and practical guidance.

Core rules:
- Never shame, moralize, or catastrophize. Relapse is data, not failure.
- Be concise, warm, and specific — avoid generic self-help platitudes.
- Reference the person's actual habit, triggers, and history when possible.
- Always offer one small, concrete next action.
- If someone expresses crisis-level distress or self-harm risk, gently
  encourage them to reach out to a professional or crisis line, and do not
  attempt clinical treatment.
- You are not a medical professional; you provide behavioral support only.`;

export function buildRecoveryPlanPrompt(assessment: OnboardingAssessment): string {
  return `Create a personalized, multi-week habit recovery plan.

Person: ${assessment.name}
Habit: ${habitLabel(assessment.habit)} (${assessment.frequencyPerDay}x/day, ${assessment.yearsActive} years, intensity ${assessment.intensity}/5)
Goal: ${assessment.goal}
Triggers: ${assessment.triggers.map(triggerLabel).join(", ")}
Peak times: ${assessment.peakTimes.join(", ")}
Motivation: "${assessment.motivation}"
Emotional state: ${assessment.emotionalState}
Previous attempts: ${assessment.previousAttempts}
Support system: ${assessment.supportSystem}

Produce: a short title, one-paragraph summary, 4 weekly focuses with 2-3
concrete actions each, 3 daily practices, and milestone days. Tailor
everything to their specific triggers and peak times.`;
}

export function buildCoachChatPrompt(messages: ChatMessage[], habit: HabitProfile | null): string {
  const history = messages
    .slice(-8)
    .map((m) => `${m.role === "user" ? "Person" : "Coach"}: ${m.content}`)
    .join("\n");
  return `Context: person is working on ${habit ? habitLabel(habit.habit) : "a habit"}, goal: ${habit?.goal ?? "unspecified"}.
Known triggers: ${habit?.triggers.map(triggerLabel).join(", ") ?? "unknown"}.

Conversation so far:
${history}

Reply as the Reclaim AI Coach: empathetic, specific, one concrete suggestion.`;
}

export function buildCheckInSummaryPrompt(checkIn: Pick<DailyCheckIn, "mood" | "cravingIntensity" | "triggers" | "difficulty" | "journal">): string {
  return `Summarize today's check-in and give brief guidance.

Mood: ${checkIn.mood}/5
Craving intensity: ${checkIn.cravingIntensity}/10
Triggers today: ${checkIn.triggers.map(triggerLabel).join(", ") || "none logged"}
Difficulty resisting: ${checkIn.difficulty}/5
Journal note: "${checkIn.journal}"

Produce: a 1-2 sentence empathetic summary of the day, then 1 short,
specific piece of guidance for tomorrow.`;
}

export function buildWeeklyReflectionPrompt(analytics: AnalyticsSummary): string {
  return `Write a weekly AI reflection based on this analytics summary.

Average craving (7d): ${analytics.averageCraving7d}/10
Average craving (30d): ${analytics.averageCraving30d}/10
Top triggers: ${analytics.topTriggers.map((t) => `${triggerLabel(t.trigger)} (${t.count})`).join(", ")}
Check-in completion rate (14d): ${analytics.checkInCompletionRate}%

Produce: a headline, a 2-3 sentence reflection identifying real patterns
(not generic praise), and 3 specific, actionable suggestions for next week.`;
}

export function buildEmergencyPrompt(cravingIntensity: number, trigger?: string): string {
  return `Person is in an active craving moment right now.
Reported intensity: ${cravingIntensity}/10
Likely trigger: ${trigger ?? "unspecified"}

Produce a short (2-3 sentence), calm, grounding message to say right now,
plus a ranked list of 2-3 tools they should try immediately (breathing,
delay/urge-surf, grounding, distraction, reaching out).`;
}

export function buildRelapseRecoveryPrompt(reflection: Pick<RelapseEvent, "trigger" | "intensityBefore" | "reflection" | "whatHelped">): string {
  return `Person just relapsed and is reflecting on it. Respond with compassion, no shame.

Trigger: ${triggerLabel(reflection.trigger)}
Craving intensity before: ${reflection.intensityBefore}/10
Their reflection: "${reflection.reflection}"
What helped them stop / reset: "${reflection.whatHelped}"

Produce: a short compassionate response reframing this as data, one
specific adjustment to their recovery plan based on the trigger, and one
encouraging next step.`;
}

export function buildNudgePrompt(context: { habit: string; recentTrend: string; topTrigger?: string }): string {
  return `Generate a single short, time-of-day-aware nudge notification.

Habit: ${context.habit}
Recent trend: ${context.recentTrend}
Top trigger recently: ${context.topTrigger ?? "unknown"}

Produce: one short (<220 char), warm, specific nudge message. No shame,
no generic "you got this" filler — reference the actual pattern.`;
}

export function buildReplacementHabitsPrompt(habit: HabitProfile): string {
  return `Suggest replacement habits that can interrupt or substitute the target habit.

Habit: ${habitLabel(habit.habit)} (${habit.habitLabel || habitLabel(habit.habit)})
Goal: ${habit.goal}
Frequency: ${habit.frequencyPerDay}x/day
Triggers: ${habit.triggers.map(triggerLabel).join(", ")}
Peak times: ${habit.peakTimes.join(", ")}
Motivation: "${habit.motivation}"

Produce 4-5 concrete replacement habits. Each should be doable in under 10
minutes, matched to at least one of their triggers, and specific enough to
act on immediately — not vague advice like "exercise more".`;
}

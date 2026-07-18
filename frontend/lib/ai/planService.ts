import type { AiMeta } from "@/lib/ai/client";
import { postAi } from "@/lib/ai/client";
import type { OnboardingAssessment, RecoveryPlan } from "@/lib/types";
import { buildRecoveryPlanPrompt } from "@/lib/ai/prompts";
import { GOAL_LABELS, TRIGGER_LABELS, TIME_OF_DAY_LABELS } from "@/lib/utils/labels";

/** Template plan built purely from onboarding answers — defensive offline fallback. */
export function buildFallbackPlan(assessment: OnboardingAssessment): RecoveryPlan {
  const goalLabel = GOAL_LABELS[assessment.goal];
  const triggerList = assessment.triggers.map((t) => TRIGGER_LABELS[t]).join(", ");
  const peakList = assessment.peakTimes.map((t) => TIME_OF_DAY_LABELS[t]).join(", ");

  return {
    id: `plan-fallback-${Date.now()}`,
    createdAt: new Date().toISOString(),
    habit: assessment.habit,
    goal: assessment.goal,
    title: `${assessment.habitLabel}: ${goalLabel}`,
    summary: `A starter plan for ${assessment.name} focused on ${assessment.habitLabel.toLowerCase()} (${goalLabel.toLowerCase()}).`,
    weeks: [
      {
        weekNumber: 1,
        focus: "Awareness and interruption",
        actions: [
          `Log a daily check-in, especially around ${peakList || "your usual peak times"}`,
          `Notice your top triggers: ${triggerList || "the ones you named"}`,
          "Open Emergency support at the first strong urge — before deciding",
        ],
      },
    ],
    dailyPractices: ["Morning: one-sentence intention", "Evening: short check-in (mood + craving + trigger)"],
    milestoneDays: [1, 3, 7, 14, 21, 30, 45, 60, 90],
  };
}

export async function generateRecoveryPlan(assessment: OnboardingAssessment): Promise<RecoveryPlan & AiMeta> {
  const prompt = buildRecoveryPlanPrompt(assessment);
  return postAi<RecoveryPlan>("/api/ai/plan", { prompt, assessment });
}

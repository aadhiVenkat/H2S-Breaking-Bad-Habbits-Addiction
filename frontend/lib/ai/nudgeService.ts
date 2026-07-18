import type { AiMeta } from "@/lib/ai/client";
import { postAi } from "@/lib/ai/client";
import type { CravingEvent, DailyCheckIn, Nudge, TriggerCategory, UserProfile } from "@/lib/types";
import { buildNudgePrompt } from "@/lib/ai/prompts";
import { habitLabel, triggerLabel } from "@/lib/utils/labels";

function topTrigger(checkIns: DailyCheckIn[], cravingEvents: CravingEvent[]): TriggerCategory | undefined {
  const counts = new Map<TriggerCategory, number>();
  for (const c of checkIns) for (const t of c.triggers) counts.set(t, (counts.get(t) ?? 0) + 1);
  for (const c of cravingEvents) counts.set(c.trigger, (counts.get(c.trigger) ?? 0) + 1);
  const sorted = Array.from(counts.entries()).sort((a, b) => b[1] - a[1]);
  return sorted[0]?.[0];
}

export async function getNudges(
  profile: UserProfile,
  checkIns: DailyCheckIn[],
  cravingEvents: CravingEvent[],
): Promise<Array<Nudge & AiMeta>> {
  const trigger = topTrigger(checkIns, cravingEvents);
  const context = {
    habit: habitLabel(profile.habit.habit),
    recentTrend: "see analytics",
    topTrigger: trigger ? triggerLabel(trigger) : undefined,
  };
  const prompt = buildNudgePrompt(context);
  const result = await postAi<{ nudges: Nudge[] }>("/api/ai/nudge", { prompt, context });
  const meta: AiMeta = {
    provider: result.provider,
    model: result.model,
    generatedAt: result.generatedAt,
  };
  return (result.nudges ?? []).map((nudge) => ({ ...nudge, ...meta }));
}

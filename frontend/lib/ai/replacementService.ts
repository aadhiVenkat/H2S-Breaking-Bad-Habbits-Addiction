import type { AiMeta } from "@/lib/ai/client";
import { postAi } from "@/lib/ai/client";
import type { HabitProfile, ReplacementHabit } from "@/lib/types";
import { buildReplacementHabitsPrompt } from "@/lib/ai/prompts";

export async function generateReplacements(habit: HabitProfile): Promise<Array<ReplacementHabit & AiMeta>> {
  const prompt = buildReplacementHabitsPrompt(habit);
  const result = await postAi<{ replacements: ReplacementHabit[] }>("/api/ai/replacements", {
    prompt,
    habit,
  });
  const meta: AiMeta = {
    provider: result.provider,
    model: result.model,
    generatedAt: result.generatedAt,
  };
  return (result.replacements ?? []).map((item) => ({ ...item, ...meta }));
}

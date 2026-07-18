import type { AiMeta } from "@/lib/ai/client";
import { postAi } from "@/lib/ai/client";
import type { AIInsight, AnalyticsSummary } from "@/lib/types";
import { buildWeeklyReflectionPrompt } from "@/lib/ai/prompts";

export async function weeklyReflection(analytics: AnalyticsSummary): Promise<AIInsight & AiMeta> {
  const prompt = buildWeeklyReflectionPrompt(analytics);
  return postAi<AIInsight>("/api/ai/insight", { prompt, analytics });
}

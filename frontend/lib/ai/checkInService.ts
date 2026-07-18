import type { AiMeta } from "@/lib/ai/client";
import { postAi } from "@/lib/ai/client";
import type { DailyCheckIn } from "@/lib/types";
import { buildCheckInSummaryPrompt } from "@/lib/ai/prompts";

export async function summarize(
  checkIn: Pick<DailyCheckIn, "mood" | "cravingIntensity" | "triggers" | "difficulty" | "journal">,
): Promise<{ summary: string; guidance: string } & AiMeta> {
  const prompt = buildCheckInSummaryPrompt(checkIn);
  return postAi<{ summary: string; guidance: string }>("/api/ai/checkin", { prompt, checkIn });
}

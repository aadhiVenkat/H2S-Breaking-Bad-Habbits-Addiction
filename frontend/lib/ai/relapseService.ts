import type { AiMeta } from "@/lib/ai/client";
import { postAi } from "@/lib/ai/client";
import type { RelapseEvent } from "@/lib/types";
import { buildRelapseRecoveryPrompt } from "@/lib/ai/prompts";

export interface RelapseGuidance {
  message: string;
  updatedPlanNote: string;
  encouragement: string;
}

export async function recover(
  reflection: Pick<RelapseEvent, "trigger" | "intensityBefore" | "reflection" | "whatHelped">,
): Promise<RelapseGuidance & AiMeta> {
  const prompt = buildRelapseRecoveryPrompt(reflection);
  return postAi<RelapseGuidance>("/api/ai/relapse", { prompt, reflection });
}

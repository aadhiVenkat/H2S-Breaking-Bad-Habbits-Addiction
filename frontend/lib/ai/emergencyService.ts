import type { AiMeta } from "@/lib/ai/client";
import { postAi } from "@/lib/ai/client";
import { buildEmergencyPrompt } from "@/lib/ai/prompts";

export interface EmergencyIntervention {
  message: string;
  tools: { id: "breathing" | "delay" | "grounding" | "distraction" | "coach"; label: string }[];
}

export const DEFAULT_EMERGENCY_TOOLS: EmergencyIntervention["tools"] = [
  { id: "breathing", label: "Box breathing" },
  { id: "delay", label: "Urge surfing delay" },
  { id: "grounding", label: "5-4-3-2-1 grounding" },
  { id: "distraction", label: "Quick distraction" },
  { id: "coach", label: "Talk to AI coach" },
];

/** Local tools + message, kept as a defensive fallback if this ever runs offline. */
export function offlineIntervention(cravingIntensity: number): EmergencyIntervention {
  return {
    message:
      cravingIntensity >= 7
        ? "This urge is strong — and temporary. You don't need AI to get through the next few minutes. Pick a tool below and ride the wave."
        : "Pausing is already a win. Use one of the tools below to create a little distance from the urge.",
    tools: DEFAULT_EMERGENCY_TOOLS,
  };
}

export async function calmingIntervention(
  cravingIntensity: number,
  trigger?: string,
): Promise<EmergencyIntervention & AiMeta> {
  const prompt = buildEmergencyPrompt(cravingIntensity, trigger);
  return postAi<EmergencyIntervention>("/api/ai/emergency", {
    prompt,
    cravingIntensity,
    trigger,
  });
}

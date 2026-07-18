export * as planService from "@/lib/ai/planService";
export * as coachService from "@/lib/ai/coachService";
export * as nudgeService from "@/lib/ai/nudgeService";
export * as checkInService from "@/lib/ai/checkInService";
export * as insightService from "@/lib/ai/insightService";
export * as emergencyService from "@/lib/ai/emergencyService";
export * as relapseService from "@/lib/ai/relapseService";
export * as replacementService from "@/lib/ai/replacementService";
export { postAi, getAiHealth, AiClientError } from "@/lib/ai/client";
export type { AiMeta, AiProvider, AiClientErrorCode } from "@/lib/ai/client";
export {
  extractAiMeta,
  getErrorMessage,
  recordLastAiAction,
  readLastAiAction,
  providerDisplayName,
} from "@/lib/ai/meta";
export type { AiResponseMeta, LastAiAction } from "@/lib/ai/meta";

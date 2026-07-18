import type { AiMeta } from "@/lib/ai/client";
import { postAi } from "@/lib/ai/client";
import type { ChatIntent, ChatMessage, HabitProfile } from "@/lib/types";
import { buildCoachChatPrompt } from "@/lib/ai/prompts";

export function detectIntent(text: string): ChatIntent {
  const lower = text.toLowerCase();
  if (/(relapse|slipped|failed|messed up|gave in)/.test(lower)) return "relapse";
  if (/(craving|urge|want to|tempted|itch)/.test(lower)) return "craving";
  if (/(motivat|give up|pointless|why bother|hopeless)/.test(lower)) return "motivation";
  if (/(thank|grateful|appreciate)/.test(lower)) return "gratitude";
  if (/(streak|progress|doing|proud|better)/.test(lower)) return "progress";
  return "general";
}

export async function chat(messages: ChatMessage[], habit: HabitProfile | null): Promise<ChatMessage & AiMeta> {
  const lastUser = [...messages].reverse().find((m) => m.role === "user");
  const prompt = buildCoachChatPrompt(messages, habit);
  const reply = await postAi<ChatMessage>("/api/ai/coach", { prompt, messages, habit });
  const intent = lastUser ? detectIntent(lastUser.content) : "general";
  return { ...reply, intent };
}

export const SUGGESTED_PROMPTS = [
  "I'm craving right now",
  "I relapsed today",
  "I need motivation",
  "How am I doing this week?",
];

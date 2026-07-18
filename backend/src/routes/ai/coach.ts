import { Router } from "express";
import { SYSTEM_PROMPT } from "../../prompts.js";
import { sendError } from "../../ai-server/errors.js";
import { assertJsonBody, assertPromptLength, assertRateLimit } from "../../ai-server/guard.js";
import { geminiChat, resolveApiKey } from "../../ai-server/gemini.js";

export const coachRouter = Router();

function aiMeta(model: string) {
  return {
    provider: "gemini" as const,
    model,
    generatedAt: new Date().toISOString(),
  };
}

coachRouter.post("/", async (req, res) => {
  try {
    assertRateLimit(req);
    const body = assertJsonBody(req.body) as { prompt?: string };
    const prompt = assertPromptLength(body.prompt);

    const { content, model } = await geminiChat({
      system: SYSTEM_PROMPT,
      user: prompt,
      mode: "text",
      temperature: 0.75,
      apiKey: resolveApiKey(req),
    });

    res.json({
      ...aiMeta(model),
      id: `chat-${Date.now()}`,
      role: "assistant" as const,
      content,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    sendError(res, error);
  }
});

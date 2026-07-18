import { Router } from "express";
import { SYSTEM_PROMPT } from "../../prompts.js";
import { sendError } from "../../ai-server/errors.js";
import { assertJsonBody, assertPromptLength, assertRateLimit } from "../../ai-server/guard.js";
import { geminiChat, resolveApiKey } from "../../ai-server/gemini.js";
import { extractJson, JSON_SHAPE_HINTS, parseRelapseGuidance } from "../../ai-server/parse.js";

export const relapseRouter = Router();

function aiMeta(model: string) {
  return {
    provider: "gemini" as const,
    model,
    generatedAt: new Date().toISOString(),
  };
}

relapseRouter.post("/", async (req, res) => {
  try {
    assertRateLimit(req);
    const body = assertJsonBody(req.body) as { prompt?: string };
    const prompt = assertPromptLength(body.prompt);

    const user = `${prompt}

${JSON_SHAPE_HINTS.relapse}`;

    const { content, model } = await geminiChat({
      system: SYSTEM_PROMPT,
      user,
      mode: "json",
      temperature: 0.55,
      apiKey: resolveApiKey(req),
    });

    const result = parseRelapseGuidance(extractJson(content));

    res.json({ ...aiMeta(model), ...result });
  } catch (error) {
    sendError(res, error);
  }
});

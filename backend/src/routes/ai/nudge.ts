import { Router } from "express";
import { SYSTEM_PROMPT } from "../../prompts.js";
import { sendError } from "../../ai-server/errors.js";
import { assertJsonBody, assertPromptLength, assertRateLimit } from "../../ai-server/guard.js";
import { extractJson, JSON_SHAPE_HINTS, parseNudges } from "../../ai-server/parse.js";
import { geminiChat, resolveApiKey } from "../../ai-server/gemini.js";

export const nudgeRouter = Router();

function aiMeta(model: string) {
  return {
    provider: "gemini" as const,
    model,
    generatedAt: new Date().toISOString(),
  };
}

nudgeRouter.post("/", async (req, res) => {
  try {
    assertRateLimit(req);
    const body = assertJsonBody(req.body) as { prompt?: string };
    const prompt = assertPromptLength(body.prompt);

    const user = `${prompt}

${JSON_SHAPE_HINTS.nudge}

Use evidence-informed habit-change language. Prefer practical, time-of-day-aware wording.`;

    const { content, model } = await geminiChat({
      system: SYSTEM_PROMPT,
      user,
      mode: "json",
      temperature: 0.5,
      apiKey: resolveApiKey(req),
    });

    const nudges = parseNudges(extractJson(content));

    res.json({ ...aiMeta(model), nudges });
  } catch (error) {
    sendError(res, error);
  }
});

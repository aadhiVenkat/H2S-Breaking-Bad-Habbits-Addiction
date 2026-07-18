import { Router } from "express";
import { SYSTEM_PROMPT } from "../../prompts.js";
import { sendError } from "../../ai-server/errors.js";
import { assertJsonBody, assertPromptLength, assertRateLimit } from "../../ai-server/guard.js";
import { extractJson, JSON_SHAPE_HINTS, parseInsight } from "../../ai-server/parse.js";
import { geminiChat, resolveApiKey } from "../../ai-server/gemini.js";

export const insightRouter = Router();

function aiMeta(model: string) {
  return {
    provider: "gemini" as const,
    model,
    generatedAt: new Date().toISOString(),
  };
}

insightRouter.post("/", async (req, res) => {
  try {
    assertRateLimit(req);
    const body = assertJsonBody(req.body) as { prompt?: string };
    const prompt = assertPromptLength(body.prompt);

    const user = `${prompt}

${JSON_SHAPE_HINTS.insight}

Ground suggestions in the provided analytics and known behavioral science for habit change — stay specific to the numbers, not generic praise.`;

    const { content, model } = await geminiChat({
      system: SYSTEM_PROMPT,
      user,
      mode: "json",
      temperature: 0.45,
      apiKey: resolveApiKey(req),
    });

    const insight = parseInsight(extractJson(content));

    res.json({ ...aiMeta(model), ...insight });
  } catch (error) {
    sendError(res, error);
  }
});

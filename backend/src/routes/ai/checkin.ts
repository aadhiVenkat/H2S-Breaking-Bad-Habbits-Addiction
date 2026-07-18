import { Router } from "express";
import { SYSTEM_PROMPT } from "../../prompts.js";
import { sendError } from "../../ai-server/errors.js";
import { assertJsonBody, assertPromptLength, assertRateLimit } from "../../ai-server/guard.js";
import { geminiChat, resolveApiKey } from "../../ai-server/gemini.js";
import { extractJson, JSON_SHAPE_HINTS, parseCheckInSummary } from "../../ai-server/parse.js";

export const checkinRouter = Router();

function aiMeta(model: string) {
  return {
    provider: "gemini" as const,
    model,
    generatedAt: new Date().toISOString(),
  };
}

checkinRouter.post("/", async (req, res) => {
  try {
    assertRateLimit(req);
    const body = assertJsonBody(req.body) as { prompt?: string };
    const prompt = assertPromptLength(body.prompt);

    const user = `${prompt}

${JSON_SHAPE_HINTS.checkin}`;

    const { content, model } = await geminiChat({
      system: SYSTEM_PROMPT,
      user,
      mode: "json",
      temperature: 0.5,
      apiKey: resolveApiKey(req),
    });

    const result = parseCheckInSummary(extractJson(content));

    res.json({ ...aiMeta(model), ...result });
  } catch (error) {
    sendError(res, error);
  }
});

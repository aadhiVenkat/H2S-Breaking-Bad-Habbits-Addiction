import { Router } from "express";
import { SYSTEM_PROMPT } from "../../prompts.js";
import { sendError } from "../../ai-server/errors.js";
import { assertJsonBody, assertPromptLength, assertRateLimit } from "../../ai-server/guard.js";
import { extractJson, JSON_SHAPE_HINTS, parseReplacements } from "../../ai-server/parse.js";
import { geminiChat, resolveApiKey } from "../../ai-server/gemini.js";

export const replacementsRouter = Router();

function aiMeta(model: string) {
  return {
    provider: "gemini" as const,
    model,
    generatedAt: new Date().toISOString(),
  };
}

replacementsRouter.post("/", async (req, res) => {
  try {
    assertRateLimit(req);
    const body = assertJsonBody(req.body) as { prompt?: string };
    const prompt = assertPromptLength(body.prompt);

    const user = `${prompt}

${JSON_SHAPE_HINTS.replacements}

Suggest 4-5 realistic replacement habits grounded in evidence-informed habit substitution (small, doable in under 10 minutes, matched to triggers).`;

    const { content, model } = await geminiChat({
      system: SYSTEM_PROMPT,
      user,
      mode: "json",
      temperature: 0.5,
      apiKey: resolveApiKey(req),
    });

    const replacements = parseReplacements(extractJson(content));

    res.json({ ...aiMeta(model), replacements });
  } catch (error) {
    sendError(res, error);
  }
});

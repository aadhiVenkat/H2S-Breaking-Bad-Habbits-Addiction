import { Router } from "express";
import type { HabitType, OnboardingAssessment, RecoveryGoal } from "../../../../frontend/types.js";
import { SYSTEM_PROMPT } from "../../prompts.js";
import { badRequest, sendError } from "../../ai-server/errors.js";
import { assertJsonBody, assertPromptLength, assertRateLimit } from "../../ai-server/guard.js";
import { geminiChat, resolveApiKey } from "../../ai-server/gemini.js";
import { extractJson, JSON_SHAPE_HINTS, parseRecoveryPlan } from "../../ai-server/parse.js";

export const planRouter = Router();

function aiMeta(model: string) {
  return {
    provider: "gemini" as const,
    model,
    generatedAt: new Date().toISOString(),
  };
}

planRouter.post("/", async (req, res) => {
  try {
    assertRateLimit(req);
    const body = assertJsonBody(req.body) as {
      prompt?: string;
      assessment?: OnboardingAssessment;
    };

    const prompt = assertPromptLength(body.prompt);
    if (!body.assessment?.habit || !body.assessment?.goal) {
      throw badRequest("Missing assessment.habit / assessment.goal.");
    }

    const habit = body.assessment.habit as HabitType;
    const goal = body.assessment.goal as RecoveryGoal;

    const user = `${prompt}

${JSON_SHAPE_HINTS.plan}`;

    const { content, model } = await geminiChat({
      system: SYSTEM_PROMPT,
      user,
      mode: "json",
      temperature: 0.6,
      apiKey: resolveApiKey(req),
    });

    const plan = parseRecoveryPlan(extractJson(content), { habit, goal });

    res.json({ ...aiMeta(model), ...plan });
  } catch (error) {
    sendError(res, error);
  }
});

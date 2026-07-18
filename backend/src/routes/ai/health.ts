import { Router } from "express";
import { sendError } from "../../ai-server/errors.js";
import { assertRateLimit } from "../../ai-server/guard.js";
import { hasGeminiKey, getGeminiModel, resolveApiKey } from "../../ai-server/gemini.js";

export const healthRouter = Router();

/**
 * GET /api/ai/health — key presence + configured models (no secret values).
 * Optional lightweight ping when `?ping=1` is set (skipped by default for speed).
 * Gemini key may come from `X-Gemini-Key` or `GEMINI_API_KEY`.
 */
healthRouter.get("/", async (req, res) => {
  try {
    const shouldPing = req.query.ping === "1";
    assertRateLimit(req, shouldPing ? 10 : 60);

    const geminiKey = resolveApiKey(req);
    const geminiConfigured = hasGeminiKey(req);

    let geminiReachable: boolean | null = null;

    if (shouldPing) {
      if (geminiConfigured && geminiKey) {
        try {
          const model = getGeminiModel();
          const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}?key=${encodeURIComponent(geminiKey)}`;
          const pingRes = await fetch(url, { method: "GET" });
          geminiReachable = pingRes.ok || pingRes.status === 401 || pingRes.status === 403;
        } catch {
          geminiReachable = false;
        }
      }
    }

    const ready = geminiConfigured;

    res.json({
      ok: ready,
      ready,
      generatedAt: new Date().toISOString(),
      providers: {
        gemini: {
          configured: geminiConfigured,
          model: getGeminiModel(),
          reachable: geminiReachable,
        },
      },
      routes: {
        gemini: ["plan", "coach", "checkin", "emergency", "relapse", "nudge", "insight", "replacements"],
      },
    });
  } catch (error) {
    sendError(res, error);
  }
});

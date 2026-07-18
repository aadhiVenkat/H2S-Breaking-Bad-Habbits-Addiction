import { describe, expect, it } from "vitest";
import {
  extractJson,
  parseCheckInSummary,
  parseEmergencyIntervention,
  parseInsight,
  parseNudge,
  parseNudges,
  parseRecoveryPlan,
  parseRelapseGuidance,
  parseReplacements,
} from "./parse.js";
import { AiServerError } from "./errors.js";

describe("extractJson", () => {
  it("parses raw JSON", () => {
    expect(extractJson('{"a":1}')).toEqual({ a: 1 });
  });

  it("extracts JSON from fenced markdown", () => {
    expect(extractJson('Here you go:\n```json\n{"ok":true}\n```')).toEqual({ ok: true });
  });

  it("extracts the first object substring when surrounded by prose", () => {
    expect(extractJson('prefix {"ok":true} trailing')).toEqual({ ok: true });
  });

  it("extracts a JSON array substring", () => {
    expect(extractJson("items: [1,2,3] done")).toEqual([1, 2, 3]);
  });

  it("prefers the first balanced object when thought text has braces", () => {
    expect(
      extractJson('Need {"summary"} shape.\n{"summary":"ok","guidance":"rest"}'),
    ).toEqual({ summary: "ok", guidance: "rest" });
  });

  it("ignores braces inside JSON strings while balancing", () => {
    expect(extractJson('note {x}\n{"msg":"use {curly} braces"}')).toEqual({
      msg: "use {curly} braces",
    });
  });

  it("throws on empty input", () => {
    expect(() => extractJson("")).toThrow(AiServerError);
  });

  it("throws when no JSON can be extracted", () => {
    expect(() => extractJson("not json at all")).toThrow(AiServerError);
  });
});

describe("parseRecoveryPlan", () => {
  it("validates and normalizes a plan payload", () => {
    const plan = parseRecoveryPlan(
      {
        title: "Steady start",
        summary: "A gentle first week.",
        weeks: [{ weekNumber: 1, focus: "Awareness", actions: ["Log urges"] }],
        dailyPractices: ["2-minute pause"],
        milestoneDays: [1, 7],
      },
      { habit: "doomscrolling", goal: "reduce" },
    );

    expect(plan.title).toBe("Steady start");
    expect(plan.habit).toBe("doomscrolling");
    expect(plan.goal).toBe("reduce");
    expect(plan.weeks).toHaveLength(1);
    expect(plan.dailyPractices).toEqual(["2-minute pause"]);
    expect(plan.milestoneDays).toEqual([1, 7]);
    expect(plan.id).toMatch(/^plan-/);
  });

  it("defaults milestoneDays when omitted", () => {
    const plan = parseRecoveryPlan(
      {
        title: "Plan",
        summary: "Summary",
        weeks: [{ focus: "Focus", actions: ["Act"] }],
        dailyPractices: ["Practice"],
      },
      { habit: "smoking", goal: "quit" },
    );
    expect(plan.weeks[0]?.weekNumber).toBe(1);
    expect(plan.milestoneDays).toEqual([1, 3, 7, 14, 21, 30, 45, 60, 90]);
  });

  it("rejects plans without weeks", () => {
    expect(() =>
      parseRecoveryPlan(
        { title: "x", summary: "y", weeks: [], dailyPractices: ["z"] },
        { habit: "other", goal: "replace" },
      ),
    ).toThrow(AiServerError);
  });
});

describe("parseCheckInSummary", () => {
  it("requires summary and guidance strings", () => {
    expect(parseCheckInSummary({ summary: "Solid day", guidance: "Rest early" })).toEqual({
      summary: "Solid day",
      guidance: "Rest early",
    });
  });

  it("rejects missing fields", () => {
    expect(() => parseCheckInSummary({ summary: "only" })).toThrow(AiServerError);
  });
});

describe("parseEmergencyIntervention", () => {
  it("normalizes tools and caps at three", () => {
    const result = parseEmergencyIntervention({
      message: "Breathe with me",
      tools: [
        { id: "breathing", label: "Box breath" },
        { id: "delay", label: "10-min delay" },
        { id: "grounding", label: "5-4-3-2-1" },
        { id: "distraction", label: "Walk" },
      ],
    });
    expect(result.message).toBe("Breathe with me");
    expect(result.tools).toHaveLength(3);
    expect(result.tools[0]).toEqual({ id: "breathing", label: "Box breath" });
  });

  it("falls back unknown tool ids to breathing", () => {
    const result = parseEmergencyIntervention({
      message: "Stay with it",
      tools: [{ id: "unknown", label: "Fallback" }],
    });
    expect(result.tools[0]?.id).toBe("breathing");
  });

  it("rejects empty tools", () => {
    expect(() => parseEmergencyIntervention({ message: "x", tools: [] })).toThrow(AiServerError);
  });
});

describe("parseRelapseGuidance", () => {
  it("requires the three guidance strings", () => {
    expect(
      parseRelapseGuidance({
        message: "You are still in the fight",
        updatedPlanNote: "Reset week 1 focus",
        encouragement: "One day at a time",
      }),
    ).toEqual({
      message: "You are still in the fight",
      updatedPlanNote: "Reset week 1 focus",
      encouragement: "One day at a time",
    });
  });
});

describe("parseInsight", () => {
  it("normalizes period and trendDirection", () => {
    const insight = parseInsight({
      headline: "Cravings dipped",
      reflection: "Evenings are easier.",
      suggestions: ["Walk after dinner"],
      trendDirection: "improving",
      period: "monthly",
    });
    expect(insight.headline).toBe("Cravings dipped");
    expect(insight.period).toBe("monthly");
    expect(insight.trendDirection).toBe("improving");
    expect(insight.suggestions).toEqual(["Walk after dinner"]);
  });

  it("defaults unknown trends to steady and period to weekly", () => {
    const insight = parseInsight({
      headline: "Hold steady",
      reflection: "Keep logging.",
      suggestions: ["Check in nightly"],
      trendDirection: "wild",
      period: "yearly",
    });
    expect(insight.trendDirection).toBe("steady");
    expect(insight.period).toBe("weekly");
  });
});

describe("parseReplacements", () => {
  it("parses a wrapped replacements array", () => {
    const habits = parseReplacements({
      replacements: [
        {
          title: "Tea ritual",
          description: "Brew herbal tea",
          linkedTriggers: ["stress", "bogus"],
        },
      ],
    });
    expect(habits).toHaveLength(1);
    expect(habits[0]?.title).toBe("Tea ritual");
    expect(habits[0]?.linkedTriggers).toEqual(["stress", "habit_cue"]);
    expect(habits[0]?.aiGenerated).toBe(true);
    expect(habits[0]?.timesUsed).toBe(0);
  });

  it("accepts a bare array and caps length", () => {
    const habits = parseReplacements(
      Array.from({ length: 8 }, (_, i) => ({
        title: `Habit ${i}`,
        description: `Desc ${i}`,
        linkedTriggers: ["boredom"],
      })),
    );
    expect(habits).toHaveLength(6);
  });

  it("rejects empty replacements", () => {
    expect(() => parseReplacements({ replacements: [] })).toThrow(AiServerError);
  });
});

describe("parseNudge / sanitizeInternalHref", () => {
  it("keeps safe relative actionHref values", () => {
    const nudge = parseNudge({
      tone: "check_in",
      message: "Take a walk",
      actionLabel: "Open coach",
      actionHref: "/coach",
    });
    expect(nudge.actionHref).toBe("/coach");
    expect(nudge.actionLabel).toBe("Open coach");
  });

  it("truncates long messages", () => {
    const nudge = parseNudge({
      tone: "encouragement",
      message: "x".repeat(400),
    });
    expect(nudge.message).toHaveLength(280);
  });

  it("drops open-redirect and protocol hrefs", () => {
    expect(
      parseNudge({
        tone: "encouragement",
        message: "Nice work",
        actionHref: "https://evil.example",
      }).actionHref,
    ).toBeUndefined();

    expect(
      parseNudge({
        tone: "encouragement",
        message: "Nice work",
        actionHref: "//evil.example",
      }).actionHref,
    ).toBeUndefined();

    expect(
      parseNudge({
        tone: "encouragement",
        message: "Nice work",
        actionHref: "javascript:alert(1)",
      }).actionHref,
    ).toBeUndefined();
  });

  it("parses a nudges array and falls back unknown tones", () => {
    const nudges = parseNudges([
      { tone: "celebration", message: "Day 7!" },
      { tone: "bogus", message: "Fallback tone" },
    ]);
    expect(nudges).toHaveLength(2);
    expect(nudges[0]?.tone).toBe("celebration");
    expect(nudges[1]?.tone).toBe("check_in");
    expect(nudges[0]?.id).toMatch(/^nudge-/);
  });

  it("parses a single nudge object and a nudges wrapper", () => {
    const single = parseNudges({ tone: "milestone", message: "Week one" });
    expect(single).toHaveLength(1);
    expect(single[0]?.tone).toBe("milestone");

    const wrapped = parseNudges({
      nudges: [{ tone: "trigger_alert", message: "Evening risk window" }],
    });
    expect(wrapped).toHaveLength(1);
    expect(wrapped[0]?.tone).toBe("trigger_alert");
  });
});

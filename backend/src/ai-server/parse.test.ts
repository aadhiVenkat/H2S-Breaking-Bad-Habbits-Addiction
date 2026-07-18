import { describe, expect, it } from "vitest";
import {
  extractJson,
  parseCheckInSummary,
  parseNudge,
  parseNudges,
  parseRecoveryPlan,
} from "./parse.js";
import { AiServerError } from "./errors.js";

describe("extractJson", () => {
  it("parses raw JSON", () => {
    expect(extractJson('{"a":1}')).toEqual({ a: 1 });
  });

  it("extracts JSON from fenced markdown", () => {
    expect(extractJson('Here you go:\n```json\n{"ok":true}\n```')).toEqual({ ok: true });
  });

  it("throws on empty input", () => {
    expect(() => extractJson("")).toThrow(AiServerError);
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
    expect(plan.weeks).toHaveLength(1);
    expect(plan.dailyPractices).toEqual(["2-minute pause"]);
  });
});

describe("parseCheckInSummary", () => {
  it("requires summary and guidance strings", () => {
    expect(parseCheckInSummary({ summary: "Solid day", guidance: "Rest early" })).toEqual({
      summary: "Solid day",
      guidance: "Rest early",
    });
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

  it("parses a nudges array", () => {
    const nudges = parseNudges([
      { tone: "celebration", message: "Day 7!" },
      { tone: "bogus", message: "Fallback tone" },
    ]);
    expect(nudges).toHaveLength(2);
    expect(nudges[0]?.tone).toBe("celebration");
    expect(nudges[1]?.tone).toBe("check_in");
  });
});

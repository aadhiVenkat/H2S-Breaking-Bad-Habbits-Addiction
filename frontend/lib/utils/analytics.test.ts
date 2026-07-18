import { describe, expect, it } from "vitest";
import { buildAnalyticsSummary } from "@/lib/utils/analytics";
import type { CravingEvent, DailyCheckIn, RelapseEvent } from "@/lib/types";

describe("buildAnalyticsSummary", () => {
  it("averages craving intensity and ranks triggers", () => {
    const now = new Date().toISOString();
    const cravingEvents: CravingEvent[] = [
      {
        id: "c1",
        timestamp: now,
        intensity: 8,
        trigger: "stress",
        resisted: true,
      },
      {
        id: "c2",
        timestamp: now,
        intensity: 4,
        trigger: "stress",
        resisted: false,
      },
      {
        id: "c3",
        timestamp: now,
        intensity: 6,
        trigger: "boredom",
        resisted: true,
      },
    ];

    const checkIns: DailyCheckIn[] = [
      {
        id: "d1",
        date: now.slice(0, 10),
        mood: 3,
        cravingIntensity: 5,
        difficulty: 2,
        triggers: ["social"],
        journal: "",
      },
    ];

    const summary = buildAnalyticsSummary(checkIns, cravingEvents, []);

    expect(summary.averageCraving7d).toBe(6);
    expect(summary.topTriggers[0]?.trigger).toBe("stress");
    expect(summary.topTriggers[0]?.count).toBe(2);
    expect(summary.checkInCompletionRate).toBeGreaterThan(0);
    expect(summary.cravingByDay).toHaveLength(14);
    expect(summary.moodTrend).toHaveLength(14);
  });

  it("builds relapse timeline in chronological order", () => {
    const relapseEvents: RelapseEvent[] = [
      {
        id: "r2",
        timestamp: "2026-07-15T12:00:00.000Z",
        intensityBefore: 7,
        trigger: "anxiety",
        reflection: "",
        whatHelped: "",
      },
      {
        id: "r1",
        timestamp: "2026-07-10T12:00:00.000Z",
        intensityBefore: 5,
        trigger: "fatigue",
        reflection: "",
        whatHelped: "",
      },
    ];

    const summary = buildAnalyticsSummary([], [], relapseEvents);
    expect(summary.relapseTimeline).toHaveLength(2);
    expect(summary.relapseTimeline[0]?.intensityBefore).toBe(5);
    expect(summary.relapseTimeline[1]?.intensityBefore).toBe(7);
  });
});

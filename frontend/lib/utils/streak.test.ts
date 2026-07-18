import { describe, expect, it } from "vitest";
import { computeStreak, nextMilestoneDay } from "@/lib/utils/streak";
import type { RelapseEvent } from "@/lib/types";

describe("computeStreak", () => {
  it("counts days from streak start with no relapses", () => {
    const stats = computeStreak("2026-07-10", []);
    expect(stats.streakStartDate).toBe("2026-07-10");
    expect(stats.lastRelapseDate).toBeNull();
    expect(stats.currentStreakDays).toBeGreaterThanOrEqual(0);
    expect(stats.longestStreakDays).toBeGreaterThanOrEqual(stats.currentStreakDays);
  });

  it("records the most recent relapse date", () => {
    const events: RelapseEvent[] = [
      {
        id: "r1",
        timestamp: "2026-07-12T10:00:00.000Z",
        intensityBefore: 6,
        trigger: "stress",
        reflection: "",
        whatHelped: "",
      },
      {
        id: "r2",
        timestamp: "2026-07-15T10:00:00.000Z",
        intensityBefore: 8,
        trigger: "boredom",
        reflection: "",
        whatHelped: "",
      },
    ];
    const stats = computeStreak("2026-07-01", events);
    expect(stats.lastRelapseDate).toBe("2026-07-15");
  });
});

describe("nextMilestoneDay", () => {
  it("returns the next milestone above current streak", () => {
    expect(nextMilestoneDay(3, [1, 3, 7, 14])).toBe(7);
  });

  it("returns null when all milestones are reached", () => {
    expect(nextMilestoneDay(30, [1, 7, 14, 30])).toBeNull();
  });
});

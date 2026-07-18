import { describe, expect, it } from "vitest";
import { appReducer } from "@/lib/store/reducer";
import { buildBlankState } from "@/lib/store/initialState";
import type { DailyCheckIn, ReplacementHabit } from "@/lib/types";

describe("appReducer", () => {
  it("replaces same-day check-ins instead of duplicating", () => {
    const state = buildBlankState();
    const first: DailyCheckIn = {
      id: "a",
      date: "2026-07-18",
      mood: 2,
      cravingIntensity: 4,
      difficulty: 3,
      triggers: ["stress"],
      journal: "morning",
    };
    const second: DailyCheckIn = {
      ...first,
      id: "b",
      mood: 4,
      journal: "evening",
    };

    const withFirst = appReducer(state, { type: "ADD_CHECK_IN", payload: first });
    const withSecond = appReducer(withFirst, { type: "ADD_CHECK_IN", payload: second });

    expect(withSecond.checkIns).toHaveLength(1);
    expect(withSecond.checkIns[0]?.id).toBe("b");
    expect(withSecond.checkIns[0]?.journal).toBe("evening");
  });

  it("increments replacement habit usage", () => {
    const habit: ReplacementHabit = {
      id: "rep-1",
      title: "Walk",
      description: "5 minute walk",
      linkedTriggers: ["stress"],
      timesUsed: 0,
      rating: null,
      savedByUser: true,
      aiGenerated: false,
    };
    const state = { ...buildBlankState(), replacementHabits: [habit] };
    const next = appReducer(state, { type: "USE_REPLACEMENT_HABIT", payload: { id: "rep-1" } });
    expect(next.replacementHabits[0]?.timesUsed).toBe(1);
  });

  it("resets to a blank hydrated state", () => {
    const next = appReducer(
      {
        ...buildBlankState(),
        checkIns: [
          {
            id: "x",
            date: "2026-07-01",
            mood: 1,
            cravingIntensity: 1,
            difficulty: 1,
            triggers: [],
            journal: "",
          },
        ],
      },
      { type: "RESET_LOCAL_DATA" },
    );
    expect(next.hydrated).toBe(true);
    expect(next.checkIns).toHaveLength(0);
    expect(next.profile).toBeNull();
  });
});

import { describe, expect, it } from "vitest";
import { appReducer } from "@/lib/store/reducer";
import { buildBlankState } from "@/lib/store/initialState";
import type { DailyCheckIn, RelapseEvent, ReplacementHabit, UserProfile } from "@/lib/types";

function profile(overrides: Partial<UserProfile> = {}): UserProfile {
  const habit = {
    id: "habit-1",
    habit: "doomscrolling" as const,
    habitLabel: "Doomscrolling",
    frequencyPerDay: 5,
    yearsActive: 1,
    intensity: 3 as const,
    triggers: ["stress" as const],
    peakTimes: ["evening" as const],
    motivation: "Focus",
    goal: "reduce" as const,
  };
  return {
    id: "user-1",
    name: "Ada",
    username: "ada",
    createdAt: "2026-07-01T00:00:00.000Z",
    onboarded: true,
    habit,
    habits: [habit],
    activeHabitId: habit.id,
    currentPlanId: null,
    ...overrides,
  };
}

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

  it("rates and toggles saved replacement habits", () => {
    const habit: ReplacementHabit = {
      id: "rep-1",
      title: "Walk",
      description: "5 minute walk",
      linkedTriggers: ["stress"],
      timesUsed: 0,
      rating: null,
      savedByUser: false,
      aiGenerated: true,
    };
    const state = { ...buildBlankState(), replacementHabits: [habit] };
    const rated = appReducer(state, { type: "RATE_REPLACEMENT_HABIT", payload: { id: "rep-1", rating: 4 } });
    expect(rated.replacementHabits[0]?.rating).toBe(4);

    const toggled = appReducer(rated, { type: "TOGGLE_REPLACEMENT_SAVED", payload: { id: "rep-1" } });
    expect(toggled.replacementHabits[0]?.savedByUser).toBe(true);
  });

  it("logs a relapse and resets streak start", () => {
    const relapse: RelapseEvent = {
      id: "r1",
      timestamp: "2026-07-18T12:00:00.000Z",
      intensityBefore: 7,
      trigger: "stress",
      reflection: "Tough afternoon",
      whatHelped: "Called a friend",
    };
    const state = {
      ...buildBlankState(),
      streak: {
        ...buildBlankState().streak,
        streakStartDate: "2026-07-01",
        currentStreakDays: 17,
      },
    };
    const next = appReducer(state, { type: "LOG_RELAPSE", payload: relapse });
    expect(next.relapseEvents).toHaveLength(1);
    expect(next.streak.lastRelapseDate).toBe("2026-07-18");
    expect(next.streak.streakStartDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it("updates user profile fields including geminiApiKey", () => {
    const state = { ...buildBlankState(), profile: profile({ geminiApiKey: "old-key" }) };
    const next = appReducer(state, {
      type: "UPDATE_USER_PROFILE",
      payload: { name: "Ada Lovelace", geminiApiKey: "new-gemini-key" },
    });
    expect(next.profile?.name).toBe("Ada Lovelace");
    expect(next.profile?.geminiApiKey).toBe("new-gemini-key");
  });

  it("updates habit profile without dropping other fields", () => {
    const state = { ...buildBlankState(), profile: profile() };
    const next = appReducer(state, {
      type: "UPDATE_PROFILE",
      payload: { goal: "quit", intensity: 5 },
    });
    expect(next.profile?.habit.goal).toBe("quit");
    expect(next.profile?.habit.intensity).toBe(5);
    expect(next.profile?.habit.habit).toBe("doomscrolling");
    expect(next.profile?.habits[0]?.goal).toBe("quit");
  });

  it("adds a second habit and switches active plan", () => {
    const firstPlan = {
      id: "plan-1",
      createdAt: "2026-07-01T00:00:00.000Z",
      habitId: "habit-1",
      habit: "doomscrolling" as const,
      goal: "reduce" as const,
      title: "Plan A",
      summary: "First",
      weeks: [],
      dailyPractices: [],
      milestoneDays: [],
    };
    const state = {
      ...buildBlankState(),
      profile: profile(),
      plan: firstPlan,
      plans: [firstPlan],
    };

    const secondHabit = {
      id: "habit-2",
      habit: "smoking" as const,
      habitLabel: "Smoking",
      frequencyPerDay: 10,
      yearsActive: 2,
      intensity: 4 as const,
      triggers: ["stress" as const],
      peakTimes: ["morning" as const],
      motivation: "Health",
      goal: "quit" as const,
    };
    const secondPlan = {
      id: "plan-2",
      createdAt: "2026-07-02T00:00:00.000Z",
      habitId: "habit-2",
      habit: "smoking" as const,
      goal: "quit" as const,
      title: "Plan B",
      summary: "Second",
      weeks: [],
      dailyPractices: [],
      milestoneDays: [],
    };

    const added = appReducer(state, {
      type: "ADD_HABIT",
      payload: { habit: secondHabit, plan: secondPlan, setActive: true },
    });
    expect(added.profile?.habits).toHaveLength(2);
    expect(added.profile?.activeHabitId).toBe("habit-2");
    expect(added.plan?.id).toBe("plan-2");

    const switched = appReducer(added, { type: "SET_ACTIVE_HABIT", payload: { habitId: "habit-1" } });
    expect(switched.profile?.habit.habit).toBe("doomscrolling");
    expect(switched.plan?.id).toBe("plan-1");
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

  it("prepends insights and appends craving events", () => {
    const state = buildBlankState();
    const withCraving = appReducer(state, {
      type: "LOG_CRAVING",
      payload: {
        id: "c1",
        timestamp: "2026-07-18T10:00:00.000Z",
        intensity: 6,
        trigger: "boredom",
        resisted: true,
      },
    });
    expect(withCraving.cravingEvents).toHaveLength(1);

    const withInsight = appReducer(withCraving, {
      type: "ADD_INSIGHT",
      payload: {
        id: "i1",
        createdAt: "2026-07-18T11:00:00.000Z",
        period: "weekly",
        headline: "Progress",
        reflection: "Steady week",
        suggestions: ["Keep logging"],
        trendDirection: "improving",
      },
    });
    expect(withInsight.insights[0]?.id).toBe("i1");
  });
});

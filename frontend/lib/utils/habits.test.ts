import { describe, expect, it } from "vitest";
import type { HabitProfile, UserProfile } from "@/lib/types";
import {
  changeHabitType,
  normalizeUserProfile,
  removeHabitFromProfile,
  upsertHabitInProfile,
  withActiveHabit,
} from "@/lib/utils/habits";

function habit(partial: Partial<HabitProfile> & Pick<HabitProfile, "id" | "habit">): HabitProfile {
  return {
    habitLabel: partial.habit,
    frequencyPerDay: 3,
    yearsActive: 1,
    intensity: 3,
    triggers: ["stress"],
    peakTimes: ["evening"],
    motivation: "Focus",
    goal: "quit",
    ...partial,
  };
}

function baseProfile(habits: HabitProfile[]): UserProfile {
  const active = habits[0]!;
  return {
    id: "u1",
    name: "Ada",
    createdAt: "2026-01-01T00:00:00.000Z",
    onboarded: true,
    habit: active,
    habits,
    activeHabitId: active.id,
    currentPlanId: null,
  };
}

describe("normalizeUserProfile", () => {
  it("backfills habits[] from a legacy single habit", () => {
    const legacy = {
      id: "u1",
      name: "Ada",
      createdAt: "2026-01-01T00:00:00.000Z",
      onboarded: true,
      habit: habit({ id: "", habit: "smoking" }),
      currentPlanId: null,
    } as UserProfile;

    const next = normalizeUserProfile(legacy);
    expect(next.habits).toHaveLength(1);
    expect(next.habits[0]?.habit).toBe("smoking");
    expect(next.activeHabitId).toBe(next.habits[0]?.id);
    expect(next.habit.id).toBe(next.activeHabitId);
  });
});

describe("withActiveHabit / upsert / remove", () => {
  it("switches the active habit", () => {
    const a = habit({ id: "h1", habit: "smoking" });
    const b = habit({ id: "h2", habit: "vaping" });
    const next = withActiveHabit(baseProfile([a, b]), "h2");
    expect(next.activeHabitId).toBe("h2");
    expect(next.habit.habit).toBe("vaping");
  });

  it("adds a habit and makes it active", () => {
    const a = habit({ id: "h1", habit: "smoking" });
    const b = habit({ id: "h2", habit: "alcohol" });
    const next = upsertHabitInProfile(baseProfile([a]), b);
    expect(next.habits).toHaveLength(2);
    expect(next.activeHabitId).toBe("h2");
  });

  it("removes a habit and keeps another active", () => {
    const a = habit({ id: "h1", habit: "smoking" });
    const b = habit({ id: "h2", habit: "vaping" });
    const next = removeHabitFromProfile(withActiveHabit(baseProfile([a, b]), "h2"), "h2");
    expect(next?.habits).toHaveLength(1);
    expect(next?.activeHabitId).toBe("h1");
  });

  it("refuses to remove the last habit", () => {
    const a = habit({ id: "h1", habit: "smoking" });
    expect(removeHabitFromProfile(baseProfile([a]), "h1")).toBeNull();
  });
});

describe("changeHabitType", () => {
  it("updates type and label", () => {
    const next = changeHabitType(habit({ id: "h1", habit: "smoking" }), "alcohol");
    expect(next.habit).toBe("alcohol");
    expect(next.habitLabel.toLowerCase()).toContain("alcohol");
  });
});

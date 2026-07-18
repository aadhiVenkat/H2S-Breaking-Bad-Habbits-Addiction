import type { AppState } from "@/lib/types";
import { isoDate } from "@/lib/utils/dates";
import { buildMilestones } from "@/lib/mock-data/milestones";

export function buildBlankState(): AppState {
  return {
    profile: null,
    assessment: null,
    plan: null,
    checkIns: [],
    cravingEvents: [],
    relapseEvents: [],
    streak: {
      currentStreakDays: 0,
      longestStreakDays: 0,
      totalCleanDays: 0,
      lastRelapseDate: null,
      streakStartDate: isoDate(),
    },
    nudges: [],
    replacementHabits: [],
    chatHistory: [],
    insights: [],
    milestones: buildMilestones(0),
    emergencyLogs: [],
    hydrated: false,
  };
}

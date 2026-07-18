import type {
  AppState,
  ChatMessage,
  CravingEvent,
  DailyCheckIn,
  EmergencySessionLog,
  HabitProfile,
  Nudge,
  AIInsight,
  OnboardingAssessment,
  RecoveryPlan,
  RelapseEvent,
  ReplacementHabit,
  UserProfile,
} from "@/lib/types";
import { buildBlankState } from "@/lib/store/initialState";
import { buildMilestones } from "@/lib/mock-data/milestones";
import { computeStreak } from "@/lib/utils/streak";
import { isoDate } from "@/lib/utils/dates";
import {
  normalizeUserProfile,
  planForHabit,
  removeHabitFromProfile,
  upsertHabitInProfile,
  upsertPlan,
  withActiveHabit,
} from "@/lib/utils/habits";

export type AppAction =
  | { type: "HYDRATE"; payload: AppState }
  | { type: "RESET_LOCAL_DATA" }
  | { type: "LOAD_DEMO_DATA"; payload: AppState }
  | { type: "COMPLETE_ONBOARDING"; payload: { assessment: OnboardingAssessment; profile: UserProfile; plan: RecoveryPlan } }
  | { type: "ADD_CHECK_IN"; payload: DailyCheckIn }
  | { type: "LOG_CRAVING"; payload: CravingEvent }
  | { type: "LOG_RELAPSE"; payload: RelapseEvent }
  | { type: "ADD_CHAT_MESSAGE"; payload: ChatMessage }
  | { type: "SET_CHAT_HISTORY"; payload: ChatMessage[] }
  | { type: "SET_NUDGES"; payload: Nudge[] }
  | { type: "ADD_INSIGHT"; payload: AIInsight }
  | { type: "SAVE_REPLACEMENT_HABIT"; payload: ReplacementHabit }
  | { type: "RATE_REPLACEMENT_HABIT"; payload: { id: string; rating: number } }
  | { type: "USE_REPLACEMENT_HABIT"; payload: { id: string } }
  | { type: "TOGGLE_REPLACEMENT_SAVED"; payload: { id: string } }
  | { type: "UPDATE_PROFILE"; payload: Partial<UserProfile["habit"]> }
  | { type: "UPDATE_USER_PROFILE"; payload: Partial<Pick<UserProfile, "name" | "username" | "geminiApiKey">> }
  | { type: "UPDATE_PLAN"; payload: RecoveryPlan }
  | { type: "ADD_HABIT"; payload: { habit: HabitProfile; plan: RecoveryPlan; setActive?: boolean } }
  | { type: "SET_ACTIVE_HABIT"; payload: { habitId: string } }
  | { type: "UPDATE_HABIT"; payload: HabitProfile }
  | { type: "REMOVE_HABIT"; payload: { habitId: string } }
  | { type: "LOG_EMERGENCY_SESSION"; payload: EmergencySessionLog };

function recomputeDerived(state: AppState): AppState {
  const streak = computeStreak(state.streak.streakStartDate, state.relapseEvents);
  const milestones = buildMilestones(streak.currentStreakDays).map((m) => {
    const existing = state.milestones.find((em) => em.id === m.id);
    return {
      ...m,
      unlockedAt: m.unlocked ? existing?.unlockedAt ?? new Date().toISOString() : undefined,
    };
  });
  return { ...state, streak, milestones };
}

export function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case "HYDRATE":
      return { ...action.payload, hydrated: true };

    case "RESET_LOCAL_DATA":
      return { ...buildBlankState(), hydrated: true };

    case "LOAD_DEMO_DATA":
      return { ...action.payload, hydrated: true };

    case "COMPLETE_ONBOARDING": {
      const { assessment, profile, plan } = action.payload;
      const normalized = normalizeUserProfile(profile);
      const linkedPlan = { ...plan, habitId: plan.habitId ?? normalized.activeHabitId };
      return recomputeDerived({
        ...state,
        assessment,
        profile: { ...normalized, currentPlanId: linkedPlan.id },
        plan: linkedPlan,
        plans: upsertPlan(state.plans, linkedPlan),
        streak: {
          currentStreakDays: 0,
          longestStreakDays: state.streak.longestStreakDays,
          totalCleanDays: state.streak.totalCleanDays,
          lastRelapseDate: state.streak.lastRelapseDate,
          streakStartDate: isoDate(),
        },
        hydrated: true,
      });
    }

    case "ADD_CHECK_IN": {
      const withoutSameDay = state.checkIns.filter((c) => c.date !== action.payload.date);
      return { ...state, checkIns: [...withoutSameDay, action.payload].sort((a, b) => (a.date > b.date ? 1 : -1)) };
    }

    case "LOG_CRAVING":
      return { ...state, cravingEvents: [...state.cravingEvents, action.payload] };

    case "LOG_RELAPSE": {
      const relapseEvents = [...state.relapseEvents, action.payload];
      return recomputeDerived({
        ...state,
        relapseEvents,
        streak: { ...state.streak, streakStartDate: isoDate() },
      });
    }

    case "ADD_CHAT_MESSAGE":
      return { ...state, chatHistory: [...state.chatHistory, action.payload] };

    case "SET_CHAT_HISTORY":
      return { ...state, chatHistory: action.payload };

    case "SET_NUDGES":
      return { ...state, nudges: action.payload };

    case "ADD_INSIGHT":
      return { ...state, insights: [action.payload, ...state.insights] };

    case "SAVE_REPLACEMENT_HABIT":
      return { ...state, replacementHabits: [action.payload, ...state.replacementHabits] };

    case "RATE_REPLACEMENT_HABIT":
      return {
        ...state,
        replacementHabits: state.replacementHabits.map((r) =>
          r.id === action.payload.id ? { ...r, rating: action.payload.rating } : r,
        ),
      };

    case "USE_REPLACEMENT_HABIT":
      return {
        ...state,
        replacementHabits: state.replacementHabits.map((r) =>
          r.id === action.payload.id ? { ...r, timesUsed: r.timesUsed + 1 } : r,
        ),
      };

    case "TOGGLE_REPLACEMENT_SAVED":
      return {
        ...state,
        replacementHabits: state.replacementHabits.map((r) =>
          r.id === action.payload.id ? { ...r, savedByUser: !r.savedByUser } : r,
        ),
      };

    case "UPDATE_PROFILE":
      if (!state.profile) return state;
      {
        const nextHabit = { ...state.profile.habit, ...action.payload };
        const profile = upsertHabitInProfile(state.profile, nextHabit);
        return { ...state, profile };
      }

    case "UPDATE_USER_PROFILE":
      return state.profile ? { ...state, profile: { ...state.profile, ...action.payload } } : state;

    case "UPDATE_PLAN": {
      const linked = {
        ...action.payload,
        habitId: action.payload.habitId ?? state.profile?.activeHabitId,
      };
      return {
        ...state,
        plan: linked,
        plans: upsertPlan(state.plans, linked),
        profile: state.profile ? { ...state.profile, currentPlanId: linked.id } : state.profile,
      };
    }

    case "ADD_HABIT": {
      if (!state.profile) return state;
      const setActive = action.payload.setActive !== false;
      let profile = upsertHabitInProfile(state.profile, action.payload.habit);
      if (setActive) {
        profile = withActiveHabit(profile, action.payload.habit.id);
      }
      const linkedPlan = {
        ...action.payload.plan,
        habitId: action.payload.plan.habitId ?? action.payload.habit.id,
      };
      const plans = upsertPlan(state.plans, linkedPlan);
      const plan = setActive ? linkedPlan : state.plan;
      return {
        ...state,
        profile: setActive ? { ...profile, currentPlanId: linkedPlan.id } : profile,
        plans,
        plan,
      };
    }

    case "SET_ACTIVE_HABIT": {
      if (!state.profile) return state;
      const profile = withActiveHabit(state.profile, action.payload.habitId);
      const plan = planForHabit(state.plans, profile.activeHabitId) ?? state.plan;
      return {
        ...state,
        profile: { ...profile, currentPlanId: plan?.id ?? profile.currentPlanId },
        plan,
      };
    }

    case "UPDATE_HABIT": {
      if (!state.profile) return state;
      return { ...state, profile: upsertHabitInProfile(state.profile, action.payload) };
    }

    case "REMOVE_HABIT": {
      if (!state.profile) return state;
      const nextProfile = removeHabitFromProfile(state.profile, action.payload.habitId);
      if (!nextProfile) return state;
      const plans = state.plans.filter((p) => p.habitId !== action.payload.habitId);
      const plan = planForHabit(plans, nextProfile.activeHabitId) ?? plans[0] ?? null;
      return {
        ...state,
        profile: { ...nextProfile, currentPlanId: plan?.id ?? null },
        plans,
        plan,
      };
    }

    case "LOG_EMERGENCY_SESSION":
      return { ...state, emergencyLogs: [...state.emergencyLogs, action.payload] };

    default:
      return state;
  }
}

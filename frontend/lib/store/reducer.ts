import type {
  AppState,
  ChatMessage,
  CravingEvent,
  DailyCheckIn,
  EmergencySessionLog,
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
      return recomputeDerived({
        ...state,
        assessment,
        profile,
        plan,
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
      return state.profile
        ? { ...state, profile: { ...state.profile, habit: { ...state.profile.habit, ...action.payload } } }
        : state;

    case "UPDATE_USER_PROFILE":
      return state.profile ? { ...state, profile: { ...state.profile, ...action.payload } } : state;

    case "UPDATE_PLAN":
      return { ...state, plan: action.payload };

    case "LOG_EMERGENCY_SESSION":
      return { ...state, emergencyLogs: [...state.emergencyLogs, action.payload] };

    default:
      return state;
  }
}

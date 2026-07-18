"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  type ReactNode,
} from "react";
import type {
  AIInsight,
  AppState,
  ChatMessage,
  CravingEvent,
  DailyCheckIn,
  EmergencySessionLog,
  Nudge,
  OnboardingAssessment,
  RecoveryPlan,
  RelapseEvent,
  ReplacementHabit,
  UserProfile,
} from "@/lib/types";
import { appReducer } from "@/lib/store/reducer";
import { buildBlankState } from "@/lib/store/initialState";
import { loadPersistedState, persistState, clearPersistedState } from "@/lib/store/persistence";
import { useAuth } from "@/lib/auth/AuthContext";

interface AppContextValue {
  state: AppState;
  /** Clears this user's localStorage app state and returns to a blank state. */
  resetLocalData: () => void;
  completeOnboarding: (assessment: OnboardingAssessment, profile: UserProfile, plan: RecoveryPlan) => void;
  addCheckIn: (checkIn: DailyCheckIn) => void;
  logCraving: (event: CravingEvent) => void;
  logRelapse: (event: RelapseEvent) => void;
  addChatMessage: (message: ChatMessage) => void;
  setChatHistory: (messages: ChatMessage[]) => void;
  setNudges: (nudges: Nudge[]) => void;
  addInsight: (insight: AIInsight) => void;
  saveReplacementHabit: (habit: ReplacementHabit) => void;
  rateReplacementHabit: (id: string, rating: number) => void;
  useReplacementHabit: (id: string) => void;
  toggleReplacementSaved: (id: string) => void;
  updateProfile: (patch: Partial<UserProfile["habit"]>) => void;
  updateUserProfile: (patch: Partial<Pick<UserProfile, "name" | "username" | "geminiApiKey">>) => void;
  updatePlan: (plan: RecoveryPlan) => void;
  logEmergencySession: (log: EmergencySessionLog) => void;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const { ready: authReady, session } = useAuth();
  const userId = session?.userId ?? null;
  const [state, dispatch] = useReducer(appReducer, buildBlankState());

  useEffect(() => {
    if (!authReady) return;

    if (!userId) {
      dispatch({ type: "HYDRATE", payload: buildBlankState() });
      return;
    }

    const persisted = loadPersistedState(userId);
    dispatch({
      type: "HYDRATE",
      payload: persisted ?? buildBlankState(),
    });
  }, [authReady, userId]);

  useEffect(() => {
    if (authReady && userId && state.hydrated) {
      persistState(userId, state);
    }
  }, [authReady, userId, state]);

  const resetLocalData = useCallback(() => {
    clearPersistedState(userId);
    dispatch({ type: "RESET_LOCAL_DATA" });
  }, [userId]);

  const completeOnboarding = useCallback(
    (assessment: OnboardingAssessment, profile: UserProfile, plan: RecoveryPlan) =>
      dispatch({ type: "COMPLETE_ONBOARDING", payload: { assessment, profile, plan } }),
    [],
  );
  const addCheckIn = useCallback((checkIn: DailyCheckIn) => dispatch({ type: "ADD_CHECK_IN", payload: checkIn }), []);
  const logCraving = useCallback((event: CravingEvent) => dispatch({ type: "LOG_CRAVING", payload: event }), []);
  const logRelapse = useCallback((event: RelapseEvent) => dispatch({ type: "LOG_RELAPSE", payload: event }), []);
  const addChatMessage = useCallback((message: ChatMessage) => dispatch({ type: "ADD_CHAT_MESSAGE", payload: message }), []);
  const setChatHistory = useCallback((messages: ChatMessage[]) => dispatch({ type: "SET_CHAT_HISTORY", payload: messages }), []);
  const setNudges = useCallback((nudges: Nudge[]) => dispatch({ type: "SET_NUDGES", payload: nudges }), []);
  const addInsight = useCallback((insight: AIInsight) => dispatch({ type: "ADD_INSIGHT", payload: insight }), []);
  const saveReplacementHabit = useCallback(
    (habit: ReplacementHabit) => dispatch({ type: "SAVE_REPLACEMENT_HABIT", payload: habit }),
    [],
  );
  const rateReplacementHabit = useCallback(
    (id: string, rating: number) => dispatch({ type: "RATE_REPLACEMENT_HABIT", payload: { id, rating } }),
    [],
  );
  const useReplacementHabit = useCallback((id: string) => dispatch({ type: "USE_REPLACEMENT_HABIT", payload: { id } }), []);
  const toggleReplacementSaved = useCallback(
    (id: string) => dispatch({ type: "TOGGLE_REPLACEMENT_SAVED", payload: { id } }),
    [],
  );
  const updateProfile = useCallback(
    (patch: Partial<UserProfile["habit"]>) => dispatch({ type: "UPDATE_PROFILE", payload: patch }),
    [],
  );
  const updateUserProfile = useCallback(
    (patch: Partial<Pick<UserProfile, "name" | "username" | "geminiApiKey">>) =>
      dispatch({ type: "UPDATE_USER_PROFILE", payload: patch }),
    [],
  );
  const updatePlan = useCallback((plan: RecoveryPlan) => dispatch({ type: "UPDATE_PLAN", payload: plan }), []);
  const logEmergencySession = useCallback(
    (log: EmergencySessionLog) => dispatch({ type: "LOG_EMERGENCY_SESSION", payload: log }),
    [],
  );

  const value = useMemo<AppContextValue>(
    () => ({
      state,
      resetLocalData,
      completeOnboarding,
      addCheckIn,
      logCraving,
      logRelapse,
      addChatMessage,
      setChatHistory,
      setNudges,
      addInsight,
      saveReplacementHabit,
      rateReplacementHabit,
      useReplacementHabit,
      toggleReplacementSaved,
      updateProfile,
      updateUserProfile,
      updatePlan,
      logEmergencySession,
    }),
    [
      state,
      resetLocalData,
      completeOnboarding,
      addCheckIn,
      logCraving,
      logRelapse,
      addChatMessage,
      setChatHistory,
      setNudges,
      addInsight,
      saveReplacementHabit,
      rateReplacementHabit,
      useReplacementHabit,
      toggleReplacementSaved,
      updateProfile,
      updateUserProfile,
      updatePlan,
      logEmergencySession,
    ],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within an AppProvider");
  return ctx;
}

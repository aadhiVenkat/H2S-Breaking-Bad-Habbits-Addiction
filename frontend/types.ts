/**
 * Core domain types for Reclaim AI.
 * Shared contract between the Express AI API and the React (Next.js) client.
 */

export type HabitType =
  | "doomscrolling"
  | "smoking"
  | "vaping"
  | "nicotine"
  | "alcohol"
  | "junk_food"
  | "gambling"
  | "procrastination"
  | "nail_biting"
  | "other";

export type RecoveryGoal = "quit" | "reduce" | "replace";

export type TriggerCategory =
  | "stress"
  | "boredom"
  | "social"
  | "loneliness"
  | "anxiety"
  | "fatigue"
  | "celebration"
  | "habit_cue"
  | "conflict"
  | "night_routine";

export type TimeOfDay = "early_morning" | "morning" | "afternoon" | "evening" | "night" | "late_night";

export type MoodLevel = 1 | 2 | 3 | 4 | 5;

export interface HabitProfile {
  /** Stable id so users can track multiple habits and switch the active one. */
  id: string;
  habit: HabitType;
  habitLabel: string;
  frequencyPerDay: number;
  yearsActive: number;
  intensity: 1 | 2 | 3 | 4 | 5;
  triggers: TriggerCategory[];
  peakTimes: TimeOfDay[];
  motivation: string;
  goal: RecoveryGoal;
}

export interface OnboardingAssessment extends Omit<HabitProfile, "id"> {
  name: string;
  emotionalState: string;
  previousAttempts: number;
  supportSystem: "strong" | "some" | "none";
}

export interface UserProfile {
  id: string;
  name: string;
  /** Matches the local auth account username when signed in. */
  username?: string;
  /** Required per-user Google Gemini key (BYOK); also stored on the auth account. */
  geminiApiKey?: string;
  createdAt: string;
  onboarded: boolean;
  /** Currently focused habit (mirrors the entry in `habits` with `activeHabitId`). */
  habit: HabitProfile;
  /** All habits this user is working on. */
  habits: HabitProfile[];
  /** Id of the habit currently driving coach, dashboard, and plan. */
  activeHabitId: string;
  currentPlanId: string | null;
}

export interface PlanWeek {
  weekNumber: number;
  focus: string;
  actions: string[];
}

export interface RecoveryPlan {
  id: string;
  createdAt: string;
  /** Links this plan to a specific HabitProfile when multi-habit is in use. */
  habitId?: string;
  habit: HabitType;
  goal: RecoveryGoal;
  title: string;
  summary: string;
  weeks: PlanWeek[];
  dailyPractices: string[];
  milestoneDays: number[];
}

export interface DailyCheckIn {
  id: string;
  date: string;
  mood: MoodLevel;
  cravingIntensity: number;
  triggers: TriggerCategory[];
  difficulty: 1 | 2 | 3 | 4 | 5;
  journal: string;
  aiSummary?: string;
  aiGuidance?: string;
}

export interface CravingEvent {
  id: string;
  timestamp: string;
  intensity: number;
  trigger: TriggerCategory;
  resisted: boolean;
  note?: string;
}

export interface RelapseEvent {
  id: string;
  timestamp: string;
  trigger: TriggerCategory;
  intensityBefore: number;
  reflection: string;
  whatHelped: string;
  aiGuidance?: string;
  updatedPlanNote?: string;
}

export interface StreakStats {
  currentStreakDays: number;
  longestStreakDays: number;
  totalCleanDays: number;
  lastRelapseDate: string | null;
  streakStartDate: string;
}

export type NudgeTone = "encouragement" | "check_in" | "milestone" | "trigger_alert" | "celebration";

export interface Nudge {
  id: string;
  createdAt: string;
  tone: NudgeTone;
  message: string;
  actionLabel?: string;
  actionHref?: string;
}

export interface ReplacementHabit {
  id: string;
  title: string;
  description: string;
  linkedTriggers: TriggerCategory[];
  timesUsed: number;
  rating: number | null;
  savedByUser: boolean;
  aiGenerated: boolean;
}

export type ChatRole = "user" | "assistant";

export interface ChatMessage {
  id: string;
  role: ChatRole;
  content: string;
  timestamp: string;
  intent?: ChatIntent;
}

export type ChatIntent = "craving" | "relapse" | "motivation" | "general" | "gratitude" | "progress";

export interface AIInsight {
  id: string;
  createdAt: string;
  period: "weekly" | "monthly";
  headline: string;
  reflection: string;
  suggestions: string[];
  trendDirection: "improving" | "steady" | "needs_support";
}

export interface Milestone {
  id: string;
  days: number;
  label: string;
  description: string;
  unlocked: boolean;
  unlockedAt?: string;
}

export interface EmergencySessionLog {
  id: string;
  timestamp: string;
  toolUsed: "breathing" | "delay" | "grounding" | "distraction" | "journal" | "coach";
  cravingIntensityBefore: number;
  cravingIntensityAfter?: number;
  note?: string;
}

export interface AppState {
  profile: UserProfile | null;
  assessment: OnboardingAssessment | null;
  /** Plan for the currently active habit. */
  plan: RecoveryPlan | null;
  /** Plans for every tracked habit (active plan is also referenced by `plan`). */
  plans: RecoveryPlan[];
  checkIns: DailyCheckIn[];
  cravingEvents: CravingEvent[];
  relapseEvents: RelapseEvent[];
  streak: StreakStats;
  nudges: Nudge[];
  replacementHabits: ReplacementHabit[];
  chatHistory: ChatMessage[];
  insights: AIInsight[];
  milestones: Milestone[];
  emergencyLogs: EmergencySessionLog[];
  hydrated: boolean;
}

export interface AnalyticsSummary {
  averageCraving7d: number;
  averageCraving30d: number;
  topTriggers: { trigger: TriggerCategory; count: number }[];
  cravingByDay: { date: string; intensity: number; resisted: number }[];
  checkInCompletionRate: number;
  moodTrend: { date: string; mood: number }[];
  relapseTimeline: { date: string; intensityBefore: number }[];
}

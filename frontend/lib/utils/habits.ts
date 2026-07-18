import type { HabitProfile, HabitType, OnboardingAssessment, RecoveryPlan, UserProfile } from "@/lib/types";
import { habitLabel } from "@/lib/utils/labels";

export function newHabitId(): string {
  return `habit-${crypto.randomUUID()}`;
}

export function habitFromAssessment(assessment: OnboardingAssessment, id = newHabitId()): HabitProfile {
  return {
    id,
    habit: assessment.habit,
    habitLabel: assessment.habitLabel || habitLabel(assessment.habit),
    frequencyPerDay: assessment.frequencyPerDay,
    yearsActive: assessment.yearsActive,
    intensity: assessment.intensity,
    triggers: assessment.triggers,
    peakTimes: assessment.peakTimes,
    motivation: assessment.motivation,
    goal: assessment.goal,
  };
}

/** Ensure legacy profiles (single habit, no habits[]) work with multi-habit fields. */
export function normalizeUserProfile(profile: UserProfile): UserProfile {
  const existing = profile.habits?.length
    ? profile.habits.map((h) => ({ ...h, id: h.id || newHabitId() }))
    : [
        {
          ...profile.habit,
          id: profile.habit?.id || newHabitId(),
          habitLabel: profile.habit?.habitLabel || habitLabel(profile.habit.habit),
        },
      ];

  const activeHabitId =
    (profile.activeHabitId && existing.some((h) => h.id === profile.activeHabitId)
      ? profile.activeHabitId
      : existing[0]?.id) ?? newHabitId();

  const active = existing.find((h) => h.id === activeHabitId) ?? existing[0]!;

  return {
    ...profile,
    habits: existing,
    activeHabitId: active.id,
    habit: active,
  };
}

export function withActiveHabit(profile: UserProfile, habitId: string): UserProfile {
  const normalized = normalizeUserProfile(profile);
  const active = normalized.habits.find((h) => h.id === habitId);
  if (!active) return normalized;
  return {
    ...normalized,
    activeHabitId: active.id,
    habit: active,
  };
}

export function upsertHabitInProfile(profile: UserProfile, habit: HabitProfile): UserProfile {
  const normalized = normalizeUserProfile(profile);
  const exists = normalized.habits.some((h) => h.id === habit.id);
  const habits = exists
    ? normalized.habits.map((h) => (h.id === habit.id ? habit : h))
    : [...normalized.habits, habit];
  const activeId = exists ? normalized.activeHabitId : habit.id;
  const active = habits.find((h) => h.id === activeId) ?? habit;
  return {
    ...normalized,
    habits,
    activeHabitId: active.id,
    habit: active,
  };
}

export function removeHabitFromProfile(profile: UserProfile, habitId: string): UserProfile | null {
  const normalized = normalizeUserProfile(profile);
  if (normalized.habits.length <= 1) return null;
  const habits = normalized.habits.filter((h) => h.id !== habitId);
  const active =
    habits.find((h) => h.id === normalized.activeHabitId) ?? habits[0]!;
  return {
    ...normalized,
    habits,
    activeHabitId: active.id,
    habit: active,
  };
}

export function changeHabitType(habit: HabitProfile, nextType: HabitType, customLabel?: string): HabitProfile {
  return {
    ...habit,
    habit: nextType,
    habitLabel: customLabel?.trim() || habitLabel(nextType),
  };
}

export function planForHabit(plans: RecoveryPlan[], habitId: string): RecoveryPlan | null {
  return plans.find((p) => p.habitId === habitId) ?? null;
}

export function upsertPlan(plans: RecoveryPlan[], plan: RecoveryPlan): RecoveryPlan[] {
  if (!plan.habitId) return [plan, ...plans.filter((p) => p.id !== plan.id)];
  const without = plans.filter((p) => p.habitId !== plan.habitId && p.id !== plan.id);
  return [plan, ...without];
}

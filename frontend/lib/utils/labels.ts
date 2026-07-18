import type { HabitType, TriggerCategory, TimeOfDay, RecoveryGoal } from "@/lib/types";

export const HABIT_LABELS: Record<HabitType, string> = {
  doomscrolling: "Doomscrolling",
  smoking: "Smoking",
  vaping: "Vaping",
  nicotine: "Nicotine",
  alcohol: "Alcohol",
  junk_food: "Junk food",
  gambling: "Gambling",
  procrastination: "Procrastination",
  nail_biting: "Nail biting",
  other: "This habit",
};

export const TRIGGER_LABELS: Record<TriggerCategory, string> = {
  stress: "Stress",
  boredom: "Boredom",
  social: "Social settings",
  loneliness: "Loneliness",
  anxiety: "Anxiety",
  fatigue: "Fatigue",
  celebration: "Celebration",
  habit_cue: "Habit cue / routine",
  conflict: "Conflict",
  night_routine: "Night routine",
};

export const TIME_OF_DAY_LABELS: Record<TimeOfDay, string> = {
  early_morning: "Early morning",
  morning: "Morning",
  afternoon: "Afternoon",
  evening: "Evening",
  night: "Night",
  late_night: "Late night",
};

export const GOAL_LABELS: Record<RecoveryGoal, string> = {
  quit: "Quit completely",
  reduce: "Reduce gradually",
  replace: "Replace with something better",
};

export function habitLabel(habit: HabitType): string {
  return HABIT_LABELS[habit] ?? "This habit";
}

export function triggerLabel(trigger: TriggerCategory): string {
  return TRIGGER_LABELS[trigger] ?? trigger;
}

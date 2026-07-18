import type { HabitType, RecoveryGoal, TimeOfDay, TriggerCategory } from "@/lib/types";
import { GOAL_LABELS, HABIT_LABELS, TIME_OF_DAY_LABELS, TRIGGER_LABELS } from "@/lib/utils/labels";

export const HABIT_OPTIONS: { value: HabitType; label: string; emoji: string }[] = [
  { value: "doomscrolling", label: HABIT_LABELS.doomscrolling, emoji: "📱" },
  { value: "smoking", label: HABIT_LABELS.smoking, emoji: "🚬" },
  { value: "vaping", label: HABIT_LABELS.vaping, emoji: "💨" },
  { value: "nicotine", label: HABIT_LABELS.nicotine, emoji: "🚭" },
  { value: "alcohol", label: HABIT_LABELS.alcohol, emoji: "🍷" },
  { value: "junk_food", label: HABIT_LABELS.junk_food, emoji: "🍔" },
  { value: "gambling", label: HABIT_LABELS.gambling, emoji: "🎰" },
  { value: "procrastination", label: HABIT_LABELS.procrastination, emoji: "⏳" },
  { value: "nail_biting", label: HABIT_LABELS.nail_biting, emoji: "💅" },
  { value: "other", label: "Something else", emoji: "✨" },
];

export const TRIGGER_OPTIONS: { value: TriggerCategory; label: string }[] = Object.entries(TRIGGER_LABELS).map(
  ([value, label]) => ({ value: value as TriggerCategory, label }),
);

export const TIME_OPTIONS: { value: TimeOfDay; label: string }[] = Object.entries(TIME_OF_DAY_LABELS).map(
  ([value, label]) => ({ value: value as TimeOfDay, label }),
);

export const GOAL_OPTIONS: { value: RecoveryGoal; label: string; description: string }[] = [
  { value: "quit", label: GOAL_LABELS.quit, description: "I want to stop entirely, as soon as I reasonably can." },
  { value: "reduce", label: GOAL_LABELS.reduce, description: "I want to cut back gradually and sustainably." },
  { value: "replace", label: GOAL_LABELS.replace, description: "I want to swap this habit for something healthier." },
];

export const SUPPORT_OPTIONS: { value: "strong" | "some" | "none"; label: string }[] = [
  { value: "strong", label: "Yes, people I can lean on" },
  { value: "some", label: "A little, but not much" },
  { value: "none", label: "Not really, I'm doing this alone" },
];

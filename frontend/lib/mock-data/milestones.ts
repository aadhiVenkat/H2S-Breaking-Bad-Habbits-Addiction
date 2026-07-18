import type { Milestone } from "@/lib/types";

export const MILESTONE_TEMPLATES: Omit<Milestone, "unlocked" | "unlockedAt">[] = [
  { id: "m1", days: 1, label: "Day One", description: "You made it through the first 24 hours. That's the hardest step." },
  { id: "m3", days: 3, label: "72 Hours", description: "The initial physical pull is easing. Your body is adjusting." },
  { id: "m7", days: 7, label: "One Week", description: "A full week of choosing yourself, one moment at a time." },
  { id: "m14", days: 14, label: "Two Weeks", description: "New neural pathways are forming. This is real progress." },
  { id: "m21", days: 21, label: "Three Weeks", description: "Habits are starting to loosen their grip. Keep going." },
  { id: "m30", days: 30, label: "One Month", description: "30 days of showing up for yourself. This is a real transformation." },
  { id: "m45", days: 45, label: "45 Days", description: "You're building a new identity, one day at a time." },
  { id: "m60", days: 60, label: "Two Months", description: "This is no longer a streak — it's becoming who you are." },
  { id: "m90", days: 90, label: "90 Days", description: "A full season of growth. You should be proud of this." },
];

export function buildMilestones(currentStreakDays: number): Milestone[] {
  return MILESTONE_TEMPLATES.map((template) => ({
    ...template,
    unlocked: currentStreakDays >= template.days,
    unlockedAt: currentStreakDays >= template.days ? undefined : undefined,
  }));
}

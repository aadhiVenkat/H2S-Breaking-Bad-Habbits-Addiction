import type { RelapseEvent, StreakStats } from "@/lib/types";
import { daysBetween, isoDate } from "@/lib/utils/dates";

export function computeStreak(streakStartDate: string, relapseEvents: RelapseEvent[]): StreakStats {
  const sorted = [...relapseEvents].sort((a, b) => (a.timestamp > b.timestamp ? -1 : 1));
  const lastRelapse = sorted[0] ?? null;
  const today = isoDate();

  const currentStreakDays = Math.max(0, daysBetween(streakStartDate, today));

  let longestStreakDays = currentStreakDays;
  if (sorted.length > 0) {
    const spans: number[] = [];
    let previousStart = streakStartDate;
    for (const relapse of [...sorted].reverse()) {
      const relapseDate = isoDate(new Date(relapse.timestamp));
      spans.push(Math.max(0, daysBetween(previousStart, relapseDate)));
      previousStart = relapseDate;
    }
    spans.push(currentStreakDays);
    longestStreakDays = Math.max(...spans, currentStreakDays);
  }

  const totalCleanDays = Math.max(currentStreakDays, longestStreakDays);

  return {
    currentStreakDays,
    longestStreakDays,
    totalCleanDays,
    lastRelapseDate: lastRelapse ? isoDate(new Date(lastRelapse.timestamp)) : null,
    streakStartDate,
  };
}

export function nextMilestoneDay(currentStreak: number, milestoneDays: number[]): number | null {
  const sorted = [...milestoneDays].sort((a, b) => a - b);
  return sorted.find((d) => d > currentStreak) ?? null;
}

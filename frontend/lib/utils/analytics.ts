import type { AnalyticsSummary, CravingEvent, DailyCheckIn, RelapseEvent, TriggerCategory } from "@/lib/types";
import { daysAgoISO, formatFriendlyDate, isoDate, last } from "@/lib/utils/dates";

function average(values: number[]): number {
  if (values.length === 0) return 0;
  return Math.round((values.reduce((sum, v) => sum + v, 0) / values.length) * 10) / 10;
}

export function buildAnalyticsSummary(
  checkIns: DailyCheckIn[],
  cravingEvents: CravingEvent[],
  relapseEvents: RelapseEvent[],
): AnalyticsSummary {
  const last7 = daysAgoISO(7);
  const last30 = daysAgoISO(30);

  const cravings7d = cravingEvents.filter((c) => c.timestamp >= last7).map((c) => c.intensity);
  const cravings30d = cravingEvents.filter((c) => c.timestamp >= last30).map((c) => c.intensity);

  const triggerCounts = new Map<TriggerCategory, number>();
  for (const event of cravingEvents) {
    triggerCounts.set(event.trigger, (triggerCounts.get(event.trigger) ?? 0) + 1);
  }
  for (const checkIn of checkIns) {
    for (const trigger of checkIn.triggers) {
      triggerCounts.set(trigger, (triggerCounts.get(trigger) ?? 0) + 1);
    }
  }
  const topTriggers = Array.from(triggerCounts.entries())
    .map(([trigger, count]) => ({ trigger, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 6);

  const dayRange = last(14);
  const cravingByDay = dayRange.map((date) => {
    const dayEvents = cravingEvents.filter((c) => c.timestamp.slice(0, 10) === date);
    const intensity = average(dayEvents.map((e) => e.intensity));
    const resisted = dayEvents.filter((e) => e.resisted).length;
    return { date: formatFriendlyDate(date), intensity, resisted };
  });

  const checkInDates = new Set(checkIns.map((c) => c.date));
  const last14Dates = last(14);
  const checkInCompletionRate =
    Math.round((last14Dates.filter((d) => checkInDates.has(d)).length / last14Dates.length) * 100) || 0;

  const moodTrend = last(14).map((date) => {
    const entry = checkIns.find((c) => c.date === date);
    return { date: formatFriendlyDate(date), mood: entry?.mood ?? 0 };
  });

  const relapseTimeline = relapseEvents
    .slice()
    .sort((a, b) => (a.timestamp > b.timestamp ? 1 : -1))
    .map((r) => ({ date: formatFriendlyDate(isoDate(new Date(r.timestamp))), intensityBefore: r.intensityBefore }));

  return {
    averageCraving7d: average(cravings7d),
    averageCraving30d: average(cravings30d),
    topTriggers,
    cravingByDay,
    checkInCompletionRate,
    moodTrend,
    relapseTimeline,
  };
}

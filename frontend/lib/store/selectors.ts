"use client";

import { useMemo } from "react";
import { useApp } from "@/lib/store/AppContext";
import { buildAnalyticsSummary } from "@/lib/utils/analytics";
import { nextMilestoneDay } from "@/lib/utils/streak";

export function useAnalytics() {
  const { state } = useApp();
  return useMemo(
    () => buildAnalyticsSummary(state.checkIns, state.cravingEvents, state.relapseEvents),
    [state.checkIns, state.cravingEvents, state.relapseEvents],
  );
}

export function useNextMilestone() {
  const { state } = useApp();
  return useMemo(() => {
    const day = nextMilestoneDay(state.streak.currentStreakDays, state.plan?.milestoneDays ?? []);
    return day;
  }, [state.streak.currentStreakDays, state.plan?.milestoneDays]);
}

export function useTodayCheckIn() {
  const { state } = useApp();
  const today = useMemo(() => new Date().toISOString().slice(0, 10), []);
  return useMemo(() => state.checkIns.find((c) => c.date === today) ?? null, [state.checkIns, today]);
}

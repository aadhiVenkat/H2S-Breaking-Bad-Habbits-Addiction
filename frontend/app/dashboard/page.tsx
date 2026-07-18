"use client";

import { useCallback, useEffect, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { CheckCircle2, MessageCircle, LifeBuoy, Flame, Sparkles, ArrowRight, RefreshCw, HeartHandshake } from "lucide-react";
import { PageContainer } from "@/components/layout/PageContainer";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { StreakRing } from "@/components/dashboard/StreakRing";
import { NudgeCard } from "@/components/dashboard/NudgeCard";
import { MilestoneGrid } from "@/components/dashboard/MilestoneGrid";
import { AiErrorState } from "@/components/system/AiErrorState";
import { ProviderBadge } from "@/components/system/ProviderBadge";
import { useApp } from "@/lib/store/AppContext";
import { useAnalytics, useNextMilestone, useTodayCheckIn } from "@/lib/store/selectors";
import { getNudges } from "@/lib/ai/nudgeService";
import { extractAiMeta, getErrorMessage, recordLastAiAction, type AiResponseMeta } from "@/lib/ai/meta";
import { habitLabel } from "@/lib/utils/labels";

const CravingSparkline = dynamic(
  () => import("@/components/dashboard/CravingSparkline").then((m) => m.CravingSparkline),
  {
    ssr: false,
    loading: () => <div className="h-24 animate-pulse rounded-xl bg-overlay" aria-hidden="true" />,
  },
);

export default function DashboardPage() {
  const { state, setNudges } = useApp();
  const analytics = useAnalytics();
  const nextMilestone = useNextMilestone();
  const todayCheckIn = useTodayCheckIn();
  const [loadingNudges, setLoadingNudges] = useState(false);
  const [nudgeError, setNudgeError] = useState<string | null>(null);
  const [nudgeMeta, setNudgeMeta] = useState<AiResponseMeta | null>(null);

  const refreshNudges = useCallback(async () => {
    if (!state.profile) return;
    setLoadingNudges(true);
    setNudgeError(null);
    try {
      const nudges = await getNudges(state.profile, state.checkIns, state.cravingEvents);
      setNudges(nudges);
      const meta = extractAiMeta(nudges) ?? extractAiMeta(nudges[0]);
      setNudgeMeta(meta);
      recordLastAiAction("Smart nudge", meta);
    } catch (err) {
      setNudgeError(getErrorMessage(err, "Could not load nudges."));
    } finally {
      setLoadingNudges(false);
    }
  }, [state.profile, state.checkIns, state.cravingEvents, setNudges]);

  useEffect(() => {
    if (!state.hydrated || !state.profile) return;
    if (state.nudges.length > 0) return;
    // Defer so setState from the fetch isn't synchronous inside the effect body.
    const timer = window.setTimeout(() => {
      void refreshNudges();
    }, 0);
    return () => window.clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.hydrated, state.profile?.id]);

  if (!state.hydrated) {
    return null;
  }

  if (!state.profile) {
    return (
      <PageContainer className="flex min-h-[70vh] flex-col items-center justify-center text-center gap-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-accent-soft">
          <Sparkles size={24} className="text-accent" />
        </div>
        <h1 className="text-2xl font-semibold">You haven&apos;t set up your recovery yet</h1>
        <p className="max-w-sm text-foreground-muted">
          Complete a short onboarding to get a personalized AI recovery plan tailored to your habit and goals.
        </p>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Link href="/onboarding">
            <Button size="lg">Start onboarding</Button>
          </Link>
          <Link href="/">
            <Button size="lg" variant="secondary">
              Back to home
            </Button>
          </Link>
        </div>
      </PageContainer>
    );
  }

  const latestInsight = state.insights[0];
  const topTriggerReplacement = state.replacementHabits.find((r) => r.savedByUser) ?? state.replacementHabits[0];
  const hasChartData = state.cravingEvents.length > 0 || state.checkIns.length > 0;

  return (
    <PageContainer className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-foreground-muted">Welcome back,</p>
          <h1 className="text-2xl font-semibold">{state.profile.name}</h1>
        </div>
        <Badge tone="accent">
          <Flame size={12} /> {habitLabel(state.profile.habit.habit)}
        </Badge>
      </div>

      <Card className="flex flex-col items-center gap-4 sm:flex-row sm:items-center sm:justify-between">
        <StreakRing currentStreak={state.streak.currentStreakDays} nextMilestone={nextMilestone} />
        <div className="flex-1 space-y-2 text-center sm:text-left">
          <p className="text-sm text-foreground-muted">
            Longest streak: <span className="font-semibold text-foreground">{state.streak.longestStreakDays} days</span>
          </p>
          {nextMilestone ? (
            <p className="text-sm text-foreground-muted">
              <span className="font-semibold text-accent">{nextMilestone - state.streak.currentStreakDays} days</span> to your next
              milestone
            </p>
          ) : (
            <p className="text-sm text-foreground-muted">You&apos;ve unlocked every milestone. Incredible work.</p>
          )}
          {!todayCheckIn && (
            <Link href="/check-in">
              <Button size="sm" variant="secondary" icon={<CheckCircle2 size={15} />}>
                Log today&apos;s check-in
              </Button>
            </Link>
          )}
        </div>
      </Card>

      {nudgeError ? (
        <AiErrorState message={nudgeError} onRetry={() => void refreshNudges()} compact />
      ) : loadingNudges ? (
        <Card className="animate-pulse">
          <div className="h-16" />
        </Card>
      ) : state.nudges.length > 0 ? (
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-2">
            <ProviderBadge meta={nudgeMeta} />
            <Button size="sm" variant="ghost" icon={<RefreshCw size={13} />} onClick={() => void refreshNudges()}>
              Refresh nudge
            </Button>
          </div>
          {state.nudges.slice(0, 1).map((nudge) => (
            <NudgeCard key={nudge.id} nudge={nudge} />
          ))}
        </div>
      ) : null}

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Link href="/check-in">
          <Card className="flex flex-col items-center gap-2 py-4 text-center hover:border-border-soft transition-colors">
            <CheckCircle2 size={20} className="text-accent" />
            <span className="text-xs font-medium text-foreground-muted">Check-in</span>
          </Card>
        </Link>
        <Link href="/coach">
          <Card className="flex flex-col items-center gap-2 py-4 text-center hover:border-border-soft transition-colors">
            <MessageCircle size={20} className="text-accent" />
            <span className="text-xs font-medium text-foreground-muted">AI Coach</span>
          </Card>
        </Link>
        <Link href="/emergency">
          <Card className="flex flex-col items-center gap-2 py-4 text-center hover:border-danger/30 transition-colors">
            <LifeBuoy size={20} className="text-danger" />
            <span className="text-xs font-medium text-foreground-muted">Emergency</span>
          </Card>
        </Link>
        <Link href="/relapse">
          <Card className="flex flex-col items-center gap-2 py-4 text-center hover:border-accent/30 transition-colors">
            <HeartHandshake size={20} className="text-accent" />
            <span className="text-xs font-medium text-foreground-muted">Relapse</span>
          </Card>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Craving trend — last 14 days</CardTitle>
          {hasChartData && (
            <Badge tone={analytics.averageCraving7d <= analytics.averageCraving30d ? "accent" : "warn"}>
              avg {analytics.averageCraving7d}/10
            </Badge>
          )}
        </CardHeader>
        {hasChartData ? (
          <CravingSparkline data={analytics.cravingByDay} />
        ) : (
          <div className="py-6 text-center">
            <p className="text-sm font-medium text-foreground">No craving data yet</p>
            <p className="mt-1 text-sm text-foreground-muted">
              Log check-ins or cravings to see your real trend — we never invent chart data.
            </p>
            <Link href="/check-in" className="mt-3 inline-block">
              <Button size="sm">Start with a check-in</Button>
            </Link>
          </div>
        )}
      </Card>

      {latestInsight && (
        <Card className="border-accent/15 bg-gradient-to-br from-accent-soft/60 to-transparent">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles size={14} className="text-accent" /> AI weekly reflection
            </CardTitle>
          </CardHeader>
          <p className="mb-1 text-sm font-medium text-foreground">{latestInsight.headline}</p>
          <p className="mb-3 text-sm text-foreground-muted leading-relaxed">{latestInsight.reflection}</p>
          <Link href="/insights" className="inline-flex items-center gap-1 text-sm font-semibold text-accent hover:underline">
            View full insights <ArrowRight size={14} />
          </Link>
        </Card>
      )}

      {topTriggerReplacement && (
        <Card>
          <CardHeader>
            <CardTitle>Suggested replacement habit</CardTitle>
          </CardHeader>
          <p className="mb-1 text-sm font-medium text-foreground">{topTriggerReplacement.title}</p>
          <p className="mb-3 text-sm text-foreground-muted">{topTriggerReplacement.description}</p>
          <Link href="/profile" className="text-sm font-semibold text-accent hover:underline">
            Manage replacement habits →
          </Link>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Milestones</CardTitle>
        </CardHeader>
        <MilestoneGrid milestones={state.milestones} />
      </Card>
    </PageContainer>
  );
}

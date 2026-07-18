"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { BarChart3, Sparkles, TrendingDown, TrendingUp, Minus } from "lucide-react";
import { PageContainer } from "@/components/layout/PageContainer";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { AILoadingDots } from "@/components/ui/AILoadingDots";
import { AiErrorState } from "@/components/system/AiErrorState";
import { EmptyState } from "@/components/system/EmptyState";
import { ProviderBadge } from "@/components/system/ProviderBadge";
import { useApp } from "@/lib/store/AppContext";
import { useAnalytics } from "@/lib/store/selectors";
import { weeklyReflection } from "@/lib/ai/insightService";
import { extractAiMeta, getErrorMessage, recordLastAiAction, type AiResponseMeta } from "@/lib/ai/meta";

const InsightsCharts = dynamic(
  () => import("@/components/insights/InsightsCharts").then((m) => m.InsightsCharts),
  {
    ssr: false,
    loading: () => (
      <div className="space-y-5" aria-busy="true" aria-label="Loading charts">
        <div className="h-64 animate-pulse rounded-2xl bg-overlay" />
        <div className="h-48 animate-pulse rounded-2xl bg-overlay" />
        <div className="h-56 animate-pulse rounded-2xl bg-overlay" />
      </div>
    ),
  },
);

export default function InsightsPage() {
  const { state, addInsight } = useApp();
  const analytics = useAnalytics();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [meta, setMeta] = useState<AiResponseMeta | null>(null);

  const hasData = state.checkIns.length > 0 || state.cravingEvents.length > 0;
  const latest = state.insights[0];

  async function generateReflection() {
    setLoading(true);
    setError(null);
    try {
      const insight = await weeklyReflection(analytics);
      addInsight(insight);
      const insightMeta = extractAiMeta(insight);
      setMeta(insightMeta);
      recordLastAiAction("Weekly reflection", insightMeta);
    } catch (err) {
      setError(getErrorMessage(err, "Could not generate weekly reflection."));
    } finally {
      setLoading(false);
    }
  }

  const TrendIcon =
    latest?.trendDirection === "improving"
      ? TrendingDown
      : latest?.trendDirection === "needs_support"
        ? TrendingUp
        : Minus;

  return (
    <PageContainer className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold">Insights</h1>
        <p className="text-sm text-foreground-muted">Real patterns from your logged data — never invented metrics.</p>
      </div>

      {!hasData ? (
        <EmptyState
          icon={<BarChart3 size={22} className="text-foreground-muted" />}
          title="No data to chart yet"
          description="Log a few check-ins and cravings first. Charts and weekly reflections only use what you've recorded."
          action={
            <Link href="/check-in">
              <Button size="sm">Log a check-in</Button>
            </Link>
          }
        />
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Stat label="Avg craving 7d" value={`${analytics.averageCraving7d}/10`} />
            <Stat label="Avg craving 30d" value={`${analytics.averageCraving30d}/10`} />
            <Stat label="Check-in rate" value={`${analytics.checkInCompletionRate}%`} />
            <Stat label="Relapses" value={String(state.relapseEvents.length)} />
          </div>

          <InsightsCharts analytics={analytics} />
        </>
      )}

      <Card className="space-y-4">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles size={14} className="text-accent" /> Weekly AI reflection
          </CardTitle>
          <ProviderBadge meta={meta} />
        </CardHeader>

        {!hasData ? (
          <p className="text-sm text-foreground-muted">Need some logged data before generating a reflection.</p>
        ) : (
          <>
            <Button size="md" onClick={() => void generateReflection()} disabled={loading} icon={<Sparkles size={14} />}>
              {loading ? "Generating…" : latest ? "Regenerate reflection" : "Generate weekly reflection"}
            </Button>
            {loading && <AILoadingDots label="Analyzing your patterns" />}
            {error && <AiErrorState message={error} onRetry={() => void generateReflection()} compact />}
            {latest && !loading && (
              <div className="space-y-3 rounded-xl border border-accent/15 bg-accent-soft/40 p-4">
                <div className="flex items-center gap-2">
                  <TrendIcon size={16} className="text-accent" />
                  <p className="font-semibold text-foreground">{latest.headline}</p>
                  <Badge tone="neutral">{latest.trendDirection.replace("_", " ")}</Badge>
                </div>
                <p className="text-sm text-foreground-muted leading-relaxed">{latest.reflection}</p>
                <ul className="space-y-1.5">
                  {latest.suggestions.map((s) => (
                    <li key={s} className="text-sm text-foreground flex gap-2">
                      <span className="text-accent">•</span>
                      {s}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </>
        )}
      </Card>

      {analytics.relapseTimeline.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Relapse timeline</CardTitle>
          </CardHeader>
          <ul className="space-y-2">
            {analytics.relapseTimeline.map((r) => (
              <li key={r.date + r.intensityBefore} className="flex justify-between text-sm">
                <span className="text-foreground-muted">{r.date}</span>
                <span className="text-foreground">Intensity {r.intensityBefore}/10</span>
              </li>
            ))}
          </ul>
          <Link href="/relapse" className="mt-3 inline-block text-sm font-semibold text-accent hover:underline">
            Log a relapse reflection →
          </Link>
        </Card>
      )}
    </PageContainer>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <Card className="py-3 px-3.5">
      <p className="text-[11px] text-foreground-subtle uppercase tracking-wide">{label}</p>
      <p className="mt-1 text-lg font-semibold text-foreground">{value}</p>
    </Card>
  );
}

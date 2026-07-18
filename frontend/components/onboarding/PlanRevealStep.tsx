"use client";

import { motion } from "framer-motion";
import { Sparkles, CheckCircle2 } from "lucide-react";
import type { RecoveryPlan } from "@/lib/types";
import { AILoadingDots } from "@/components/ui/AILoadingDots";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { AiErrorState } from "@/components/system/AiErrorState";
import { ProviderBadge } from "@/components/system/ProviderBadge";
import type { AiResponseMeta } from "@/lib/ai/meta";

interface PlanRevealStepProps {
  plan: RecoveryPlan | null;
  loading: boolean;
  name: string;
  error?: string | null;
  /** True when the plan was built from assessment answers after AI failed. */
  isFallback?: boolean;
  meta?: AiResponseMeta | null;
  onRetry?: () => void;
  onEnter: () => void;
}

export function PlanRevealStep({
  plan,
  loading,
  name,
  error,
  isFallback,
  meta,
  onRetry,
  onEnter,
}: PlanRevealStepProps) {
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-accent-soft">
          <Sparkles size={24} className="text-accent" />
        </div>
        <p className="text-lg font-medium text-foreground">Building your personalized recovery plan…</p>
        <AILoadingDots label="Analyzing your triggers and goals" />
      </div>
    );
  }

  if (!plan) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-12 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-accent-soft">
          <Sparkles size={24} className="text-accent" />
        </div>
        <p className="text-lg font-medium text-foreground">We couldn&apos;t finish your plan</p>
        <div className="w-full max-w-md text-left">
          <AiErrorState message={error ?? "Plan generation failed."} onRetry={onRetry} />
        </div>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="space-y-6">
      <div className="space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone={isFallback ? "warn" : "accent"}>
            <Sparkles size={12} /> {isFallback ? "Starter plan from your answers" : "AI-generated plan"}
          </Badge>
          {!isFallback && <ProviderBadge meta={meta} />}
        </div>
        <h2 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
          {name ? `${name}, here's` : "Here's"} your plan
        </h2>
        <p className="text-foreground-muted">{plan.summary}</p>
      </div>

      {isFallback && error && (
        <AiErrorState
          message={`${error} You can still continue with this starter plan built from your assessment, or retry AI.`}
          onRetry={onRetry}
        />
      )}

      <Card>
        <p className="mb-3 text-sm font-semibold text-foreground">{plan.title}</p>
        <div className="space-y-4">
          {plan.weeks.map((week) => (
            <div key={week.weekNumber} className="border-l-2 border-accent/30 pl-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-accent">Week {week.weekNumber}</p>
              <p className="mb-1.5 text-sm font-medium text-foreground">{week.focus}</p>
              <ul className="space-y-1">
                {week.actions.map((action) => (
                  <li key={action} className="flex items-start gap-2 text-sm text-foreground-muted">
                    <CheckCircle2 size={14} className="mt-0.5 shrink-0 text-accent/60" />
                    {action}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <p className="mb-3 text-sm font-semibold text-foreground">Daily practices</p>
        <ul className="space-y-2">
          {plan.dailyPractices.map((practice) => (
            <li key={practice} className="flex items-start gap-2 text-sm text-foreground-muted">
              <CheckCircle2 size={14} className="mt-0.5 shrink-0 text-accent/60" />
              {practice}
            </li>
          ))}
        </ul>
      </Card>

      <Button size="lg" fullWidth onClick={onEnter}>
        Enter my dashboard
      </Button>
    </motion.div>
  );
}

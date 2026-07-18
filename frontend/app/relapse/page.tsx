"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { HeartHandshake, ArrowRight, ArrowLeft } from "lucide-react";
import { PageContainer } from "@/components/layout/PageContainer";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Slider } from "@/components/ui/Slider";
import { Textarea } from "@/components/ui/Textarea";
import { Chip } from "@/components/ui/Chip";
import { AILoadingDots } from "@/components/ui/AILoadingDots";
import { AiErrorState } from "@/components/system/AiErrorState";
import { ProviderBadge } from "@/components/system/ProviderBadge";
import { useApp } from "@/lib/store/AppContext";
import { recover } from "@/lib/ai/relapseService";
import { extractAiMeta, getErrorMessage, recordLastAiAction, type AiResponseMeta } from "@/lib/ai/meta";
import { TRIGGER_OPTIONS } from "@/components/onboarding/onboardingOptions";
import type { RelapseEvent, TriggerCategory } from "@/lib/types";

export default function RelapsePage() {
  const { state, logRelapse, updatePlan } = useApp();
  const [step, setStep] = useState(1);
  const [trigger, setTrigger] = useState<TriggerCategory | null>(null);
  const [intensityBefore, setIntensityBefore] = useState(6);
  const [reflection, setReflection] = useState("");
  const [whatHelped, setWhatHelped] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [guidance, setGuidance] = useState<{ message: string; updatedPlanNote: string; encouragement: string } | null>(null);
  const [meta, setMeta] = useState<AiResponseMeta | null>(null);

  function applyPlanNote(note: string) {
    if (!state.plan || !note.trim()) return;
    const trimmed = note.trim();
    const withoutPrior = state.plan.dailyPractices.filter((p) => !p.startsWith("Post-relapse:"));
    updatePlan({
      ...state.plan,
      summary: `${state.plan.summary.replace(/\s*Post-relapse adjustment:[\s\S]*$/, "").trim()} Post-relapse adjustment: ${trimmed}`,
      dailyPractices: [`Post-relapse: ${trimmed.slice(0, 140)}`, ...withoutPrior].slice(0, 6),
    });
  }

  async function submit() {
    if (!trigger) return;
    setLoading(true);
    setError(null);
    setStep(4);

    const payload = {
      trigger,
      intensityBefore,
      reflection: reflection.trim(),
      whatHelped: whatHelped.trim(),
    };

    try {
      const result = await recover(payload);
      setGuidance(result);
      const resultMeta = extractAiMeta(result);
      setMeta(resultMeta);
      recordLastAiAction("Relapse reflection", resultMeta);

      const event: RelapseEvent = {
        id: `relapse-${crypto.randomUUID()}`,
        timestamp: new Date().toISOString(),
        ...payload,
        aiGuidance: result.message,
        updatedPlanNote: result.updatedPlanNote,
      };
      logRelapse(event);
      applyPlanNote(result.updatedPlanNote);
    } catch (err) {
      setError(getErrorMessage(err, "Could not generate relapse guidance."));
      const localNote = payload.whatHelped
        ? `After a slip, double down on what helped: ${payload.whatHelped}`
        : `After a slip triggered by ${payload.trigger}, rebuild with one small win today and use Emergency support early.`;
      const event: RelapseEvent = {
        id: `relapse-${crypto.randomUUID()}`,
        timestamp: new Date().toISOString(),
        ...payload,
        updatedPlanNote: localNote,
      };
      logRelapse(event);
      applyPlanNote(localNote);
      setGuidance({
        message:
          "Your reflection is saved and your streak has been reset. AI guidance was unavailable, so we applied a simple plan adjustment from what you wrote.",
        updatedPlanNote: localNote,
        encouragement: "A slip is data, not a verdict. Start again with the next urge.",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <PageContainer className="space-y-5">
      <div className="space-y-2">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent-soft">
          <HeartHandshake size={22} className="text-accent" />
        </div>
        <h1 className="text-2xl font-semibold">Relapse reflection</h1>
        <p className="text-sm text-foreground-muted">
          A slip is data, not failure. A few honest answers help reset your plan — and your streak.
        </p>
      </div>

      {step < 4 && (
        <Card className="space-y-5">
          {step === 1 && (
            <div className="space-y-4">
              <p className="text-sm font-semibold">What triggered this moment?</p>
              <div className="flex flex-wrap gap-2">
                {TRIGGER_OPTIONS.map((opt) => (
                  <Chip key={opt.value} selected={trigger === opt.value} onClick={() => setTrigger(opt.value)}>
                    {opt.label}
                  </Chip>
                ))}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold">Craving intensity before</p>
                <span className="text-sm font-semibold text-accent">{intensityBefore}/10</span>
              </div>
              <Slider value={intensityBefore} min={1} max={10} onChange={setIntensityBefore} />
              <div>
                <p className="mb-2 text-sm font-semibold">What happened?</p>
                <Textarea
                  rows={4}
                  value={reflection}
                  onChange={(e) => setReflection(e.target.value)}
                  placeholder="No judgment — just what led up to it…"
                />
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <div>
                <p className="mb-2 text-sm font-semibold">What helped you stop or reset?</p>
                <Textarea
                  rows={3}
                  value={whatHelped}
                  onChange={(e) => setWhatHelped(e.target.value)}
                  placeholder="Even something small counts…"
                />
              </div>
              <p className="text-xs text-foreground-subtle">
                Submitting will reset your current streak and ask the AI for a compassionate plan adjustment.
              </p>
            </div>
          )}

          <div className="flex gap-2">
            {step > 1 && (
              <Button variant="ghost" icon={<ArrowLeft size={16} />} onClick={() => setStep((s) => s - 1)}>
                Back
              </Button>
            )}
            {step < 3 ? (
              <Button
                fullWidth
                disabled={step === 1 && !trigger}
                iconRight={<ArrowRight size={16} />}
                onClick={() => setStep((s) => s + 1)}
              >
                Continue
              </Button>
            ) : (
              <Button fullWidth onClick={() => void submit()} disabled={!reflection.trim()}>
                Get guidance
              </Button>
            )}
          </div>
        </Card>
      )}

      {step === 4 && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          {loading && (
            <Card className="flex justify-center py-10">
              <AILoadingDots label="Turning this into a clearer plan" />
            </Card>
          )}

          {error && !guidance && <AiErrorState message={error} onRetry={() => void submit()} />}

          {guidance && !loading && (
            <Card className="border-accent/15 space-y-4">
              <CardHeader>
                <CardTitle>{meta ? "AI guidance" : "Guidance & plan update"}</CardTitle>
                <ProviderBadge meta={meta} />
              </CardHeader>
              {error && (
                <p className="text-xs text-foreground-muted">
                  AI was unavailable — your reflection is still saved and the plan note below was applied locally.
                </p>
              )}
              <p className="text-sm leading-relaxed text-foreground">{guidance.message}</p>
              <div className="rounded-xl border border-border-subtle bg-overlay p-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-accent mb-1">Plan update</p>
                <p className="text-sm text-foreground-muted">{guidance.updatedPlanNote}</p>
              </div>
              <p className="text-sm font-medium text-accent">{guidance.encouragement}</p>
              <div className="flex flex-wrap gap-2 pt-1">
                <Link href="/dashboard">
                  <Button>Back to dashboard</Button>
                </Link>
                <Link href="/coach">
                  <Button variant="secondary">Talk to coach</Button>
                </Link>
              </div>
            </Card>
          )}
        </motion.div>
      )}
    </PageContainer>
  );
}

"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { CheckCircle2, Sparkles } from "lucide-react";
import { PageContainer } from "@/components/layout/PageContainer";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Slider } from "@/components/ui/Slider";
import { Textarea } from "@/components/ui/Textarea";
import { Chip } from "@/components/ui/Chip";
import { AILoadingDots } from "@/components/ui/AILoadingDots";
import { MoodSelector } from "@/components/checkin/MoodSelector";
import { AiErrorState } from "@/components/system/AiErrorState";
import { ProviderBadge } from "@/components/system/ProviderBadge";
import { useApp } from "@/lib/store/AppContext";
import { useTodayCheckIn } from "@/lib/store/selectors";
import { summarize } from "@/lib/ai/checkInService";
import { extractAiMeta, getErrorMessage, recordLastAiAction, type AiResponseMeta } from "@/lib/ai/meta";
import { TRIGGER_OPTIONS } from "@/components/onboarding/onboardingOptions";
import type { DailyCheckIn, MoodLevel, TriggerCategory } from "@/lib/types";
import { isoDate } from "@/lib/utils/dates";

export default function CheckInPage() {
  const { state, addCheckIn } = useApp();
  const todayCheckIn = useTodayCheckIn();

  const [mood, setMood] = useState<MoodLevel | null>(todayCheckIn?.mood ?? null);
  const [cravingIntensity, setCravingIntensity] = useState(todayCheckIn?.cravingIntensity ?? 5);
  const [difficulty, setDifficulty] = useState<1 | 2 | 3 | 4 | 5>(todayCheckIn?.difficulty ?? 3);
  const [triggers, setTriggers] = useState<TriggerCategory[]>(todayCheckIn?.triggers ?? []);
  const [journal, setJournal] = useState(todayCheckIn?.journal ?? "");
  const [saved, setSaved] = useState(Boolean(todayCheckIn));
  const [summarizing, setSummarizing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ summary: string; guidance: string } | null>(
    todayCheckIn?.aiSummary && todayCheckIn?.aiGuidance
      ? { summary: todayCheckIn.aiSummary, guidance: todayCheckIn.aiGuidance }
      : null,
  );
  const [meta, setMeta] = useState<AiResponseMeta | null>(null);

  function toggleTrigger(t: TriggerCategory) {
    setTriggers((prev) => (prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]));
  }

  function buildDraft() {
    if (!mood) return null;
    return {
      mood,
      cravingIntensity,
      triggers,
      difficulty,
      journal: journal.trim(),
    };
  }

  function handleSave() {
    const draft = buildDraft();
    if (!draft) return;
    setError(null);

    const checkIn: DailyCheckIn = {
      id: todayCheckIn?.id ?? `checkin-${isoDate()}`,
      date: isoDate(),
      ...draft,
      // Preserve existing AI fields on re-save unless user re-summarizes.
      aiSummary: todayCheckIn?.aiSummary ?? result?.summary,
      aiGuidance: todayCheckIn?.aiGuidance ?? result?.guidance,
    };
    addCheckIn(checkIn);
    setSaved(true);
  }

  async function handleSummarize() {
    const draft = buildDraft();
    if (!draft) return;
    setSummarizing(true);
    setError(null);

    try {
      const ai = await summarize(draft);
      const aiMeta = extractAiMeta(ai);
      setMeta(aiMeta);
      recordLastAiAction("Check-in summary", aiMeta);
      setResult({ summary: ai.summary, guidance: ai.guidance });

      const checkIn: DailyCheckIn = {
        id: todayCheckIn?.id ?? `checkin-${isoDate()}`,
        date: isoDate(),
        ...draft,
        aiSummary: ai.summary,
        aiGuidance: ai.guidance,
      };
      addCheckIn(checkIn);
      setSaved(true);
    } catch (err) {
      setError(getErrorMessage(err, "Could not generate check-in guidance."));
    } finally {
      setSummarizing(false);
    }
  }

  return (
    <PageContainer className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold">Daily check-in</h1>
        <p className="text-sm text-foreground-muted">
          {todayCheckIn
            ? "You've already checked in today — saving again will update it."
            : "A quick honest snapshot of today. Summarize with AI only when you want."}
        </p>
      </div>

      <Card className="space-y-5">
        <div>
          <p className="mb-3 text-sm font-semibold text-foreground">How&apos;s your mood?</p>
          <MoodSelector value={mood} onChange={setMood} />
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between">
            <p className="text-sm font-semibold text-foreground">Craving intensity</p>
            <span className="text-sm font-semibold text-accent">{cravingIntensity}/10</span>
          </div>
          <Slider value={cravingIntensity} min={0} max={10} onChange={setCravingIntensity} lowLabel="None" highLabel="Intense" />
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between">
            <p className="text-sm font-semibold text-foreground">Difficulty resisting</p>
            <span className="text-sm font-semibold text-accent">{difficulty}/5</span>
          </div>
          <Slider
            value={difficulty}
            min={1}
            max={5}
            onChange={(v) => setDifficulty(v as 1 | 2 | 3 | 4 | 5)}
            lowLabel="Easy"
            highLabel="Hard"
          />
        </div>

        <div>
          <p className="mb-3 text-sm font-semibold text-foreground">Triggers today</p>
          <div className="flex flex-wrap gap-2">
            {TRIGGER_OPTIONS.map((opt) => (
              <Chip key={opt.value} selected={triggers.includes(opt.value)} onClick={() => toggleTrigger(opt.value)}>
                {opt.label}
              </Chip>
            ))}
          </div>
        </div>

        <div>
          <p className="mb-2 text-sm font-semibold text-foreground">Journal (optional)</p>
          <Textarea
            rows={3}
            value={journal}
            onChange={(e) => setJournal(e.target.value)}
            placeholder="Anything worth noting about today…"
          />
        </div>

        <div className="flex flex-col gap-2 sm:flex-row">
          <Button size="lg" fullWidth disabled={!mood || summarizing} onClick={handleSave}>
            {todayCheckIn || saved ? "Update check-in" : "Save check-in"}
          </Button>
          <Button
            size="lg"
            variant="secondary"
            fullWidth
            disabled={!mood || summarizing}
            icon={<Sparkles size={16} />}
            onClick={() => void handleSummarize()}
          >
            {summarizing ? "Summarizing…" : "Summarize with AI"}
          </Button>
        </div>
      </Card>

      {summarizing && (
        <Card className="flex justify-center py-6">
          <AILoadingDots label="Writing your AI summary" />
        </Card>
      )}

      {error && <AiErrorState message={error} onRetry={() => void handleSummarize()} />}

      {result && !summarizing && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="space-y-3 border-accent/15 bg-gradient-to-br from-accent-soft/50 to-transparent">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles size={14} className="text-accent" /> AI reflection
              </CardTitle>
              <ProviderBadge meta={meta} />
            </CardHeader>
            <p className="text-sm leading-relaxed text-foreground">{result.summary}</p>
            <p className="text-sm leading-relaxed text-foreground-muted">{result.guidance}</p>
            <div className="flex flex-wrap gap-2 pt-1">
              <Link href="/dashboard">
                <Button size="sm" variant="secondary" icon={<CheckCircle2 size={14} />}>
                  Back to dashboard
                </Button>
              </Link>
              <Link href="/coach">
                <Button size="sm" variant="ghost">
                  Talk to coach
                </Button>
              </Link>
            </div>
          </Card>
        </motion.div>
      )}

      {state.checkIns.length > 1 && (
        <p className="text-center text-xs text-foreground-subtle">
          {state.checkIns.length} check-ins saved locally on this device
        </p>
      )}
    </PageContainer>
  );
}

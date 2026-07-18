"use client";

import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { LifeBuoy, Wind, Timer, Footprints, Gamepad2, MessageCircle, X } from "lucide-react";
import { PageContainer } from "@/components/layout/PageContainer";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Slider } from "@/components/ui/Slider";
import { Chip } from "@/components/ui/Chip";
import { AILoadingDots } from "@/components/ui/AILoadingDots";
import { AiErrorState } from "@/components/system/AiErrorState";
import { ProviderBadge } from "@/components/system/ProviderBadge";
import { useApp } from "@/lib/store/AppContext";
import { calmingIntervention, offlineIntervention, type EmergencyIntervention } from "@/lib/ai/emergencyService";
import { extractAiMeta, getErrorMessage, recordLastAiAction, type AiResponseMeta } from "@/lib/ai/meta";
import { TRIGGER_OPTIONS } from "@/components/onboarding/onboardingOptions";
import type { TriggerCategory } from "@/lib/types";

type ActiveTool = "breathing" | "delay" | "grounding" | "distraction" | null;

const TOOL_ICONS = {
  breathing: Wind,
  delay: Timer,
  grounding: Footprints,
  distraction: Gamepad2,
  coach: MessageCircle,
};

export default function EmergencyPage() {
  const { logEmergencySession, logCraving } = useApp();
  const [intensity, setIntensity] = useState(7);
  const [trigger, setTrigger] = useState<TriggerCategory | undefined>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [intervention, setIntervention] = useState<EmergencyIntervention | null>(null);
  const [meta, setMeta] = useState<AiResponseMeta | null>(null);
  const [activeTool, setActiveTool] = useState<ActiveTool>(null);
  const [started, setStarted] = useState(false);

  function requestHelp() {
    setLoading(true);
    setError(null);
    setStarted(true);
    void (async () => {
      const cravingPayload = {
        id: `craving-em-${crypto.randomUUID()}`,
        timestamp: new Date().toISOString(),
        intensity,
        trigger: trigger ?? ("habit_cue" as const),
        resisted: true,
        note: "Logged from emergency support",
      };

      try {
        const result = await calmingIntervention(intensity, trigger);
        setIntervention(result);
        const resultMeta = extractAiMeta(result);
        setMeta(resultMeta);
        recordLastAiAction("Emergency support", resultMeta);
        logCraving(cravingPayload);
      } catch (err) {
        setError(getErrorMessage(err, "Could not load AI guidance — tools below still work."));
        setIntervention(offlineIntervention(intensity));
        setMeta(null);
        logCraving({
          ...cravingPayload,
          note: "Logged from emergency support (offline tools)",
        });
      } finally {
        setLoading(false);
      }
    })();
  }

  return (
    <PageContainer className="space-y-5">
      <div className="space-y-2">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-danger-soft">
          <LifeBuoy size={22} className="text-danger" />
        </div>
        <h1 className="text-2xl font-semibold">Emergency support</h1>
        <p className="text-sm text-foreground-muted">
          You&apos;re safe. This urge is temporary. Let&apos;s get through the next few minutes together.
        </p>
      </div>

      {!started && (
        <Card className="space-y-5">
          <div>
            <div className="mb-2 flex items-center justify-between">
              <p className="text-sm font-semibold">How intense is the craving?</p>
              <span className="text-sm font-semibold text-danger">{intensity}/10</span>
            </div>
            <Slider value={intensity} min={1} max={10} onChange={setIntensity} lowLabel="Mild" highLabel="Overwhelming" />
          </div>

          <div>
            <p className="mb-3 text-sm font-semibold">What&apos;s driving it? (optional)</p>
            <div className="flex flex-wrap gap-2">
              {TRIGGER_OPTIONS.map((opt) => (
                <Chip
                  key={opt.value}
                  selected={trigger === opt.value}
                  onClick={() => setTrigger((t) => (t === opt.value ? undefined : opt.value))}
                >
                  {opt.label}
                </Chip>
              ))}
            </div>
          </div>

          <Button size="lg" fullWidth variant="danger" onClick={() => void requestHelp()} disabled={loading}>
            Get support now
          </Button>
        </Card>
      )}

      {loading && (
        <Card className="flex justify-center py-10">
          <AILoadingDots label="Getting you calm guidance" />
        </Card>
      )}

      {error && !loading && <AiErrorState message={error} onRetry={() => void requestHelp()} compact />}

      {intervention && !loading && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          <Card className="border-danger/20 space-y-3">
            <CardHeader>
              <CardTitle>Right now</CardTitle>
              <ProviderBadge meta={meta} />
            </CardHeader>
            <p className="text-sm leading-relaxed text-foreground">{intervention.message}</p>
          </Card>

          <div className="space-y-2">
            <p className="text-sm font-semibold text-foreground">Try one of these</p>
            {intervention.tools.map((tool) => {
              const Icon = TOOL_ICONS[tool.id] ?? LifeBuoy;
              if (tool.id === "coach") {
                return (
                  <Link key={tool.id} href="/coach">
                    <Card className="flex items-center gap-3 py-4 hover:border-accent/30 transition-colors">
                      <Icon size={18} className="text-accent" />
                      <span className="text-sm font-medium">{tool.label}</span>
                    </Card>
                  </Link>
                );
              }
              return (
                <button
                  key={tool.id}
                  type="button"
                  className="w-full text-left"
                  onClick={() => {
                    setActiveTool(tool.id as ActiveTool);
                    logEmergencySession({
                      id: `em-${crypto.randomUUID()}`,
                      timestamp: new Date().toISOString(),
                      toolUsed: tool.id,
                      cravingIntensityBefore: intensity,
                    });
                  }}
                >
                  <Card className="flex items-center gap-3 py-4 hover:border-accent/30 transition-colors">
                    <Icon size={18} className="text-accent" />
                    <span className="text-sm font-medium">{tool.label}</span>
                  </Card>
                </button>
              );
            })}
          </div>

          <Button variant="ghost" fullWidth onClick={() => { setStarted(false); setIntervention(null); setActiveTool(null); }}>
            Start over
          </Button>
        </motion.div>
      )}

      <AnimatePresence>
        {activeTool === "breathing" && <BreathingTimer onClose={() => setActiveTool(null)} />}
        {activeTool === "delay" && <DelayTimer minutes={intensity >= 7 ? 10 : 5} onClose={() => setActiveTool(null)} />}
        {activeTool === "grounding" && <GroundingCard onClose={() => setActiveTool(null)} />}
        {activeTool === "distraction" && <DistractionCard onClose={() => setActiveTool(null)} />}
      </AnimatePresence>
    </PageContainer>
  );
}

function ToolOverlay({ title, onClose, children }: { title: string; onClose: () => void; children: ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 p-4"
    >
      <motion.div
        initial={{ y: 24, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 24, opacity: 0 }}
        className="w-full max-w-md rounded-2xl border border-border-soft bg-surface p-5 shadow-2xl"
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">{title}</h2>
          <button type="button" onClick={onClose} className="rounded-lg p-1.5 text-foreground-muted hover:bg-overlay-strong" aria-label="Close">
            <X size={18} />
          </button>
        </div>
        {children}
      </motion.div>
    </motion.div>
  );
}

function BreathingTimer({ onClose }: { onClose: () => void }) {
  const [phase, setPhase] = useState<"in" | "hold" | "out">("in");
  const [secondsLeft, setSecondsLeft] = useState(4);
  const [cycles, setCycles] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setSecondsLeft((s) => {
        if (s > 1) return s - 1;
        setPhase((p) => {
          if (p === "in") return "hold";
          if (p === "hold") return "out";
          setCycles((c) => c + 1);
          return "in";
        });
        return 4;
      });
    }, 1000);
    return () => clearInterval(id);
  }, []);

  const label = phase === "in" ? "Breathe in" : phase === "hold" ? "Hold" : "Breathe out";

  return (
    <ToolOverlay title="Box breathing" onClose={onClose}>
      <div className="flex flex-col items-center gap-4 py-6">
        <motion.div
          animate={{ scale: phase === "in" ? 1.25 : phase === "out" ? 0.85 : 1.1 }}
          transition={{ duration: 3.8, ease: "easeInOut" }}
          className="flex h-32 w-32 items-center justify-center rounded-full border-2 border-accent bg-accent-soft"
        >
          <span className="text-3xl font-bold text-accent">{secondsLeft}</span>
        </motion.div>
        <p className="text-lg font-medium text-foreground">{label}</p>
        <p className="text-sm text-foreground-muted">{cycles} cycle{cycles === 1 ? "" : "s"} complete</p>
        <Button variant="secondary" onClick={onClose}>
          I feel steadier
        </Button>
      </div>
    </ToolOverlay>
  );
}

function DelayTimer({ minutes, onClose }: { minutes: number; onClose: () => void }) {
  const [remaining, setRemaining] = useState(minutes * 60);

  useEffect(() => {
    if (remaining <= 0) return;
    const id = setInterval(() => setRemaining((r) => r - 1), 1000);
    return () => clearInterval(id);
  }, [remaining]);

  const m = Math.floor(remaining / 60);
  const s = remaining % 60;

  return (
    <ToolOverlay title={`${minutes}-minute delay`} onClose={onClose}>
      <div className="flex flex-col items-center gap-4 py-6 text-center">
        <p className="text-sm text-foreground-muted">
          You don&apos;t have to decide anything until the timer ends. Just ride the wave.
        </p>
        <p className="font-mono text-5xl font-bold text-accent">
          {String(m).padStart(2, "0")}:{String(s).padStart(2, "0")}
        </p>
        {remaining <= 0 ? (
          <div className="space-y-3">
            <p className="text-sm text-foreground">Time&apos;s up. How intense is the urge now?</p>
            <Button onClick={onClose}>I made it through</Button>
          </div>
        ) : (
          <Button variant="ghost" onClick={onClose}>
            End early
          </Button>
        )}
      </div>
    </ToolOverlay>
  );
}

function GroundingCard({ onClose }: { onClose: () => void }) {
  const steps = [
    "Name 5 things you can see",
    "Name 4 things you can touch",
    "Name 3 things you can hear",
    "Name 2 things you can smell",
    "Name 1 thing you can taste",
  ];
  const [step, setStep] = useState(0);

  return (
    <ToolOverlay title="5-4-3-2-1 grounding" onClose={onClose}>
      <div className="space-y-4 py-2">
        <p className="text-lg font-medium text-foreground">{steps[step]}</p>
        <p className="text-sm text-foreground-muted">
          Step {step + 1} of {steps.length}
        </p>
        {step < steps.length - 1 ? (
          <Button fullWidth onClick={() => setStep((s) => s + 1)}>
            Next
          </Button>
        ) : (
          <Button fullWidth onClick={onClose}>
            Done
          </Button>
        )}
      </div>
    </ToolOverlay>
  );
}

function DistractionCard({ onClose }: { onClose: () => void }) {
  const ideas = [
    "Put on a song and stand up for the whole track",
    "Wash your face with cold water",
    "Text someone a short check-in",
    "Do 20 jumping jacks or stretch for 2 minutes",
    "Tidy one small surface near you",
  ];

  return (
    <ToolOverlay title="Quick distractions" onClose={onClose}>
      <ul className="space-y-2 mb-4">
        {ideas.map((idea) => (
          <li key={idea} className="rounded-xl border border-border-subtle bg-overlay px-3 py-2.5 text-sm text-foreground-muted">
            {idea}
          </li>
        ))}
      </ul>
      <Button fullWidth onClick={onClose}>
        Close
      </Button>
    </ToolOverlay>
  );
}

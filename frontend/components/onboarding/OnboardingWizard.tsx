"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight } from "lucide-react";
import type { HabitType, OnboardingAssessment, RecoveryGoal, RecoveryPlan, TimeOfDay, TriggerCategory, UserProfile } from "@/lib/types";
import { Button } from "@/components/ui/Button";
import { StepProgress } from "@/components/onboarding/StepProgress";
import { WelcomeStep } from "@/components/onboarding/WelcomeStep";
import { IntensityStep } from "@/components/onboarding/IntensityStep";
import { TriggersStep } from "@/components/onboarding/TriggersStep";
import { MotivationStep } from "@/components/onboarding/MotivationStep";
import { GoalStep } from "@/components/onboarding/GoalStep";
import { PlanRevealStep } from "@/components/onboarding/PlanRevealStep";
import { habitLabel } from "@/lib/utils/labels";
import { useApp } from "@/lib/store/AppContext";
import { useAuth } from "@/lib/auth/AuthContext";
import { buildFallbackPlan, generateRecoveryPlan } from "@/lib/ai/planService";
import { extractAiMeta, getErrorMessage, recordLastAiAction, type AiResponseMeta } from "@/lib/ai/meta";

const TOTAL_STEPS = 6;

interface FormState {
  name: string;
  habit: HabitType | null;
  frequencyPerDay: number;
  yearsActive: number;
  intensity: 1 | 2 | 3 | 4 | 5;
  triggers: TriggerCategory[];
  peakTimes: TimeOfDay[];
  emotionalState: string;
  motivation: string;
  previousAttempts: number;
  supportSystem: "strong" | "some" | "none";
  goal: RecoveryGoal | null;
}

const initialForm: FormState = {
  name: "",
  habit: null,
  frequencyPerDay: 8,
  yearsActive: 1,
  intensity: 3,
  triggers: [],
  peakTimes: [],
  emotionalState: "",
  motivation: "",
  previousAttempts: 0,
  supportSystem: "some",
  goal: null,
};

function toggleItem<T>(list: T[], item: T): T[] {
  return list.includes(item) ? list.filter((i) => i !== item) : [...list, item];
}

export function OnboardingWizard() {
  const router = useRouter();
  const { account } = useAuth();
  const { completeOnboarding, updatePlan, state } = useApp();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<FormState>(() => ({
    ...initialForm,
    name: account?.displayName ?? "",
  }));
  const [loadingPlan, setLoadingPlan] = useState(false);
  const [planError, setPlanError] = useState<string | null>(null);
  const [planMeta, setPlanMeta] = useState<AiResponseMeta | null>(null);
  const [usedFallback, setUsedFallback] = useState(false);
  const [generatedPlan, setGeneratedPlan] = useState<RecoveryPlan | null>(null);

  const canAdvance = (() => {
    switch (step) {
      case 1:
        return form.name.trim().length > 0 && form.habit !== null;
      case 2:
        return true;
      case 3:
        return form.triggers.length > 0 && form.peakTimes.length > 0;
      case 4:
        return form.emotionalState.length > 0 && form.motivation.trim().length > 0;
      case 5:
        return form.goal !== null;
      default:
        return true;
    }
  })();

  function finishOnboarding(assessment: OnboardingAssessment, plan: RecoveryPlan) {
    // Retry after a fallback should replace the plan only — keep the same profile/streak.
    if (state.profile?.onboarded) {
      updatePlan(plan);
      return;
    }

    const profile: UserProfile = {
      id: account?.id ?? `user-${Date.now()}`,
      name: assessment.name,
      username: account?.username,
      geminiApiKey: account?.geminiApiKey,
      createdAt: new Date().toISOString(),
      onboarded: true,
      habit: {
        habit: assessment.habit,
        habitLabel: assessment.habitLabel,
        frequencyPerDay: assessment.frequencyPerDay,
        yearsActive: assessment.yearsActive,
        intensity: assessment.intensity,
        triggers: assessment.triggers,
        peakTimes: assessment.peakTimes,
        motivation: assessment.motivation,
        goal: assessment.goal,
      },
      currentPlanId: plan.id,
    };
    completeOnboarding(assessment, profile, plan);
  }

  async function handleGeneratePlan() {
    if (!form.habit || !form.goal) return;
    setStep(6);
    setLoadingPlan(true);
    setPlanError(null);
    setUsedFallback(false);
    setGeneratedPlan(null);
    setPlanMeta(null);

    const assessment: OnboardingAssessment = {
      name: form.name.trim(),
      habit: form.habit,
      habitLabel: habitLabel(form.habit),
      frequencyPerDay: form.frequencyPerDay,
      yearsActive: form.yearsActive,
      intensity: form.intensity,
      triggers: form.triggers,
      peakTimes: form.peakTimes,
      motivation: form.motivation.trim(),
      goal: form.goal,
      emotionalState: form.emotionalState,
      previousAttempts: form.previousAttempts,
      supportSystem: form.supportSystem,
    };

    try {
      const plan = await generateRecoveryPlan(assessment);
      const meta = extractAiMeta(plan);
      setPlanMeta(meta);
      recordLastAiAction("Recovery plan", meta);
      setGeneratedPlan(plan);
      finishOnboarding(assessment, plan);
    } catch (err) {
      const message = getErrorMessage(err, "Could not generate your recovery plan.");
      setPlanError(message);
      const fallback = buildFallbackPlan(assessment);
      setUsedFallback(true);
      setGeneratedPlan(fallback);
      finishOnboarding(assessment, fallback);
    } finally {
      setLoadingPlan(false);
    }
  }

  function handleNext() {
    if (step === 5) {
      void handleGeneratePlan();
      return;
    }
    setStep((s) => Math.min(TOTAL_STEPS, s + 1));
  }

  function handleBack() {
    setStep((s) => Math.max(1, s - 1));
  }

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-2xl flex-col px-6 py-8 sm:py-12">
      {step < 6 && (
        <div className="mb-10">
          <StepProgress step={step} total={TOTAL_STEPS - 1} />
        </div>
      )}

      <div className="flex-1">
        {step === 1 && (
          <WelcomeStep
            name={form.name}
            habit={form.habit}
            onChangeName={(name) => setForm((f) => ({ ...f, name }))}
            onSelectHabit={(habit) => setForm((f) => ({ ...f, habit }))}
          />
        )}
        {step === 2 && (
          <IntensityStep
            habitLabel={form.habit ? habitLabel(form.habit) : "this habit"}
            frequencyPerDay={form.frequencyPerDay}
            yearsActive={form.yearsActive}
            intensity={form.intensity}
            onChangeFrequency={(frequencyPerDay) => setForm((f) => ({ ...f, frequencyPerDay }))}
            onChangeYears={(yearsActive) => setForm((f) => ({ ...f, yearsActive }))}
            onChangeIntensity={(intensity) => setForm((f) => ({ ...f, intensity }))}
          />
        )}
        {step === 3 && (
          <TriggersStep
            triggers={form.triggers}
            peakTimes={form.peakTimes}
            onToggleTrigger={(trigger) => setForm((f) => ({ ...f, triggers: toggleItem(f.triggers, trigger) }))}
            onToggleTime={(time) => setForm((f) => ({ ...f, peakTimes: toggleItem(f.peakTimes, time) }))}
          />
        )}
        {step === 4 && (
          <MotivationStep
            emotionalState={form.emotionalState}
            motivation={form.motivation}
            previousAttempts={form.previousAttempts}
            supportSystem={form.supportSystem}
            onChangeEmotionalState={(emotionalState) => setForm((f) => ({ ...f, emotionalState }))}
            onChangeMotivation={(motivation) => setForm((f) => ({ ...f, motivation }))}
            onChangePreviousAttempts={(previousAttempts) => setForm((f) => ({ ...f, previousAttempts }))}
            onChangeSupportSystem={(supportSystem) => setForm((f) => ({ ...f, supportSystem }))}
          />
        )}
        {step === 5 && <GoalStep goal={form.goal} onSelect={(goal) => setForm((f) => ({ ...f, goal }))} />}
        {step === 6 && (
          <PlanRevealStep
            plan={generatedPlan}
            loading={loadingPlan}
            name={form.name}
            error={planError}
            isFallback={usedFallback}
            meta={planMeta}
            onRetry={() => void handleGeneratePlan()}
            onEnter={() => router.push("/dashboard")}
          />
        )}
      </div>

      {step < 6 && (
        <div className="mt-10 flex items-center gap-3">
          {step > 1 && (
            <Button variant="ghost" size="lg" icon={<ArrowLeft size={18} />} onClick={handleBack}>
              Back
            </Button>
          )}
          <Button size="lg" fullWidth disabled={!canAdvance} onClick={handleNext} iconRight={<ArrowRight size={18} />}>
            {step === 5 ? "Generate my plan" : "Continue"}
          </Button>
        </div>
      )}
    </div>
  );
}

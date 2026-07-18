"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, ArrowRight } from "lucide-react";
import type {
  HabitType,
  OnboardingAssessment,
  RecoveryGoal,
  RecoveryPlan,
  TimeOfDay,
  TriggerCategory,
  UserProfile,
} from "@/lib/types";
import { Button } from "@/components/ui/Button";
import { StepProgress } from "@/components/onboarding/StepProgress";
import { WelcomeStep } from "@/components/onboarding/WelcomeStep";
import { IntensityStep } from "@/components/onboarding/IntensityStep";
import { TriggersStep } from "@/components/onboarding/TriggersStep";
import { MotivationStep } from "@/components/onboarding/MotivationStep";
import { GoalStep } from "@/components/onboarding/GoalStep";
import { PlanRevealStep } from "@/components/onboarding/PlanRevealStep";
import { habitLabel } from "@/lib/utils/labels";
import { habitFromAssessment, newHabitId } from "@/lib/utils/habits";
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
  const searchParams = useSearchParams();
  const mode = searchParams.get("mode");
  const isAddHabit = mode === "add";

  const { account } = useAuth();
  const { completeOnboarding, updatePlan, addHabit, state } = useApp();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<FormState>(() => ({
    ...initialForm,
    name: state.profile?.name || account?.displayName || "",
  }));
  const [loadingPlan, setLoadingPlan] = useState(false);
  const [planError, setPlanError] = useState<string | null>(null);
  const [planMeta, setPlanMeta] = useState<AiResponseMeta | null>(null);
  const [usedFallback, setUsedFallback] = useState(false);
  const [generatedPlan, setGeneratedPlan] = useState<RecoveryPlan | null>(null);
  const [pendingHabitId] = useState(() => newHabitId());

  const existingHabitTypes = useMemo(
    () => (isAddHabit ? (state.profile?.habits ?? []).map((h) => h.habit) : []),
    [isAddHabit, state.profile?.habits],
  );

  const canAdvance = (() => {
    switch (step) {
      case 1:
        return (isAddHabit || form.name.trim().length > 0) && form.habit !== null;
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

  function finishFirstOnboarding(assessment: OnboardingAssessment, plan: RecoveryPlan) {
    // Retry after a fallback should replace the plan only — keep the same profile/streak.
    if (state.profile?.onboarded && !isAddHabit) {
      updatePlan(plan);
      return;
    }

    const habit = habitFromAssessment(assessment, pendingHabitId);
    const linkedPlan = { ...plan, habitId: habit.id };
    const profile: UserProfile = {
      id: account?.id ?? `user-${Date.now()}`,
      name: assessment.name,
      username: account?.username,
      geminiApiKey: account?.geminiApiKey,
      createdAt: new Date().toISOString(),
      onboarded: true,
      habit,
      habits: [habit],
      activeHabitId: habit.id,
      currentPlanId: linkedPlan.id,
    };
    completeOnboarding(assessment, profile, linkedPlan);
  }

  function finishAddHabit(assessment: OnboardingAssessment, plan: RecoveryPlan) {
    const habit = habitFromAssessment(assessment, pendingHabitId);
    const linkedPlan = { ...plan, habitId: habit.id };
    addHabit(habit, linkedPlan, true);
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
      name: (form.name.trim() || state.profile?.name || "friend"),
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
      recordLastAiAction(isAddHabit ? "Add habit plan" : "Recovery plan", meta);
      setGeneratedPlan(plan);
      if (isAddHabit) finishAddHabit(assessment, plan);
      else finishFirstOnboarding(assessment, plan);
    } catch (err) {
      const message = getErrorMessage(err, "Could not generate your recovery plan.");
      setPlanError(message);
      const fallback = buildFallbackPlan(assessment);
      setUsedFallback(true);
      setGeneratedPlan(fallback);
      if (isAddHabit) finishAddHabit(assessment, fallback);
      else finishFirstOnboarding(assessment, fallback);
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
    if (step === 1 && isAddHabit) {
      router.push("/profile");
      return;
    }
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
            hideName={isAddHabit}
            eyebrow={isAddHabit ? "Add habit" : "Step 1 of 6"}
            title={isAddHabit ? "Add another habit to work on" : "Let's get to know what you're working on"}
            description={
              isAddHabit
                ? "We'll build a separate plan for this habit. You can switch between habits anytime from Profile."
                : "No judgment here — just context so your coach can actually help."
            }
            disabledHabits={existingHabitTypes}
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
            name={form.name || state.profile?.name || "friend"}
            error={planError}
            isFallback={usedFallback}
            meta={planMeta}
            onRetry={() => void handleGeneratePlan()}
            onEnter={() => router.push(isAddHabit ? "/profile" : "/dashboard")}
          />
        )}
      </div>

      {step < 6 && (
        <div className="mt-10 flex items-center gap-3">
          {(step > 1 || isAddHabit) && (
            <Button variant="ghost" size="lg" icon={<ArrowLeft size={18} />} onClick={handleBack}>
              Back
            </Button>
          )}
          <Button size="lg" fullWidth disabled={!canAdvance} onClick={handleNext} iconRight={<ArrowRight size={18} />}>
            {step === 5 ? (isAddHabit ? "Generate plan & add" : "Generate my plan") : "Continue"}
          </Button>
        </div>
      )}
    </div>
  );
}

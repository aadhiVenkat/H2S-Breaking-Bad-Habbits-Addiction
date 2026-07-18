"use client";

import type { RecoveryGoal } from "@/lib/types";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { GOAL_OPTIONS } from "@/components/onboarding/onboardingOptions";
import { cn } from "@/lib/utils/cn";

interface GoalStepProps {
  goal: RecoveryGoal | null;
  onSelect: (goal: RecoveryGoal) => void;
}

export function GoalStep({ goal, onSelect }: GoalStepProps) {
  return (
    <div className="space-y-8">
      <SectionHeading eyebrow="Step 5 of 6" title="What does success look like for you?" description="You can always change this later — nothing here is permanent." />

      <div className="space-y-3" role="radiogroup" aria-label="Recovery goal">
        {GOAL_OPTIONS.map((option) => (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={goal === option.value}
            onClick={() => onSelect(option.value)}
            className={cn(
              "w-full rounded-2xl border px-5 py-4 text-left transition-all duration-150 active:scale-[0.99]",
              goal === option.value ? "border-accent/50 bg-accent-soft" : "border-border-soft bg-surface-raised hover:border-border-soft",
            )}
          >
            <p className={cn("text-sm font-semibold", goal === option.value ? "text-accent" : "text-foreground")}>{option.label}</p>
            <p className="mt-1 text-sm text-foreground-muted">{option.description}</p>
          </button>
        ))}
      </div>
    </div>
  );
}

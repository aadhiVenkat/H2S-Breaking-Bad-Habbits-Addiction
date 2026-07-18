"use client";

import type { HabitType } from "@/lib/types";
import { Input } from "@/components/ui/Input";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { HABIT_OPTIONS } from "@/components/onboarding/onboardingOptions";
import { cn } from "@/lib/utils/cn";

interface WelcomeStepProps {
  name: string;
  habit: HabitType | null;
  onChangeName: (name: string) => void;
  onSelectHabit: (habit: HabitType) => void;
}

export function WelcomeStep({ name, habit, onChangeName, onSelectHabit }: WelcomeStepProps) {
  return (
    <div className="space-y-8">
      <SectionHeading
        eyebrow="Step 1 of 6"
        title="Let's get to know what you're working on"
        description="No judgment here — just context so your coach can actually help."
      />

      <div className="space-y-2">
        <label htmlFor="onboarding-name" className="text-sm font-medium text-foreground-muted">
          What should I call you?
        </label>
        <Input
          id="onboarding-name"
          value={name}
          onChange={(e) => onChangeName(e.target.value)}
          placeholder="First name"
          autoFocus
          autoComplete="given-name"
        />
      </div>

      <div className="space-y-2" role="group" aria-labelledby="onboarding-habit-label">
        <p id="onboarding-habit-label" className="text-sm font-medium text-foreground-muted">
          Which habit are you working on right now?
        </p>
        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
          {HABIT_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              aria-pressed={habit === option.value}
              onClick={() => onSelectHabit(option.value)}
              className={cn(
                "flex flex-col items-start gap-1.5 rounded-xl border px-4 py-3.5 text-left transition-all duration-150 active:scale-[0.97]",
                habit === option.value
                  ? "border-accent/50 bg-accent-soft"
                  : "border-border-soft bg-surface-raised hover:border-border-soft",
              )}
            >
              <span className="text-xl" aria-hidden="true">
                {option.emoji}
              </span>
              <span className={cn("text-sm font-medium", habit === option.value ? "text-accent" : "text-foreground")}>
                {option.label}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

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
  /** When adding another habit, hide the name field. */
  hideName?: boolean;
  title?: string;
  description?: string;
  eyebrow?: string;
  /** Habit types already tracked — shown disabled. */
  disabledHabits?: HabitType[];
}

export function WelcomeStep({
  name,
  habit,
  onChangeName,
  onSelectHabit,
  hideName = false,
  title = "Let's get to know what you're working on",
  description = "No judgment here — just context so your coach can actually help.",
  eyebrow = "Step 1 of 6",
  disabledHabits = [],
}: WelcomeStepProps) {
  return (
    <div className="space-y-8">
      <SectionHeading eyebrow={eyebrow} title={title} description={description} />

      {!hideName && (
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
      )}

      <div className="space-y-2" role="group" aria-labelledby="onboarding-habit-label">
        <p id="onboarding-habit-label" className="text-sm font-medium text-foreground-muted">
          Which habit are you working on right now?
        </p>
        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
          {HABIT_OPTIONS.map((option) => {
            const disabled = disabledHabits.includes(option.value);
            const selected = habit === option.value;
            return (
              <button
                key={option.value}
                type="button"
                disabled={disabled}
                aria-pressed={selected}
                onClick={() => onSelectHabit(option.value)}
                className={cn(
                  "flex flex-col items-start gap-1.5 rounded-xl border px-4 py-3.5 text-left transition-all duration-150 active:scale-[0.97]",
                  disabled && "cursor-not-allowed opacity-40",
                  selected
                    ? "border-accent/50 bg-accent-soft"
                    : "border-border-soft bg-surface-raised hover:border-border-soft",
                )}
              >
                <span className="text-xl" aria-hidden="true">
                  {option.emoji}
                </span>
                <span className={cn("text-sm font-medium", selected ? "text-accent" : "text-foreground")}>
                  {option.label}
                  {disabled ? " (already added)" : ""}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

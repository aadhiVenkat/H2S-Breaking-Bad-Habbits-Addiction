"use client";

import { SectionHeading } from "@/components/ui/SectionHeading";
import { Textarea } from "@/components/ui/Textarea";
import { Chip } from "@/components/ui/Chip";
import { SUPPORT_OPTIONS } from "@/components/onboarding/onboardingOptions";

interface MotivationStepProps {
  emotionalState: string;
  motivation: string;
  previousAttempts: number;
  supportSystem: "strong" | "some" | "none";
  onChangeEmotionalState: (value: string) => void;
  onChangeMotivation: (value: string) => void;
  onChangePreviousAttempts: (value: number) => void;
  onChangeSupportSystem: (value: "strong" | "some" | "none") => void;
}

const EMOTIONAL_STATES = ["Hopeful", "Frustrated", "Anxious", "Determined", "Exhausted", "Curious"];

export function MotivationStep({
  emotionalState,
  motivation,
  previousAttempts,
  supportSystem,
  onChangeEmotionalState,
  onChangeMotivation,
  onChangePreviousAttempts,
  onChangeSupportSystem,
}: MotivationStepProps) {
  return (
    <div className="space-y-8">
      <SectionHeading eyebrow="Step 4 of 6" title="What's driving this for you?" description="This is what your coach will remind you of on hard days." />

      <div className="space-y-3" role="group" aria-labelledby="emotional-state-label">
        <p id="emotional-state-label" className="text-sm font-medium text-foreground-muted">
          How are you feeling about this right now?
        </p>
        <div className="flex flex-wrap gap-2">
          {EMOTIONAL_STATES.map((state) => (
            <Chip key={state} selected={emotionalState === state} onClick={() => onChangeEmotionalState(state)}>
              {state}
            </Chip>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor="onboarding-motivation" className="text-sm font-medium text-foreground-muted">
          Why does this matter to you?
        </label>
        <Textarea
          id="onboarding-motivation"
          value={motivation}
          onChange={(e) => onChangeMotivation(e.target.value)}
          rows={3}
          placeholder="e.g. I want more energy for my kids, I'm tired of losing hours to it, I want to feel in control again..."
        />
      </div>

      <div className="space-y-3" role="group" aria-labelledby="previous-attempts-label">
        <p id="previous-attempts-label" className="text-sm font-medium text-foreground-muted">
          Have you tried to change this before?
        </p>
        <div className="flex flex-wrap gap-2">
          {[0, 1, 2, 3].map((n) => (
            <Chip key={n} selected={previousAttempts === n} onClick={() => onChangePreviousAttempts(n)}>
              {n === 0 ? "This is my first try" : n === 3 ? "3+ times" : `${n} time${n > 1 ? "s" : ""}`}
            </Chip>
          ))}
        </div>
      </div>

      <div className="space-y-3" role="group" aria-labelledby="support-system-label">
        <p id="support-system-label" className="text-sm font-medium text-foreground-muted">
          Do you have people around you who support this?
        </p>
        <div className="flex flex-wrap gap-2">
          {SUPPORT_OPTIONS.map((option) => (
            <Chip key={option.value} selected={supportSystem === option.value} onClick={() => onChangeSupportSystem(option.value)}>
              {option.label}
            </Chip>
          ))}
        </div>
      </div>
    </div>
  );
}

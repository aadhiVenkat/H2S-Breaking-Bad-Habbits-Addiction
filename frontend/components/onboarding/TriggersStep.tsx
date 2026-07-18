"use client";

import type { TimeOfDay, TriggerCategory } from "@/lib/types";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Chip } from "@/components/ui/Chip";
import { TIME_OPTIONS, TRIGGER_OPTIONS } from "@/components/onboarding/onboardingOptions";

interface TriggersStepProps {
  triggers: TriggerCategory[];
  peakTimes: TimeOfDay[];
  onToggleTrigger: (trigger: TriggerCategory) => void;
  onToggleTime: (time: TimeOfDay) => void;
}

export function TriggersStep({ triggers, peakTimes, onToggleTrigger, onToggleTime }: TriggersStepProps) {
  return (
    <div className="space-y-8">
      <SectionHeading
        eyebrow="Step 3 of 6"
        title="What usually sets it off?"
        description="Pick everything that applies — patterns matter more than any single moment."
      />

      <div className="space-y-3" role="group" aria-labelledby="triggers-label">
        <p id="triggers-label" className="text-sm font-medium text-foreground-muted">
          Common triggers
        </p>
        <div className="flex flex-wrap gap-2">
          {TRIGGER_OPTIONS.map((option) => (
            <Chip key={option.value} selected={triggers.includes(option.value)} onClick={() => onToggleTrigger(option.value)}>
              {option.label}
            </Chip>
          ))}
        </div>
      </div>

      <div className="space-y-3" role="group" aria-labelledby="peak-times-label">
        <p id="peak-times-label" className="text-sm font-medium text-foreground-muted">
          When does it tend to happen?
        </p>
        <div className="flex flex-wrap gap-2">
          {TIME_OPTIONS.map((option) => (
            <Chip key={option.value} selected={peakTimes.includes(option.value)} onClick={() => onToggleTime(option.value)}>
              {option.label}
            </Chip>
          ))}
        </div>
      </div>
    </div>
  );
}

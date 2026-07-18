"use client";

import { SectionHeading } from "@/components/ui/SectionHeading";
import { Slider } from "@/components/ui/Slider";
import { Chip } from "@/components/ui/Chip";

interface IntensityStepProps {
  habitLabel: string;
  frequencyPerDay: number;
  yearsActive: number;
  intensity: 1 | 2 | 3 | 4 | 5;
  onChangeFrequency: (value: number) => void;
  onChangeYears: (value: number) => void;
  onChangeIntensity: (value: 1 | 2 | 3 | 4 | 5) => void;
}

export function IntensityStep({
  habitLabel,
  frequencyPerDay,
  yearsActive,
  intensity,
  onChangeFrequency,
  onChangeYears,
  onChangeIntensity,
}: IntensityStepProps) {
  return (
    <div className="space-y-8">
      <SectionHeading
        eyebrow="Step 2 of 6"
        title={`How much room does ${habitLabel.toLowerCase()} take up?`}
        description="Rough numbers are fine — this just helps calibrate your plan."
      />

      <div className="space-y-3">
        <div className="flex items-baseline justify-between">
          <label htmlFor="onboarding-frequency" className="text-sm font-medium text-foreground-muted">
            Roughly how many times a day?
          </label>
          <span className="text-lg font-semibold text-accent" aria-live="polite">
            {frequencyPerDay}x
          </span>
        </div>
        <Slider
          id="onboarding-frequency"
          value={frequencyPerDay}
          min={0}
          max={40}
          step={1}
          onChange={onChangeFrequency}
          lowLabel="Rarely"
          highLabel="Constantly"
        />
      </div>

      <div className="space-y-3">
        <div className="flex items-baseline justify-between">
          <label htmlFor="onboarding-years" className="text-sm font-medium text-foreground-muted">
            How long has this been part of your life?
          </label>
          <span className="text-lg font-semibold text-accent" aria-live="polite">
            {yearsActive === 0 ? "<1 yr" : `${yearsActive} yr${yearsActive > 1 ? "s" : ""}`}
          </span>
        </div>
        <Slider
          id="onboarding-years"
          value={yearsActive}
          min={0}
          max={20}
          step={1}
          onChange={onChangeYears}
          lowLabel="New"
          highLabel="20+ years"
        />
      </div>

      <div className="space-y-3" role="group" aria-labelledby="intensity-control-label">
        <p id="intensity-control-label" className="text-sm font-medium text-foreground-muted">
          How much control do you feel you have over it?
        </p>
        <div className="flex flex-wrap gap-2">
          {[1, 2, 3, 4, 5].map((level) => (
            <Chip key={level} selected={intensity === level} onClick={() => onChangeIntensity(level as 1 | 2 | 3 | 4 | 5)}>
              {level === 1 ? "Full control" : level === 5 ? "Feels automatic" : `Level ${level}`}
            </Chip>
          ))}
        </div>
      </div>
    </div>
  );
}

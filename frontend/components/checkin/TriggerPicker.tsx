"use client";

import type { TriggerCategory } from "@/lib/types";
import { Chip } from "@/components/ui/Chip";
import { TRIGGER_OPTIONS } from "@/components/onboarding/onboardingOptions";

interface TriggerPickerProps {
  value: TriggerCategory[];
  onToggle: (trigger: TriggerCategory) => void;
}

export function TriggerPicker({ value, onToggle }: TriggerPickerProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {TRIGGER_OPTIONS.map((option) => (
        <Chip key={option.value} selected={value.includes(option.value)} onClick={() => onToggle(option.value)}>
          {option.label}
        </Chip>
      ))}
    </div>
  );
}

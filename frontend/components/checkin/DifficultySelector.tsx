"use client";

import { Chip } from "@/components/ui/Chip";

const LABELS = ["Very easy", "Easy", "Moderate", "Hard", "Very hard"];

export function DifficultySelector({ value, onChange }: { value: number | null; onChange: (v: 1 | 2 | 3 | 4 | 5) => void }) {
  return (
    <div className="flex flex-wrap gap-2">
      {LABELS.map((label, i) => {
        const level = (i + 1) as 1 | 2 | 3 | 4 | 5;
        return (
          <Chip key={label} selected={value === level} onClick={() => onChange(level)}>
            {label}
          </Chip>
        );
      })}
    </div>
  );
}

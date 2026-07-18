"use client";

import type { MoodLevel } from "@/lib/types";
import { cn } from "@/lib/utils/cn";

const MOODS: { level: MoodLevel; emoji: string; label: string }[] = [
  { level: 1, emoji: "😞", label: "Rough" },
  { level: 2, emoji: "😕", label: "Low" },
  { level: 3, emoji: "😐", label: "Okay" },
  { level: 4, emoji: "🙂", label: "Good" },
  { level: 5, emoji: "😄", label: "Great" },
];

export function MoodSelector({ value, onChange }: { value: MoodLevel | null; onChange: (mood: MoodLevel) => void }) {
  return (
    <div className="flex justify-between gap-2">
      {MOODS.map((mood) => (
        <button
          key={mood.level}
          type="button"
          onClick={() => onChange(mood.level)}
          className={cn(
            "flex flex-1 flex-col items-center gap-1.5 rounded-xl border py-3 transition-all duration-150 active:scale-95",
            value === mood.level ? "border-accent/50 bg-accent-soft" : "border-border-soft bg-surface-raised hover:border-border-soft",
          )}
        >
          <span className="text-2xl">{mood.emoji}</span>
          <span className={cn("text-[11px] font-medium", value === mood.level ? "text-accent" : "text-foreground-subtle")}>
            {mood.label}
          </span>
        </button>
      ))}
    </div>
  );
}

"use client";

interface StreakRingProps {
  currentStreak: number;
  nextMilestone: number | null;
}

export function StreakRing({ currentStreak, nextMilestone }: StreakRingProps) {
  const target = nextMilestone ?? Math.max(currentStreak + 1, 30);
  const pct = Math.min(100, (currentStreak / target) * 100);
  const radius = 58;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (pct / 100) * circumference;

  return (
    <div className="relative flex h-40 w-40 items-center justify-center shrink-0">
      <svg width="140" height="140" viewBox="0 0 140 140" className="rotate-[-90deg]">
        <circle cx="70" cy="70" r={radius} fill="none" stroke="var(--overlay-strong)" strokeWidth="10" />
        <circle
          cx="70"
          cy="70"
          r={radius}
          fill="none"
          stroke="var(--accent)"
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-3xl font-bold text-foreground">{currentStreak}</span>
        <span className="text-xs text-foreground-muted">day{currentStreak === 1 ? "" : "s"} strong</span>
      </div>
    </div>
  );
}

import { cn } from "@/lib/utils/cn";

interface ProgressProps {
  value: number;
  max?: number;
  className?: string;
  trackClassName?: string;
  barClassName?: string;
}

export function Progress({ value, max = 100, className, trackClassName, barClassName }: ProgressProps) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  return (
    <div className={cn("h-2 w-full overflow-hidden rounded-full bg-overlay-strong", trackClassName, className)}>
      <div
        className={cn("h-full rounded-full bg-gradient-to-r from-accent to-accent-strong transition-all duration-700 ease-out", barClassName)}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

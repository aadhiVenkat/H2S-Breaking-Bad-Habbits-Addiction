import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils/cn";

type Tone = "accent" | "neutral" | "warn" | "danger";

const toneClasses: Record<Tone, string> = {
  accent: "bg-accent-soft text-accent border-accent/20",
  neutral: "bg-overlay-strong text-foreground-muted border-border-soft",
  warn: "bg-warn/10 text-warn border-warn/25",
  danger: "bg-danger-soft text-danger border-danger/25",
};

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: Tone;
}

export function Badge({ className, tone = "neutral", ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium",
        toneClasses[tone],
        className,
      )}
      {...props}
    />
  );
}

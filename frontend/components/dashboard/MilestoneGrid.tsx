import { Lock, Check } from "lucide-react";
import type { Milestone } from "@/lib/types";
import { cn } from "@/lib/utils/cn";

export function MilestoneGrid({ milestones }: { milestones: Milestone[] }) {
  return (
    <div className="grid grid-cols-3 gap-2.5 sm:grid-cols-5">
      {milestones.map((m) => (
        <div
          key={m.id}
          className={cn(
            "flex flex-col items-center gap-1.5 rounded-xl border px-2 py-3.5 text-center transition-colors",
            m.unlocked ? "border-accent/30 bg-accent-soft" : "border-border-subtle bg-overlay",
          )}
          title={m.description}
        >
          <div
            className={cn(
              "flex h-8 w-8 items-center justify-center rounded-full",
              m.unlocked ? "bg-accent text-background" : "bg-overlay-strong text-foreground-subtle",
            )}
          >
            {m.unlocked ? <Check size={14} /> : <Lock size={12} />}
          </div>
          <p className={cn("text-xs font-semibold", m.unlocked ? "text-accent" : "text-foreground-subtle")}>{m.days}d</p>
        </div>
      ))}
    </div>
  );
}

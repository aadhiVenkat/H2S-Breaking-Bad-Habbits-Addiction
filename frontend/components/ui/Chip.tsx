import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils/cn";

interface ChipProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  selected?: boolean;
}

export function Chip({ className, selected, ...props }: ChipProps) {
  return (
    <button
      type="button"
      className={cn(
        "rounded-xl border px-4 py-2.5 text-sm font-medium transition-all duration-150 active:scale-[0.97]",
        selected
          ? "border-accent/50 bg-accent-soft text-accent"
          : "border-border-soft bg-surface-raised text-foreground-muted hover:border-border-soft hover:text-foreground",
        className,
      )}
      {...props}
      aria-pressed={selected ?? false}
    />
  );
}

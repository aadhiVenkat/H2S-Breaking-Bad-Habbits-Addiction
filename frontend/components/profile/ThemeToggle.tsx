"use client";

import { Monitor, Moon, Sun } from "lucide-react";
import { useTheme, type ThemePreference } from "@/lib/theme/ThemeProvider";
import { cn } from "@/lib/utils/cn";

const OPTIONS: { value: ThemePreference; label: string; icon: typeof Sun }[] = [
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
  { value: "system", label: "System", icon: Monitor },
];

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, setTheme } = useTheme();

  return (
    <div className={cn("space-y-2", className)}>
      <p className="text-sm font-medium text-foreground">Appearance</p>
      <div
        role="radiogroup"
        aria-label="Theme"
        className="grid grid-cols-3 gap-1.5 rounded-xl border border-border-subtle bg-overlay p-1"
      >
        {OPTIONS.map(({ value, label, icon: Icon }) => {
          const active = theme === value;
          return (
            <button
              key={value}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => setTheme(value)}
              className={cn(
                "flex items-center justify-center gap-1.5 rounded-lg px-2.5 py-2 text-xs font-semibold transition-colors",
                active
                  ? "bg-surface-raised text-foreground shadow-sm border border-border-soft"
                  : "text-foreground-muted hover:text-foreground hover:bg-overlay-strong",
              )}
            >
              <Icon size={14} aria-hidden />
              {label}
            </button>
          );
        })}
      </div>
      <p className="text-xs text-foreground-subtle">Appearance is saved in this browser.</p>
    </div>
  );
}

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { HeartHandshake, LifeBuoy } from "lucide-react";
import { NAV_ITEMS } from "@/components/layout/navConfig";
import { ThemeToggle } from "@/components/profile/ThemeToggle";
import { cn } from "@/lib/utils/cn";
import { useApp } from "@/lib/store/AppContext";

export function Sidebar() {
  const pathname = usePathname();
  const { state } = useApp();

  return (
    <aside className="hidden lg:flex lg:w-64 lg:flex-col lg:border-r lg:border-border-subtle lg:px-4 lg:py-6 lg:shrink-0">
      <div className="mb-8 flex items-center justify-between gap-2 px-2">
        <Link href="/dashboard" className="flex min-w-0 items-center gap-2">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-accent-soft">
            <span className="h-3 w-3 rounded-full bg-accent" />
          </span>
          <span className="truncate font-serif text-xl italic text-foreground">Reclaim AI</span>
        </Link>
        <ThemeToggle compact />
      </div>

      <nav className="flex-1 space-y-1">
        {NAV_ITEMS.map((item) => {
          const active = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                active ? "bg-accent-soft text-accent" : "text-foreground-muted hover:bg-overlay-strong hover:text-foreground",
              )}
            >
              <Icon size={18} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-4 space-y-2">
        <Link
          href="/emergency"
          className="flex items-center gap-3 rounded-xl border border-danger/25 bg-danger-soft px-3 py-2.5 text-sm font-semibold text-danger hover:bg-danger/20 transition-colors"
        >
          <LifeBuoy size={18} />
          Emergency support
        </Link>
        <Link
          href="/relapse"
          aria-current={pathname === "/relapse" ? "page" : undefined}
          className={cn(
            "flex items-center gap-3 rounded-xl border px-3 py-2.5 text-sm font-semibold transition-colors",
            pathname === "/relapse"
              ? "border-accent/30 bg-accent-soft text-accent"
              : "border-border-soft bg-overlay text-foreground-muted hover:border-accent/25 hover:text-foreground",
          )}
        >
          <HeartHandshake size={18} />
          Relapse reflection
        </Link>
      </div>

      {state.profile && (
        <div className="mt-6 rounded-xl border border-border-subtle bg-overlay px-3 py-3">
          <p className="text-xs text-foreground-subtle">Current streak</p>
          <p className="text-lg font-semibold text-accent">{state.streak.currentStreakDays} days</p>
        </div>
      )}
    </aside>
  );
}

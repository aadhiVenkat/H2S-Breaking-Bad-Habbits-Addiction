"use client";

import Link from "next/link";
import { Flame } from "lucide-react";
import { useApp } from "@/lib/store/AppContext";

export function Topbar() {
  const { state } = useApp();

  return (
    <header className="lg:hidden sticky top-0 z-30 glass-surface border-b border-border-subtle px-4 py-3 flex items-center justify-between">
      <Link href="/dashboard" className="flex items-center gap-2">
        <span className="h-7 w-7 rounded-lg bg-accent-soft flex items-center justify-center">
          <span className="h-2.5 w-2.5 rounded-full bg-accent" />
        </span>
        <span className="font-serif text-lg italic text-foreground">Reclaim AI</span>
      </Link>
      {state.profile && (
        <div className="flex items-center gap-1.5 rounded-full border border-border-soft bg-overlay px-3 py-1.5 text-xs font-semibold text-accent">
          <Flame size={14} />
          {state.streak.currentStreakDays}d
        </div>
      )}
    </header>
  );
}

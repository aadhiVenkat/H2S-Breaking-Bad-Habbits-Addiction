"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { BottomNav } from "@/components/layout/BottomNav";
import { EmergencyFAB } from "@/components/layout/EmergencyFAB";
import { Topbar } from "@/components/layout/Topbar";
import { SHELL_ROUTES } from "@/components/layout/navConfig";
import { AuthGuard } from "@/components/system/AuthGuard";
import { OnboardingGate } from "@/components/system/OnboardingGate";

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const useShell = SHELL_ROUTES.some((route) => pathname === route || pathname.startsWith(`${route}/`));

  if (!useShell) {
    return (
      <AuthGuard>
        <OnboardingGate>{children}</OnboardingGate>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard>
      <OnboardingGate>
        <div className="flex min-h-screen w-full">
          <Sidebar />
          <div className="flex min-h-screen flex-1 flex-col">
            <Topbar />
            <main className="flex-1 pb-24 lg:pb-10">{children}</main>
          </div>
          <BottomNav />
          <EmergencyFAB />
        </div>
      </OnboardingGate>
    </AuthGuard>
  );
}

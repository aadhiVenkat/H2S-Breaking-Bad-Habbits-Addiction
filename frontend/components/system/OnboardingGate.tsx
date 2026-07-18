"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useApp } from "@/lib/store/AppContext";

const OPEN_ROUTES = new Set(["/", "/login", "/onboarding"]);

/**
 * Redirects non-onboarded users to /onboarding for app shell routes.
 * Landing, login, and onboarding stay open. Onboarded profiles pass through.
 */
export function OnboardingGate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { state } = useApp();

  const isOpen = OPEN_ROUTES.has(pathname);
  const needsGate = state.hydrated && !isOpen && !state.profile?.onboarded;

  useEffect(() => {
    if (needsGate) {
      router.replace("/onboarding");
    }
  }, [needsGate, router]);

  if (!state.hydrated && !isOpen) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-sm text-foreground-muted">
        Loading…
      </div>
    );
  }

  if (needsGate) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-sm text-foreground-muted">
        Redirecting to onboarding…
      </div>
    );
  }

  return <>{children}</>;
}

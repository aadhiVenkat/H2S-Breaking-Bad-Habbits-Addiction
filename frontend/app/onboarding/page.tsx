"use client";

import { Suspense } from "react";
import { OnboardingWizard } from "@/components/onboarding/OnboardingWizard";

export default function OnboardingPage() {
  return (
    <Suspense fallback={<div className="p-8 text-sm text-foreground-muted">Loading…</div>}>
      <OnboardingWizard />
    </Suspense>
  );
}

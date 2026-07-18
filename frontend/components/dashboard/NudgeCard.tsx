import Link from "next/link";
import { Sparkles } from "lucide-react";
import type { Nudge } from "@/lib/types";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

const TONE_LABEL: Record<Nudge["tone"], string> = {
  encouragement: "Encouragement",
  check_in: "Check-in",
  milestone: "Milestone",
  trigger_alert: "Heads up",
  celebration: "Celebration",
};

export function NudgeCard({ nudge }: { nudge: Nudge }) {
  return (
    <Card className="bg-gradient-to-br from-accent-soft to-transparent border-accent/15">
      <div className="flex items-start gap-3">
        <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-accent-soft">
          <Sparkles size={16} className="text-accent" />
        </div>
        <div className="flex-1 space-y-2">
          <Badge tone="accent">{TONE_LABEL[nudge.tone]}</Badge>
          <p className="text-sm leading-relaxed text-foreground">{nudge.message}</p>
          {nudge.actionHref && nudge.actionLabel && (
            <Link href={nudge.actionHref} className="inline-block text-sm font-semibold text-accent hover:underline">
              {nudge.actionLabel} →
            </Link>
          )}
        </div>
      </div>
    </Card>
  );
}

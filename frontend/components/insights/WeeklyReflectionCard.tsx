import { CheckCircle2, Sparkles, TrendingDown, TrendingUp, Minus } from "lucide-react";
import type { AIInsight } from "@/lib/types";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { AILoadingDots } from "@/components/ui/AILoadingDots";

const TREND_ICON = {
  improving: TrendingDown,
  steady: Minus,
  needs_support: TrendingUp,
};

const TREND_LABEL = {
  improving: "Improving",
  steady: "Steady",
  needs_support: "Needs support",
};

interface WeeklyReflectionCardProps {
  insight: AIInsight | null;
  loading: boolean;
  onRegenerate: () => void;
}

export function WeeklyReflectionCard({ insight, loading, onRegenerate }: WeeklyReflectionCardProps) {
  return (
    <Card className="border-accent/15 bg-gradient-to-br from-accent-soft/50 to-transparent">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles size={14} className="text-accent" /> AI weekly reflection
        </CardTitle>
        {insight && (
          <Badge tone={insight.trendDirection === "needs_support" ? "warn" : "accent"}>
            {(() => {
              const Icon = TREND_ICON[insight.trendDirection];
              return <Icon size={12} />;
            })()}
            {TREND_LABEL[insight.trendDirection]}
          </Badge>
        )}
      </CardHeader>

      {loading ? (
        <AILoadingDots label="Reviewing your week" />
      ) : insight ? (
        <div className="space-y-3">
          <p className="text-sm font-semibold text-foreground">{insight.headline}</p>
          <p className="text-sm leading-relaxed text-foreground-muted">{insight.reflection}</p>
          <ul className="space-y-1.5">
            {insight.suggestions.map((s) => (
              <li key={s} className="flex items-start gap-2 text-sm text-foreground-muted">
                <CheckCircle2 size={14} className="mt-0.5 shrink-0 text-accent/60" />
                {s}
              </li>
            ))}
          </ul>
          <Button size="sm" variant="secondary" onClick={onRegenerate}>
            Generate new reflection
          </Button>
        </div>
      ) : (
        <Button size="sm" onClick={onRegenerate}>
          Generate this week&apos;s reflection
        </Button>
      )}
    </Card>
  );
}

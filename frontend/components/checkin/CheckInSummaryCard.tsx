import Link from "next/link";
import { Sparkles, ArrowRight } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

interface CheckInSummaryCardProps {
  summary: string;
  guidance: string;
}

export function CheckInSummaryCard({ summary, guidance }: CheckInSummaryCardProps) {
  return (
    <Card className="border-accent/20 bg-gradient-to-br from-accent-soft/70 to-transparent animate-fade-in-up">
      <Badge tone="accent" className="mb-3">
        <Sparkles size={12} /> AI reflection
      </Badge>
      <p className="mb-3 text-sm leading-relaxed text-foreground">{summary}</p>
      <p className="mb-4 text-sm leading-relaxed text-foreground-muted">{guidance}</p>
      <div className="flex flex-wrap gap-3">
        <Link href="/dashboard" className="inline-flex items-center gap-1 text-sm font-semibold text-accent hover:underline">
          Back to dashboard <ArrowRight size={14} />
        </Link>
        <Link href="/coach" className="inline-flex items-center gap-1 text-sm font-semibold text-foreground-muted hover:text-foreground">
          Talk to your coach about it
        </Link>
      </div>
    </Card>
  );
}

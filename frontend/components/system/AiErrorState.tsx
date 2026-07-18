"use client";

import { AlertCircle, RefreshCw } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

export function AiErrorState({
  message,
  onRetry,
  compact,
}: {
  message: string;
  onRetry?: () => void;
  compact?: boolean;
}) {
  return (
    <Card className={compact ? "border-danger/20 bg-danger-soft/40 p-4" : "border-danger/20 bg-danger-soft/30"}>
      <div className="flex items-start gap-3">
        <AlertCircle size={18} className="mt-0.5 shrink-0 text-danger" />
        <div className="flex-1 space-y-3">
          <div>
            <p className="text-sm font-semibold text-foreground">AI request failed</p>
            <p className="mt-1 text-sm text-foreground-muted leading-relaxed">{message}</p>
          </div>
          {onRetry && (
            <Button size="sm" variant="secondary" icon={<RefreshCw size={14} />} onClick={onRetry}>
              Retry
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}

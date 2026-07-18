import type { ReactNode } from "react";
import { Card } from "@/components/ui/Card";

export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon?: ReactNode;
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <Card className="flex flex-col items-center gap-3 py-10 text-center">
      {icon && <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-overlay">{icon}</div>}
      <div className="space-y-1.5">
        <p className="text-sm font-semibold text-foreground">{title}</p>
        <p className="max-w-sm text-sm text-foreground-muted leading-relaxed">{description}</p>
      </div>
      {action}
    </Card>
  );
}

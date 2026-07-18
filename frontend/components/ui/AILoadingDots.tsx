import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export function AILoadingDots({ label, className }: { label?: string; className?: string }) {
  return (
    <div className={cn("inline-flex items-center gap-2 text-sm text-foreground-muted", className)}>
      <Sparkles size={14} className="text-accent" />
      {label && <span>{label}</span>}
      <span className="flex items-center gap-0.5">
        <span className="h-1.5 w-1.5 rounded-full bg-accent animate-typing-dot" style={{ animationDelay: "0ms" }} />
        <span className="h-1.5 w-1.5 rounded-full bg-accent animate-typing-dot" style={{ animationDelay: "150ms" }} />
        <span className="h-1.5 w-1.5 rounded-full bg-accent animate-typing-dot" style={{ animationDelay: "300ms" }} />
      </span>
    </div>
  );
}

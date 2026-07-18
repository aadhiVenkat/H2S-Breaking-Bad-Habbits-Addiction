import { cn } from "@/lib/utils/cn";

export function StepProgress({ step, total }: { step: number; total: number }) {
  return (
    <div className="flex items-center gap-1.5">
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className={cn(
            "h-1.5 flex-1 rounded-full transition-colors duration-300",
            i < step ? "bg-accent" : "bg-overlay-strong",
          )}
        />
      ))}
    </div>
  );
}

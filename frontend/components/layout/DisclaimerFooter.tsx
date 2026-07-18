import { cn } from "@/lib/utils/cn";

export function DisclaimerFooter({ className }: { className?: string }) {
  return (
    <p className={cn("text-xs leading-relaxed text-foreground-subtle max-w-2xl", className)}>
      Reclaim AI is a self-guided wellness tool and does not provide medical advice, diagnosis, or treatment.
      It is not a substitute for professional care. If you are in crisis or dealing with a severe substance
      dependency, please reach out to a licensed healthcare provider or a local crisis line.
    </p>
  );
}

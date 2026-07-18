import { cn } from "@/lib/utils/cn";

interface SectionHeadingProps {
  eyebrow?: string;
  title: string;
  description?: string;
  className?: string;
  align?: "left" | "center";
}

export function SectionHeading({ eyebrow, title, description, className, align = "left" }: SectionHeadingProps) {
  return (
    <div className={cn("space-y-2", align === "center" && "text-center", className)}>
      {eyebrow && <p className="text-xs font-semibold uppercase tracking-[0.15em] text-accent">{eyebrow}</p>}
      <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-foreground">{title}</h2>
      {description && <p className="text-foreground-muted text-sm sm:text-base max-w-xl">{description}</p>}
    </div>
  );
}

import { forwardRef } from "react";
import type { InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils/cn";

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={cn(
          "w-full rounded-xl bg-surface-raised border border-border-soft px-4 py-3 text-sm text-foreground placeholder:text-foreground-subtle outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/30 transition-colors",
          className,
        )}
        {...props}
      />
    );
  },
);
Input.displayName = "Input";

"use client";

import { cn } from "@/lib/utils/cn";

interface SliderProps {
  value: number;
  min?: number;
  max?: number;
  step?: number;
  onChange: (value: number) => void;
  className?: string;
  lowLabel?: string;
  highLabel?: string;
  id?: string;
  "aria-labelledby"?: string;
  "aria-label"?: string;
}

export function Slider({
  value,
  min = 0,
  max = 10,
  step = 1,
  onChange,
  className,
  lowLabel,
  highLabel,
  id,
  "aria-labelledby": ariaLabelledBy,
  "aria-label": ariaLabel,
}: SliderProps) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div className={cn("w-full", className)}>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        aria-labelledby={ariaLabelledBy}
        aria-label={ariaLabel}
        onChange={(e) => onChange(Number(e.target.value))}
        className="slider-input w-full"
        style={{
          background: `linear-gradient(to right, var(--accent) ${pct}%, var(--overlay-strong) ${pct}%)`,
        }}
      />
      {(lowLabel || highLabel) && (
        <div className="mt-1.5 flex justify-between text-xs text-foreground-subtle">
          <span>{lowLabel}</span>
          <span>{highLabel}</span>
        </div>
      )}
      <style jsx>{`
        .slider-input {
          -webkit-appearance: none;
          appearance: none;
          height: 6px;
          border-radius: 999px;
          outline: none;
          cursor: pointer;
        }
        .slider-input::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: var(--accent);
          border: 3px solid var(--background);
          box-shadow: 0 0 0 1px rgba(61, 220, 151, 0.4);
          cursor: pointer;
        }
        .slider-input::-moz-range-thumb {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: var(--accent);
          border: 3px solid var(--background);
          cursor: pointer;
        }
      `}</style>
    </div>
  );
}

"use client";

import { useMemo } from "react";
import { useTheme } from "@/lib/theme/ThemeProvider";

export interface ChartTheme {
  surface: string;
  border: string;
  muted: string;
  subtle: string;
  overlay: string;
  grid: string;
  accent: string;
  danger: string;
}

const FALLBACK: ChartTheme = {
  surface: "#17171a",
  border: "rgba(255,255,255,0.12)",
  muted: "#a3a7a4",
  subtle: "#6b6f6d",
  overlay: "rgba(255,255,255,0.04)",
  grid: "rgba(255,255,255,0.06)",
  accent: "#3ddc97",
  danger: "#f2545b",
};

function readChartTheme(): ChartTheme {
  if (typeof window === "undefined") return FALLBACK;
  const s = getComputedStyle(document.documentElement);
  const read = (name: string, fallback: string) => {
    const v = s.getPropertyValue(name).trim();
    return v || fallback;
  };
  return {
    surface: read("--surface-raised", FALLBACK.surface),
    border: read("--border-soft", FALLBACK.border),
    muted: read("--foreground-muted", FALLBACK.muted),
    subtle: read("--foreground-subtle", FALLBACK.subtle),
    overlay: read("--overlay", FALLBACK.overlay),
    grid: read("--chart-grid", FALLBACK.grid),
    accent: read("--accent", FALLBACK.accent),
    danger: read("--danger", FALLBACK.danger),
  };
}

export function useChartTheme(): ChartTheme {
  const { resolvedTheme } = useTheme();
  return useMemo(() => {
    void resolvedTheme;
    return readChartTheme();
  }, [resolvedTheme]);
}

export function chartTooltipStyles(theme: ChartTheme) {
  return {
    contentStyle: {
      background: theme.surface,
      border: `1px solid ${theme.border}`,
      borderRadius: 12,
      fontSize: 12,
    },
    labelStyle: { color: theme.muted },
    itemStyle: { color: theme.accent },
  };
}

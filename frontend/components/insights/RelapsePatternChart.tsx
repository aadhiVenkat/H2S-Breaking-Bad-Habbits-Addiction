"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { chartTooltipStyles, useChartTheme } from "@/lib/theme/useChartTheme";

interface RelapsePatternChartProps {
  data: { date: string; intensityBefore: number }[];
}

export function RelapsePatternChart({ data }: RelapsePatternChartProps) {
  const theme = useChartTheme();
  const tooltip = chartTooltipStyles(theme);

  if (data.length === 0) {
    return (
      <div className="flex h-40 items-center justify-center text-center text-sm text-foreground-muted">
        No relapses logged yet — that&apos;s worth celebrating.
      </div>
    );
  }

  return (
    <div className="h-56 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={theme.grid} vertical={false} />
          <XAxis dataKey="date" tick={{ fill: theme.subtle, fontSize: 11 }} axisLine={false} tickLine={false} />
          <YAxis domain={[0, 10]} tick={{ fill: theme.subtle, fontSize: 11 }} axisLine={false} tickLine={false} />
          <Tooltip {...tooltip} cursor={{ fill: theme.overlay }} />
          <Bar dataKey="intensityBefore" fill={theme.danger} radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

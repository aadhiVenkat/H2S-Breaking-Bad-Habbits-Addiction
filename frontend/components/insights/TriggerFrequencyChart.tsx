"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { TriggerCategory } from "@/lib/types";
import { triggerLabel } from "@/lib/utils/labels";
import { chartTooltipStyles, useChartTheme } from "@/lib/theme/useChartTheme";

interface TriggerFrequencyChartProps {
  data: { trigger: TriggerCategory; count: number }[];
}

export function TriggerFrequencyChart({ data }: TriggerFrequencyChartProps) {
  const theme = useChartTheme();
  const tooltip = chartTooltipStyles(theme);
  const chartData = data.map((d) => ({ name: triggerLabel(d.trigger), count: d.count }));

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 8, right: 8, bottom: 0, left: -20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={theme.grid} vertical={false} />
          <XAxis
            dataKey="name"
            tick={{ fill: theme.subtle, fontSize: 10 }}
            axisLine={false}
            tickLine={false}
            interval={0}
            angle={-20}
            textAnchor="end"
            height={50}
          />
          <YAxis tick={{ fill: theme.subtle, fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
          <Tooltip {...tooltip} cursor={{ fill: theme.overlay }} />
          <Bar dataKey="count" fill={theme.accent} radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

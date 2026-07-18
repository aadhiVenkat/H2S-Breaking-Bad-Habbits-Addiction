"use client";

import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { chartTooltipStyles, useChartTheme } from "@/lib/theme/useChartTheme";

interface CravingTrendChartProps {
  data: { date: string; intensity: number }[];
}

export function CravingTrendChart({ data }: CravingTrendChartProps) {
  const theme = useChartTheme();
  const tooltip = chartTooltipStyles(theme);

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={theme.grid} vertical={false} />
          <XAxis dataKey="date" tick={{ fill: theme.subtle, fontSize: 11 }} axisLine={false} tickLine={false} />
          <YAxis domain={[0, 10]} tick={{ fill: theme.subtle, fontSize: 11 }} axisLine={false} tickLine={false} />
          <Tooltip {...tooltip} />
          <Line
            type="monotone"
            dataKey="intensity"
            stroke={theme.accent}
            strokeWidth={2.5}
            dot={{ r: 3, fill: theme.accent }}
            activeDot={{ r: 5 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

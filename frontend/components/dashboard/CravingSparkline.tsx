"use client";

import { Area, AreaChart, ResponsiveContainer, Tooltip, YAxis } from "recharts";
import { chartTooltipStyles, useChartTheme } from "@/lib/theme/useChartTheme";

interface CravingSparklineProps {
  data: { date: string; intensity: number }[];
}

export function CravingSparkline({ data }: CravingSparklineProps) {
  const theme = useChartTheme();
  const tooltip = chartTooltipStyles(theme);

  return (
    <div className="h-24 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 4, right: 0, bottom: 0, left: 0 }}>
          <defs>
            <linearGradient id="cravingGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={theme.accent} stopOpacity={0.4} />
              <stop offset="100%" stopColor={theme.accent} stopOpacity={0} />
            </linearGradient>
          </defs>
          <YAxis hide domain={[0, 10]} />
          <Tooltip {...tooltip} />
          <Area type="monotone" dataKey="intensity" stroke={theme.accent} strokeWidth={2} fill="url(#cravingGradient)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

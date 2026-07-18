"use client";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import type { AnalyticsSummary } from "@/lib/types";
import { triggerLabel } from "@/lib/utils/labels";
import { chartTooltipStyles, useChartTheme } from "@/lib/theme/useChartTheme";

interface InsightsChartsProps {
  analytics: AnalyticsSummary;
}

/** Recharts-heavy panel — dynamically imported so it stays out of the main bundle. */
export function InsightsCharts({ analytics }: InsightsChartsProps) {
  const theme = useChartTheme();
  const tooltip = chartTooltipStyles(theme);

  return (
    <div className="space-y-5">
      <Card>
        <CardHeader>
          <CardTitle>Craving intensity (14 days)</CardTitle>
        </CardHeader>
        <div className="h-48 w-full" role="img" aria-label="Craving intensity over the last 14 days">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={analytics.cravingByDay} margin={{ top: 8, right: 8, bottom: 0, left: -16 }}>
              <defs>
                <linearGradient id="insightCraving" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={theme.accent} stopOpacity={0.35} />
                  <stop offset="100%" stopColor={theme.accent} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke={theme.overlay} vertical={false} />
              <XAxis dataKey="date" tick={{ fill: theme.subtle, fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis domain={[0, 10]} tick={{ fill: theme.subtle, fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip {...tooltip} />
              <Area type="monotone" dataKey="intensity" stroke={theme.accent} strokeWidth={2} fill="url(#insightCraving)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <table className="sr-only">
          <caption>Craving intensity by day</caption>
          <thead>
            <tr>
              <th scope="col">Date</th>
              <th scope="col">Intensity</th>
            </tr>
          </thead>
          <tbody>
            {analytics.cravingByDay.map((row) => (
              <tr key={row.date}>
                <td>{row.date}</td>
                <td>{row.intensity}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Mood trend</CardTitle>
        </CardHeader>
        <div className="h-40 w-full" role="img" aria-label="Mood trend over recent check-ins">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={analytics.moodTrend.filter((d) => d.mood > 0)} margin={{ top: 8, right: 8, bottom: 0, left: -16 }}>
              <XAxis dataKey="date" tick={{ fill: theme.subtle, fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis domain={[0, 5]} tick={{ fill: theme.subtle, fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip {...tooltip} />
              <Area type="monotone" dataKey="mood" stroke="#7dd3fc" strokeWidth={2} fill="rgba(125,211,252,0.15)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Top triggers</CardTitle>
        </CardHeader>
        {analytics.topTriggers.length === 0 ? (
          <p className="text-sm text-foreground-muted">No triggers logged yet.</p>
        ) : (
          <>
            <div className="h-48 w-full" role="img" aria-label="Top trigger frequencies">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={analytics.topTriggers.map((t) => ({
                    name: triggerLabel(t.trigger),
                    count: t.count,
                  }))}
                  layout="vertical"
                  margin={{ top: 0, right: 8, bottom: 0, left: 8 }}
                >
                  <XAxis type="number" hide />
                  <YAxis
                    type="category"
                    dataKey="name"
                    width={100}
                    tick={{ fill: theme.muted, fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip {...tooltip} />
                  <Bar dataKey="count" fill={theme.accent} radius={[0, 8, 8, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <ul className="sr-only">
              {analytics.topTriggers.map((t) => (
                <li key={t.trigger}>
                  {triggerLabel(t.trigger)}: {t.count}
                </li>
              ))}
            </ul>
          </>
        )}
      </Card>
    </div>
  );
}

const DAY_MS = 24 * 60 * 60 * 1000;

export function isoDate(date: Date = new Date()): string {
  return date.toISOString().slice(0, 10);
}

export function daysAgoISO(days: number, from: Date = new Date()): string {
  const d = new Date(from);
  d.setDate(d.getDate() - days);
  return isoDate(d);
}

export function daysBetween(a: string, b: string): number {
  const dateA = new Date(a).setHours(0, 0, 0, 0);
  const dateB = new Date(b).setHours(0, 0, 0, 0);
  return Math.round((dateB - dateA) / DAY_MS);
}

export function formatFriendlyDate(iso: string): string {
  const date = new Date(iso);
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function formatWeekday(iso: string): string {
  const date = new Date(iso);
  return date.toLocaleDateString("en-US", { weekday: "short" });
}

export function formatFullDate(iso: string): string {
  const date = new Date(iso);
  return date.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
}

export function formatTime(iso: string): string {
  const date = new Date(iso);
  return date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}

export function getTimeOfDay(date: Date = new Date()): "early_morning" | "morning" | "afternoon" | "evening" | "night" | "late_night" {
  const hour = date.getHours();
  if (hour >= 4 && hour < 7) return "early_morning";
  if (hour >= 7 && hour < 12) return "morning";
  if (hour >= 12 && hour < 17) return "afternoon";
  if (hour >= 17 && hour < 21) return "evening";
  if (hour >= 21 && hour < 24) return "night";
  return "late_night";
}

export function relativeTimeFromNow(iso: string): string {
  const now = Date.now();
  const then = new Date(iso).getTime();
  const diffMs = now - then;
  const minutes = Math.round(diffMs / (60 * 1000));
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  return `${days}d ago`;
}

export function last(days: number): string[] {
  const out: string[] = [];
  for (let i = days - 1; i >= 0; i -= 1) {
    out.push(daysAgoISO(i));
  }
  return out;
}

/** Tiny helpers used by local/mock AI service paths. */

export function pick<T>(items: readonly T[]): T {
  if (items.length === 0) {
    throw new Error("pick() requires a non-empty array");
  }
  return items[Math.floor(Math.random() * items.length)]!;
}

export function simulatedThinkingDelay(minMs = 400, maxMs = 1000): Promise<void> {
  const lo = Math.max(0, Math.min(minMs, maxMs));
  const hi = Math.max(minMs, maxMs);
  const ms = lo + Math.floor(Math.random() * (hi - lo + 1));
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

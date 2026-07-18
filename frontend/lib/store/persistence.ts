import type { AppState } from "@/lib/types";

/** Legacy single-user key — migrated into per-user reclaim_state_* on first load. */
export const LEGACY_STORAGE_KEY = "breakfree_state_v1";

export function stateKeyForUser(userId: string): string {
  return `reclaim_state_${userId}`;
}

export function loadPersistedState(userId: string | null): AppState | null {
  if (typeof window === "undefined" || !userId) return null;
  try {
    const key = stateKeyForUser(userId);
    const raw = window.localStorage.getItem(key);
    if (raw) {
      return migratePersistedState(JSON.parse(raw) as AppState);
    }

    // One-time migrate from the old global key into this user's bucket.
    const legacy = window.localStorage.getItem(LEGACY_STORAGE_KEY);
    if (legacy) {
      const parsed = migratePersistedState(JSON.parse(legacy) as AppState);
      window.localStorage.setItem(key, JSON.stringify(parsed));
      window.localStorage.removeItem(LEGACY_STORAGE_KEY);
      return parsed;
    }

    return null;
  } catch {
    return null;
  }
}

/** Map legacy profile.openaiApiKey → geminiApiKey on read. */
function migratePersistedState(state: AppState): AppState {
  const profile = state.profile as
    | (AppState["profile"] & { openaiApiKey?: string })
    | null;
  if (!profile) return state;
  const legacy = profile.openaiApiKey?.trim();
  if (!legacy && !("openaiApiKey" in profile)) return state;

  const { openaiApiKey: _removed, ...rest } = profile;
  return {
    ...state,
    profile: {
      ...rest,
      geminiApiKey: rest.geminiApiKey?.trim() || legacy || undefined,
    },
  };
}

export function persistState(userId: string | null, state: AppState): void {
  if (typeof window === "undefined" || !userId) return;
  try {
    window.localStorage.setItem(stateKeyForUser(userId), JSON.stringify(state));
  } catch {
    // localStorage may be unavailable (private browsing, quota) — fail silently.
  }
}

export function clearPersistedState(userId: string | null): void {
  if (typeof window === "undefined" || !userId) return;
  try {
    window.localStorage.removeItem(stateKeyForUser(userId));
  } catch {
    // ignore
  }
}

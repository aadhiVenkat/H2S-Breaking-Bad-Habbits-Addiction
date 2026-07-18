import type { AppState, RecoveryPlan, UserProfile } from "@/lib/types";
import { normalizeUserProfile } from "@/lib/utils/habits";

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

/** Map legacy profile.openaiApiKey → geminiApiKey and single-habit → multi-habit. */
function migratePersistedState(state: AppState): AppState {
  const next: AppState = {
    ...state,
    plans: Array.isArray(state.plans) ? state.plans : state.plan ? [state.plan] : [],
  };

  const profile = next.profile as
    | (UserProfile & { openaiApiKey?: string })
    | null;

  if (!profile) return next;

  const { openaiApiKey, ...rest } = profile;
  const legacy = typeof openaiApiKey === "string" ? openaiApiKey.trim() : "";

  const migratedProfile = normalizeUserProfile({
    ...rest,
    geminiApiKey: rest.geminiApiKey?.trim() || legacy || undefined,
  } as UserProfile);

  const plans = ensurePlansLinked(next.plans, next.plan, migratedProfile.activeHabitId);
  const plan =
    plans.find((p) => p.habitId === migratedProfile.activeHabitId) ??
    next.plan ??
    plans[0] ??
    null;

  return {
    ...next,
    profile: {
      ...migratedProfile,
      currentPlanId: plan?.id ?? migratedProfile.currentPlanId,
    },
    plans,
    plan,
  };
}

function ensurePlansLinked(
  plans: RecoveryPlan[],
  activePlan: RecoveryPlan | null | undefined,
  activeHabitId: string,
): RecoveryPlan[] {
  const list = [...plans];
  if (activePlan && !list.some((p) => p.id === activePlan.id)) {
    list.unshift(activePlan);
  }
  return list.map((p) => ({
    ...p,
    habitId: p.habitId ?? activeHabitId,
  }));
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

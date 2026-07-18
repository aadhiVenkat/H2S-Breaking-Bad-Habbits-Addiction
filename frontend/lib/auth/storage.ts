import type { AuthAccount, AuthSession } from "@/lib/auth/types";
import { ACCOUNTS_KEY, SESSION_KEY } from "@/lib/auth/types";

/** Legacy shape before openaiApiKey → geminiApiKey rename. */
type StoredAccount = AuthAccount & { openaiApiKey?: string };

function migrateAccount(account: StoredAccount): AuthAccount {
  const { openaiApiKey, ...rest } = account;
  if (rest.geminiApiKey?.trim()) {
    return rest;
  }
  const legacy = openaiApiKey?.trim();
  if (legacy) {
    return { ...rest, geminiApiKey: legacy };
  }
  return rest;
}

function readJson<T>(key: string): T | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

function writeJson(key: string, value: unknown): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // localStorage may be unavailable
  }
}

export function loadAccounts(): AuthAccount[] {
  const raw = readJson<StoredAccount[]>(ACCOUNTS_KEY) ?? [];
  const migrated = raw.map(migrateAccount);
  const needsWrite = raw.some((a, i) => {
    const m = migrated[i];
    return Boolean((a as StoredAccount).openaiApiKey) || a.geminiApiKey !== m.geminiApiKey;
  });
  if (needsWrite && migrated.length > 0) {
    writeJson(ACCOUNTS_KEY, migrated);
  }
  return migrated;
}

export function saveAccounts(accounts: AuthAccount[]): void {
  writeJson(ACCOUNTS_KEY, accounts);
}

export function findAccountByUsername(username: string): AuthAccount | null {
  const normalized = username.trim().toLowerCase();
  return loadAccounts().find((a) => a.username.toLowerCase() === normalized) ?? null;
}

export function findAccountById(userId: string): AuthAccount | null {
  return loadAccounts().find((a) => a.id === userId) ?? null;
}

export function upsertAccount(account: AuthAccount): void {
  const accounts = loadAccounts();
  const idx = accounts.findIndex((a) => a.id === account.id);
  if (idx >= 0) {
    accounts[idx] = account;
  } else {
    accounts.push(account);
  }
  saveAccounts(accounts);
}

export function loadSession(): AuthSession | null {
  return readJson<AuthSession>(SESSION_KEY);
}

export function saveSession(session: AuthSession | null): void {
  if (typeof window === "undefined") return;
  try {
    if (!session) {
      window.localStorage.removeItem(SESSION_KEY);
    } else {
      window.localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    }
  } catch {
    // ignore
  }
}

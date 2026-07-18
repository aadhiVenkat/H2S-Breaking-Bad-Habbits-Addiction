import { generateSalt, hashPassword } from "@/lib/auth/hash";
import {
  findAccountById,
  findAccountByUsername,
  loadSession,
  saveSession,
  upsertAccount,
} from "@/lib/auth/storage";
import type { AuthAccount, AuthSession } from "@/lib/auth/types";

export type { AuthAccount, AuthSession } from "@/lib/auth/types";
export { ACCOUNTS_KEY, SESSION_KEY } from "@/lib/auth/types";

export class AuthError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AuthError";
  }
}

function newUserId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `user-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export interface CreateAccountInput {
  username: string;
  password: string;
  displayName?: string;
  geminiApiKey: string;
}

export async function createAccount(input: CreateAccountInput): Promise<AuthAccount> {
  const username = input.username.trim();
  if (!username) throw new AuthError("Username is required.");
  if (input.password.length < 4) throw new AuthError("Password must be at least 4 characters.");
  const geminiApiKey = input.geminiApiKey.trim();
  if (!geminiApiKey) throw new AuthError("Google Gemini API key is required.");
  if (findAccountByUsername(username)) {
    throw new AuthError("That username is already taken.");
  }

  const salt = generateSalt();
  const passwordHash = await hashPassword(username.toLowerCase(), input.password, salt);
  const account: AuthAccount = {
    id: newUserId(),
    username,
    passwordHash,
    salt,
    displayName: input.displayName?.trim() || username,
    geminiApiKey,
    createdAt: new Date().toISOString(),
  };
  upsertAccount(account);
  saveSession({ userId: account.id, username: account.username });
  return account;
}

export async function login(username: string, password: string): Promise<AuthAccount> {
  const account = findAccountByUsername(username);
  if (!account) throw new AuthError("Invalid username or password.");

  const passwordHash = await hashPassword(account.username.toLowerCase(), password, account.salt);
  if (passwordHash !== account.passwordHash) {
    throw new AuthError("Invalid username or password.");
  }

  saveSession({ userId: account.id, username: account.username });
  return account;
}

/** Clears session only — accounts and per-user app data remain. */
export function logout(): void {
  saveSession(null);
}

export function getSession(): AuthSession | null {
  return loadSession();
}

export function getCurrentAccount(): AuthAccount | null {
  const session = loadSession();
  if (!session) return null;
  return findAccountById(session.userId);
}

export function getGeminiApiKey(): string | undefined {
  const key = getCurrentAccount()?.geminiApiKey?.trim();
  return key || undefined;
}

export function updateAccountGeminiKey(apiKey: string): AuthAccount | null {
  const trimmed = apiKey.trim();
  if (!trimmed) throw new AuthError("Google Gemini API key cannot be empty.");

  const session = loadSession();
  if (!session) return null;
  const account = findAccountById(session.userId);
  if (!account) return null;

  const next: AuthAccount = {
    ...account,
    geminiApiKey: trimmed,
  };
  upsertAccount(next);
  return next;
}

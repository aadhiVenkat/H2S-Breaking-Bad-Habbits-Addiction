import { beforeEach, describe, expect, it } from "vitest";
import {
  AuthError,
  createAccount,
  getCurrentAccount,
  getGeminiApiKey,
  getSession,
  login,
  logout,
  updateAccountGeminiKey,
} from "@/lib/auth";
import { ACCOUNTS_KEY, SESSION_KEY } from "@/lib/auth/types";

function installLocalStorage() {
  const store = new Map<string, string>();
  const localStorage = {
    getItem: (key: string) => store.get(key) ?? null,
    setItem: (key: string, value: string) => {
      store.set(key, String(value));
    },
    removeItem: (key: string) => {
      store.delete(key);
    },
    clear: () => store.clear(),
  };
  Object.defineProperty(globalThis, "window", {
    value: { localStorage },
    configurable: true,
    writable: true,
  });
  return store;
}

describe("auth account flow", () => {
  let store: Map<string, string>;

  beforeEach(() => {
    store = installLocalStorage();
  });

  it("creates an account without requiring a Gemini key", async () => {
    const account = await createAccount({
      username: "ada",
      password: "pass",
      displayName: "Ada",
    });

    expect(account.username).toBe("ada");
    expect(account.displayName).toBe("Ada");
    expect(account.geminiApiKey).toBeUndefined();
    expect(getSession()).toEqual({ userId: account.id, username: "ada" });
    expect(getCurrentAccount()?.id).toBe(account.id);
    expect(store.has(ACCOUNTS_KEY)).toBe(true);
    expect(store.has(SESSION_KEY)).toBe(true);
  });

  it("stores an optional Gemini key when provided", async () => {
    const account = await createAccount({
      username: "ada",
      password: "pass",
      geminiApiKey: "  gemini-test-key  ",
    });
    expect(account.geminiApiKey).toBe("gemini-test-key");
    expect(getGeminiApiKey()).toBe("gemini-test-key");
  });

  it("rejects short passwords and duplicate usernames", async () => {
    await expect(createAccount({ username: "ada", password: "abc" })).rejects.toBeInstanceOf(AuthError);

    await createAccount({ username: "ada", password: "pass" });
    await expect(createAccount({ username: "ADA", password: "pass" })).rejects.toThrow(
      /already taken/i,
    );
  });

  it("logs in with valid credentials and rejects invalid ones", async () => {
    await createAccount({ username: "ada", password: "pass" });
    logout();
    expect(getSession()).toBeNull();

    const account = await login("ada", "pass");
    expect(account.username).toBe("ada");
    expect(getSession()?.username).toBe("ada");

    await expect(login("ada", "wrong")).rejects.toThrow(/Invalid username or password/i);
    await expect(login("missing", "pass")).rejects.toThrow(/Invalid username or password/i);
  });

  it("updates the Gemini key for the signed-in account", async () => {
    await createAccount({ username: "ada", password: "pass" });
    const updated = updateAccountGeminiKey("new-key");
    expect(updated?.geminiApiKey).toBe("new-key");
    expect(getGeminiApiKey()).toBe("new-key");

    expect(() => updateAccountGeminiKey("   ")).toThrow(AuthError);
  });

  it("migrates legacy openaiApiKey values on load", async () => {
    store.set(
      ACCOUNTS_KEY,
      JSON.stringify([
        {
          id: "legacy-1",
          username: "legacy",
          passwordHash: "abc",
          salt: "def",
          displayName: "Legacy",
          openaiApiKey: "legacy-openai-key",
          createdAt: "2026-01-01T00:00:00.000Z",
        },
      ]),
    );
    store.set(SESSION_KEY, JSON.stringify({ userId: "legacy-1", username: "legacy" }));

    expect(getCurrentAccount()?.geminiApiKey).toBe("legacy-openai-key");
    expect(getGeminiApiKey()).toBe("legacy-openai-key");

    const persisted = JSON.parse(store.get(ACCOUNTS_KEY)!) as Array<{
      geminiApiKey?: string;
      openaiApiKey?: string;
    }>;
    expect(persisted[0]?.geminiApiKey).toBe("legacy-openai-key");
    expect(persisted[0]?.openaiApiKey).toBeUndefined();
  });
});

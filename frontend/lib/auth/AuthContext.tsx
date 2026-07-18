"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  AuthError,
  createAccount as createAccountFn,
  getCurrentAccount,
  getGeminiApiKey as readGeminiKey,
  getSession,
  login as loginFn,
  logout as logoutFn,
  updateAccountGeminiKey,
  type AuthAccount,
  type AuthSession,
  type CreateAccountInput,
} from "@/lib/auth/index";

interface AuthContextValue {
  ready: boolean;
  session: AuthSession | null;
  account: AuthAccount | null;
  createAccount: (input: CreateAccountInput) => Promise<AuthAccount>;
  login: (username: string, password: string) => Promise<AuthAccount>;
  logout: () => void;
  updateGeminiKey: (apiKey: string) => void;
  getGeminiApiKey: () => string | undefined;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function refreshFromStorage(): { session: AuthSession | null; account: AuthAccount | null } {
  const session = getSession();
  const account = getCurrentAccount();
  return { session, account };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [session, setSession] = useState<AuthSession | null>(null);
  const [account, setAccount] = useState<AuthAccount | null>(null);

  useEffect(() => {
    const next = refreshFromStorage();
    setSession(next.session);
    setAccount(next.account);
    setReady(true);
  }, []);

  const createAccount = useCallback(async (input: CreateAccountInput) => {
    const created = await createAccountFn(input);
    const next = refreshFromStorage();
    setSession(next.session);
    setAccount(next.account);
    return created;
  }, []);

  const login = useCallback(async (username: string, password: string) => {
    const loggedIn = await loginFn(username, password);
    const next = refreshFromStorage();
    setSession(next.session);
    setAccount(next.account);
    return loggedIn;
  }, []);

  const logout = useCallback(() => {
    logoutFn();
    setSession(null);
    setAccount(null);
  }, []);

  const updateGeminiKey = useCallback((apiKey: string) => {
    const updated = updateAccountGeminiKey(apiKey);
    setAccount(updated);
  }, []);

  const getGeminiApiKey = useCallback(() => readGeminiKey(), [account]);

  const value = useMemo<AuthContextValue>(
    () => ({
      ready,
      session,
      account,
      createAccount,
      login,
      logout,
      updateGeminiKey,
      getGeminiApiKey,
    }),
    [ready, session, account, createAccount, login, logout, updateGeminiKey, getGeminiApiKey],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}

export { AuthError };

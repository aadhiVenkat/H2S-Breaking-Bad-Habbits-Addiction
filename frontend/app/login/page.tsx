"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { AuthError, useAuth } from "@/lib/auth/AuthContext";
import { loadPersistedState } from "@/lib/store/persistence";

type Mode = "login" | "create";

function routeAfterAuth(userId: string) {
  const persisted = loadPersistedState(userId);
  return persisted?.profile?.onboarded ? "/dashboard" : "/onboarding";
}

export default function LoginPage() {
  const router = useRouter();
  const { ready, session, login, createAccount } = useAuth();

  const [mode, setMode] = useState<Mode>("login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [geminiApiKey, setGeminiApiKey] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!ready || !session) return;
    router.replace(routeAfterAuth(session.userId));
  }, [ready, session, router]);

  const createReady =
    username.trim().length > 0 && password.length >= 4 && geminiApiKey.trim().length > 0;
  const loginReady = username.trim().length > 0 && password.length > 0;
  const canSubmit = mode === "create" ? createReady : loginReady;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const account =
        mode === "create"
          ? await createAccount({
              username,
              password,
              displayName: displayName || undefined,
              geminiApiKey: geminiApiKey.trim(),
            })
          : await login(username, password);
      router.replace(routeAfterAuth(account.id));
    } catch (err) {
      const message =
        err instanceof AuthError
          ? err.message
          : err instanceof Error
            ? err.message
            : "Something went wrong.";
      setError(message);
      setSubmitting(false);
    }
  }

  if (ready && session) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-foreground-muted">
        Signing you in…
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-32 left-1/2 h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-accent/10 blur-[120px]" />
      </div>

      <header className="mx-auto flex max-w-lg items-center justify-between px-6 py-6">
        <Link href="/" className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent-soft">
            <span className="h-3 w-3 rounded-full bg-accent" />
          </span>
          <span className="font-serif text-2xl italic">Reclaim AI</span>
        </Link>
      </header>

      <main className="mx-auto max-w-md px-6 pb-16 pt-4">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <h1 className="text-2xl font-semibold tracking-tight">
            {mode === "login" ? "Welcome back" : "Create your profile"}
          </h1>
          <p className="mt-1.5 text-sm text-foreground-muted">
            {mode === "login"
              ? "Log in with your local username and password."
              : "Accounts stay on this device — no cloud signup required."}
          </p>

          <div className="mt-5 flex rounded-xl border border-border-soft bg-overlay p-1">
            <button
              type="button"
              onClick={() => {
                setMode("login");
                setError(null);
              }}
              className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                mode === "login" ? "bg-surface-raised text-foreground shadow-sm" : "text-foreground-muted"
              }`}
            >
              Log in
            </button>
            <button
              type="button"
              onClick={() => {
                setMode("create");
                setError(null);
              }}
              className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                mode === "create" ? "bg-surface-raised text-foreground shadow-sm" : "text-foreground-muted"
              }`}
            >
              Create profile
            </button>
          </div>

          <Card className="mt-5 space-y-4">
            <form className="space-y-4" onSubmit={(e) => void handleSubmit(e)}>
              <div>
                <label htmlFor="username" className="mb-1.5 block text-sm font-medium text-foreground">
                  Username
                </label>
                <Input
                  id="username"
                  autoComplete="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="choose a username"
                  required
                />
              </div>

              <div>
                <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-foreground">
                  Password
                </label>
                <Input
                  id="password"
                  type="password"
                  autoComplete={mode === "create" ? "new-password" : "current-password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  minLength={4}
                />
              </div>

              {mode === "create" && (
                <>
                  <div>
                    <label htmlFor="displayName" className="mb-1.5 block text-sm font-medium text-foreground">
                      Display name <span className="font-normal text-foreground-subtle">(optional)</span>
                    </label>
                    <Input
                      id="displayName"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      placeholder="How should we greet you?"
                    />
                  </div>
                  <div>
                    <label htmlFor="geminiKey" className="mb-1.5 block text-sm font-medium text-foreground">
                      Google Gemini API key
                    </label>
                    <Input
                      id="geminiKey"
                      type="password"
                      autoComplete="off"
                      value={geminiApiKey}
                      onChange={(e) => setGeminiApiKey(e.target.value)}
                      placeholder="AIza…"
                      required
                    />
                    <p className="mt-1.5 text-xs text-foreground-subtle">
                      Stored only in this browser. Sent as X-Gemini-Key on AI requests.
                    </p>
                  </div>
                </>
              )}

              {error && (
                <p className="rounded-lg border border-danger/25 bg-danger-soft px-3 py-2 text-sm text-danger" role="alert">
                  {error}
                </p>
              )}

              <Button type="submit" size="lg" fullWidth disabled={submitting || !canSubmit}>
                {submitting ? "Please wait…" : mode === "login" ? "Log in" : "Create profile"}
              </Button>
            </form>
          </Card>
        </motion.div>
      </main>
    </div>
  );
}

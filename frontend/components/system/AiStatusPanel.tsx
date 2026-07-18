"use client";

import { useCallback, useEffect, useState } from "react";
import { Activity, KeyRound, RefreshCw, User } from "lucide-react";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { useApp } from "@/lib/store/AppContext";
import { getAiHealth, AiClientError } from "@/lib/ai/client";
import {
  providerDisplayName,
  readLastAiAction,
  type LastAiAction,
} from "@/lib/ai/meta";

function formatTime(iso: string): string {
  try {
    return new Date(iso).toLocaleString(undefined, {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

export function AiStatusPanel() {
  const { state } = useApp();
  const [health, setHealth] = useState<Awaited<ReturnType<typeof getAiHealth>> | null>(null);
  const [healthError, setHealthError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [lastAction, setLastAction] = useState<LastAiAction | null>(() =>
    typeof window !== "undefined" ? readLastAiAction() : null,
  );

  const refreshHealth = useCallback(async () => {
    setLoading(true);
    setHealthError(null);
    try {
      const body = await getAiHealth(false);
      setHealth(body);
    } catch (err) {
      setHealth(null);
      setHealthError(
        err instanceof AiClientError
          ? err.message
          : err instanceof Error
            ? err.message
            : "Health endpoint unavailable",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const onAction = (e: Event) => {
      const detail = (e as CustomEvent<LastAiAction>).detail;
      if (detail) setLastAction(detail);
      else setLastAction(readLastAiAction());
    };
    window.addEventListener("breakfree:ai-action", onAction);
    // Defer health fetch so setState isn't synchronous inside the effect body.
    const timer = window.setTimeout(() => {
      void refreshHealth();
    }, 0);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("breakfree:ai-action", onAction);
    };
  }, [refreshHealth]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity size={14} className="text-accent" />
          AI status
        </CardTitle>
        <Button size="sm" variant="ghost" icon={<RefreshCw size={14} />} onClick={() => void refreshHealth()} disabled={loading}>
          Refresh
        </Button>
      </CardHeader>

      <div className="space-y-4 text-sm">
        <div className="flex items-center gap-3 rounded-xl border border-border-subtle bg-overlay px-3 py-2.5">
          <User size={15} className="text-foreground-muted" />
          <div className="flex-1">
            <p className="text-xs text-foreground-subtle">Current user</p>
            <p className="font-medium text-foreground">
              {state.profile?.name ?? "Guest"}
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-foreground-subtle">
            <KeyRound size={12} /> Providers
          </p>
          {healthError ? (
            <p className="text-foreground-muted">{healthError}</p>
          ) : loading && !health ? (
            <p className="text-foreground-muted">Checking /api/ai/health…</p>
          ) : health?.providers?.gemini ? (
            <div className="grid gap-2">
              <ProviderRow
                name="Gemini"
                configured={health.providers.gemini.configured}
                model={health.providers.gemini.model}
              />
            </div>
          ) : (
            <p className="text-foreground-muted">No health data yet.</p>
          )}
        </div>

        <div className="rounded-xl border border-border-subtle bg-overlay px-3 py-2.5">
          <p className="text-xs text-foreground-subtle">Last AI action (this session)</p>
          {lastAction ? (
            <div className="mt-1 space-y-0.5">
              <p className="font-medium text-foreground">{lastAction.label}</p>
              <p className="text-xs text-foreground-muted">
                {lastAction.provider ? providerDisplayName(String(lastAction.provider)) : "Provider unknown"}
                {lastAction.model ? ` · ${lastAction.model}` : ""}
                {" · "}
                {formatTime(lastAction.generatedAt)}
              </p>
            </div>
          ) : (
            <p className="mt-1 text-foreground-muted">No AI calls yet this session.</p>
          )}
        </div>
      </div>
    </Card>
  );
}

function ProviderRow({
  name,
  configured,
  model,
}: {
  name: string;
  configured: boolean;
  model?: string;
}) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-border-subtle px-3 py-2 gap-2">
      <div>
        <span className="text-foreground-muted">{name}</span>
        {model && <p className="text-[11px] text-foreground-subtle">{model}</p>}
      </div>
      <Badge tone={configured ? "accent" : "warn"}>{configured ? "Key present" : "Not configured"}</Badge>
    </div>
  );
}

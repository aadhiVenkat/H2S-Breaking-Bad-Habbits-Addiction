"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Star, Bookmark, Play, Sparkles, RotateCcw, ExternalLink, LogOut } from "lucide-react";
import { PageContainer } from "@/components/layout/PageContainer";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { AILoadingDots } from "@/components/ui/AILoadingDots";
import { DisclaimerFooter } from "@/components/layout/DisclaimerFooter";
import { AiErrorState } from "@/components/system/AiErrorState";
import { ProviderBadge } from "@/components/system/ProviderBadge";
import { AiStatusPanel } from "@/components/system/AiStatusPanel";
import { useApp } from "@/lib/store/AppContext";
import { useAuth } from "@/lib/auth/AuthContext";
import { generateReplacements } from "@/lib/ai/replacementService";
import { extractAiMeta, getErrorMessage, recordLastAiAction, type AiResponseMeta } from "@/lib/ai/meta";
import { GOAL_LABELS, habitLabel, triggerLabel } from "@/lib/utils/labels";
import type { ReplacementHabit } from "@/lib/types";
import { cn } from "@/lib/utils/cn";
import { HabitManager } from "@/components/profile/HabitManager";
import { normalizeUserProfile } from "@/lib/utils/habits";

export default function ProfilePage() {
  const router = useRouter();
  const { account, logout } = useAuth();
  const {
    state,
    resetLocalData,
    saveReplacementHabit,
    rateReplacementHabit,
    useReplacementHabit: recordReplacementUse,
    toggleReplacementSaved,
    setActiveHabit,
    updateHabit,
    removeHabit,
  } = useApp();

  const [generating, setGenerating] = useState(false);
  const [genError, setGenError] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<ReplacementHabit[]>([]);
  const [meta, setMeta] = useState<AiResponseMeta | null>(null);

  async function handleGenerate() {
    if (!state.profile) return;
    setGenerating(true);
    setGenError(null);
    try {
      const next = await generateReplacements(state.profile.habit);
      setSuggestions(next);
      const nextMeta = extractAiMeta(next) ?? extractAiMeta(next[0]);
      setMeta(nextMeta);
      recordLastAiAction("Replacement habits", nextMeta);
    } catch (err) {
      setGenError(getErrorMessage(err));
    } finally {
      setGenerating(false);
    }
  }

  function handleLogout() {
    logout();
    router.push("/login");
  }

  function handleReset() {
    resetLocalData();
    router.push("/onboarding");
  }

  if (!state.profile) {
    return (
      <PageContainer className="space-y-4">
        <h1 className="text-2xl font-semibold">Profile</h1>
        <Card className="space-y-3 py-8 text-center">
          <p className="text-sm text-foreground-muted">
            No profile yet. Complete onboarding to get your personalized AI recovery plan.
          </p>
          <div className="flex justify-center gap-2">
            <Link href="/onboarding">
              <Button>Start onboarding</Button>
            </Link>
          </div>
        </Card>
        <Card className="space-y-3">
          <CardHeader>
            <CardTitle>Account</CardTitle>
          </CardHeader>
          {account && (
            <p className="text-sm text-foreground-muted">
              Signed in as <span className="font-medium text-foreground">{account.username}</span>
            </p>
          )}
          <Button variant="outline" icon={<LogOut size={15} />} onClick={handleLogout}>
            Log out
          </Button>
        </Card>
      </PageContainer>
    );
  }

  const { profile: rawProfile, plan, replacementHabits } = state;
  const profile = normalizeUserProfile(rawProfile);
  const saved = replacementHabits.filter((r) => r.savedByUser);
  const others = replacementHabits.filter((r) => !r.savedByUser);

  return (
    <PageContainer className="space-y-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">{profile.name}</h1>
          <p className="text-sm text-foreground-muted">
            {account?.username ? `@${account.username} · ` : ""}
            {habitLabel(profile.habit.habit)} · {GOAL_LABELS[profile.habit.goal]}
            {profile.habits.length > 1 ? ` · ${profile.habits.length} habits` : ""}
          </p>
        </div>
      </div>

      <Card className="space-y-3">
        <CardHeader>
          <CardTitle>Account</CardTitle>
          <CardDescription>Local username stored on this device.</CardDescription>
        </CardHeader>
        <dl className="grid gap-3 text-sm">
          <div>
            <dt className="text-foreground-subtle">Username</dt>
            <dd className="font-medium">{account?.username ?? profile.username ?? "—"}</dd>
          </div>
        </dl>
        <Button size="sm" variant="outline" icon={<LogOut size={14} />} onClick={handleLogout}>
          Log out
        </Button>
      </Card>

      <HabitManager
        habits={profile.habits}
        activeHabitId={profile.activeHabitId}
        onSetActive={setActiveHabit}
        onUpdateHabit={updateHabit}
        onRemoveHabit={removeHabit}
      />

      <Card className="space-y-3">
        <CardHeader>
          <CardTitle>Active habit details</CardTitle>
        </CardHeader>
        <dl className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <dt className="text-foreground-subtle">Intensity</dt>
            <dd className="font-medium">{profile.habit.intensity}/5</dd>
          </div>
          <div>
            <dt className="text-foreground-subtle">Frequency</dt>
            <dd className="font-medium">{profile.habit.frequencyPerDay}x/day</dd>
          </div>
          <div className="col-span-2">
            <dt className="text-foreground-subtle">Triggers</dt>
            <dd className="mt-1 flex flex-wrap gap-1.5">
              {profile.habit.triggers.map((t) => (
                <Badge key={t} tone="neutral">
                  {triggerLabel(t)}
                </Badge>
              ))}
            </dd>
          </div>
          <div className="col-span-2">
            <dt className="text-foreground-subtle">Motivation</dt>
            <dd className="mt-1 leading-relaxed text-foreground-muted">{profile.habit.motivation}</dd>
          </div>
        </dl>
        {plan && (
          <div className="rounded-xl border border-border-subtle bg-overlay p-3">
            <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-accent">Current plan</p>
            <p className="text-sm font-medium text-foreground">{plan.title}</p>
            <p className="mt-1 line-clamp-2 text-sm text-foreground-muted">{plan.summary}</p>
          </div>
        )}
        <Link href="/relapse" className="inline-flex items-center gap-1 text-sm font-semibold text-accent hover:underline">
          Log a relapse reflection <ExternalLink size={13} />
        </Link>
      </Card>

      <Card className="space-y-4">
        <CardHeader>
          <div>
            <CardTitle className="flex items-center gap-2">
              <Sparkles size={14} className="text-accent" /> Replacement habit planner
            </CardTitle>
            <CardDescription className="mt-1">
              Generate AI suggestions, save the ones that fit, rate them after you try them.
            </CardDescription>
          </div>
          <ProviderBadge meta={meta} />
        </CardHeader>

        <Button onClick={() => void handleGenerate()} disabled={generating} icon={<Sparkles size={14} />}>
          {generating ? "Generating…" : "Generate replacements"}
        </Button>
        {generating && <AILoadingDots label="Researching replacement strategies" />}
        {genError && <AiErrorState message={genError} onRetry={() => void handleGenerate()} compact />}

        {suggestions.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-foreground-subtle">New suggestions</p>
            {suggestions.map((habit) => (
              <ReplacementRow
                key={habit.id}
                habit={habit}
                onSave={() => {
                  saveReplacementHabit({ ...habit, savedByUser: true });
                  setSuggestions((prev) => prev.filter((s) => s.id !== habit.id));
                }}
                onRate={(rating) => {
                  saveReplacementHabit({ ...habit, rating, savedByUser: true });
                  rateReplacementHabit(habit.id, rating);
                }}
                onUse={() => {
                  saveReplacementHabit({ ...habit, savedByUser: true });
                  recordReplacementUse(habit.id);
                }}
              />
            ))}
          </div>
        )}

        {saved.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-foreground-subtle">Saved</p>
            {saved.map((habit) => (
              <ReplacementRow
                key={habit.id}
                habit={habit}
                onSave={() => toggleReplacementSaved(habit.id)}
                onRate={(rating) => rateReplacementHabit(habit.id, rating)}
                onUse={() => recordReplacementUse(habit.id)}
              />
            ))}
          </div>
        )}

        {others.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-foreground-subtle">Available</p>
            {others.map((habit) => (
              <ReplacementRow
                key={habit.id}
                habit={habit}
                onSave={() => toggleReplacementSaved(habit.id)}
                onRate={(rating) => rateReplacementHabit(habit.id, rating)}
                onUse={() => recordReplacementUse(habit.id)}
              />
            ))}
          </div>
        )}
      </Card>

      <AiStatusPanel />

      <Card className="space-y-3">
        <CardHeader>
          <CardTitle>Local data</CardTitle>
        </CardHeader>
        <p className="text-sm text-foreground-muted">
          Progress for this account is stored in this browser&apos;s localStorage. Logging out keeps your data for next
          login.
        </p>
        <Button variant="outline" icon={<RotateCcw size={15} />} onClick={handleReset}>
          Reset recovery data
        </Button>
      </Card>

      <DisclaimerFooter />
    </PageContainer>
  );
}

function ReplacementRow({
  habit,
  onSave,
  onRate,
  onUse,
}: {
  habit: ReplacementHabit;
  onSave: () => void;
  onRate: (rating: number) => void;
  onUse: () => void;
}) {
  return (
    <div className="space-y-2 rounded-xl border border-border-subtle bg-overlay p-3.5">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-sm font-medium text-foreground">{habit.title}</p>
          <p className="mt-0.5 text-sm text-foreground-muted">{habit.description}</p>
        </div>
        {habit.aiGenerated && (
          <Badge tone="accent" className="shrink-0">
            AI
          </Badge>
        )}
      </div>
      <div className="flex flex-wrap gap-1">
        {habit.linkedTriggers.map((t) => (
          <span key={t} className="text-[11px] text-foreground-subtle">
            {triggerLabel(t)}
          </span>
        ))}
      </div>
      <div className="flex flex-wrap items-center gap-2 pt-1">
        <Button size="sm" variant="ghost" icon={<Play size={13} />} onClick={onUse}>
          Use ({habit.timesUsed})
        </Button>
        <Button
          size="sm"
          variant="ghost"
          icon={<Bookmark size={13} className={cn(habit.savedByUser && "fill-accent text-accent")} />}
          onClick={onSave}
        >
          {habit.savedByUser ? "Saved" : "Save"}
        </Button>
        <div className="ml-auto flex items-center gap-0.5">
          {[1, 2, 3, 4, 5].map((n) => (
            <button key={n} type="button" aria-label={`Rate ${n}`} onClick={() => onRate(n)} className="p-0.5">
              <Star
                size={14}
                className={cn(
                  habit.rating && habit.rating >= n ? "fill-accent text-accent" : "text-foreground-subtle",
                )}
              />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

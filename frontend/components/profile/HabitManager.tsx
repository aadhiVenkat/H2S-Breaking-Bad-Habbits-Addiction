"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, Pencil, Plus, Trash2 } from "lucide-react";
import type { HabitProfile, HabitType } from "@/lib/types";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { HABIT_OPTIONS } from "@/components/onboarding/onboardingOptions";
import { GOAL_LABELS, habitLabel } from "@/lib/utils/labels";
import { changeHabitType } from "@/lib/utils/habits";
import { cn } from "@/lib/utils/cn";

interface HabitManagerProps {
  habits: HabitProfile[];
  activeHabitId: string;
  onSetActive: (habitId: string) => void;
  onUpdateHabit: (habit: HabitProfile) => void;
  onRemoveHabit: (habitId: string) => void;
}

export function HabitManager({
  habits,
  activeHabitId,
  onSetActive,
  onUpdateHabit,
  onRemoveHabit,
}: HabitManagerProps) {
  const [editing, setEditing] = useState<HabitProfile | null>(null);
  const [draftType, setDraftType] = useState<HabitType | null>(null);

  function openChange(habit: HabitProfile) {
    setEditing(habit);
    setDraftType(habit.habit);
  }

  function saveChange() {
    if (!editing || !draftType) return;
    onUpdateHabit(changeHabitType(editing, draftType));
    setEditing(null);
    setDraftType(null);
  }

  const takenTypes = new Set(habits.map((h) => h.habit));

  return (
    <>
      <Card className="space-y-4">
        <CardHeader>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <CardTitle>Your habits</CardTitle>
              <CardDescription className="mt-1">
                Switch the active habit anytime. Coach, dashboard, and plan follow the active one.
              </CardDescription>
            </div>
            <Link href="/onboarding?mode=add">
              <Button size="sm" variant="secondary" icon={<Plus size={14} />}>
                Add habit
              </Button>
            </Link>
          </div>
        </CardHeader>

        <ul className="space-y-2">
          {habits.map((habit) => {
            const isActive = habit.id === activeHabitId;
            return (
              <li
                key={habit.id}
                className={cn(
                  "rounded-xl border px-3.5 py-3 transition-colors",
                  isActive ? "border-accent/40 bg-accent-soft/40" : "border-border-subtle bg-overlay",
                )}
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-semibold text-foreground">{habit.habitLabel || habitLabel(habit.habit)}</p>
                      {isActive && (
                        <Badge tone="accent" className="text-[10px]">
                          Active
                        </Badge>
                      )}
                    </div>
                    <p className="mt-0.5 text-xs text-foreground-muted">
                      {GOAL_LABELS[habit.goal]} · intensity {habit.intensity}/5
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {!isActive && (
                      <Button size="sm" variant="ghost" icon={<Check size={13} />} onClick={() => onSetActive(habit.id)}>
                        Set active
                      </Button>
                    )}
                    <Button size="sm" variant="ghost" icon={<Pencil size={13} />} onClick={() => openChange(habit)}>
                      Change
                    </Button>
                    {habits.length > 1 && (
                      <Button
                        size="sm"
                        variant="ghost"
                        icon={<Trash2 size={13} />}
                        onClick={() => onRemoveHabit(habit.id)}
                        aria-label={`Remove ${habit.habitLabel}`}
                      >
                        Remove
                      </Button>
                    )}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </Card>

      <Modal
        open={Boolean(editing)}
        onClose={() => {
          setEditing(null);
          setDraftType(null);
        }}
        title="Change habit"
        className="sm:max-w-lg"
      >
        <p className="mb-4 text-sm text-foreground-muted">
          Pick a different habit type. Your triggers and intensity stay the same — you can refine them later by adding a
          fresh habit if needed.
        </p>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {HABIT_OPTIONS.map((option) => {
            const takenByOther =
              takenTypes.has(option.value) && editing?.habit !== option.value;
            const selected = draftType === option.value;
            return (
              <button
                key={option.value}
                type="button"
                disabled={takenByOther}
                aria-pressed={selected}
                onClick={() => setDraftType(option.value)}
                className={cn(
                  "flex flex-col items-start gap-1 rounded-xl border px-3 py-3 text-left text-sm transition-colors",
                  takenByOther && "cursor-not-allowed opacity-40",
                  selected ? "border-accent/50 bg-accent-soft" : "border-border-soft bg-surface-raised",
                )}
              >
                <span aria-hidden="true">{option.emoji}</span>
                <span className={cn("font-medium", selected ? "text-accent" : "text-foreground")}>{option.label}</span>
              </button>
            );
          })}
        </div>
        <div className="mt-5 flex justify-end gap-2">
          <Button
            variant="ghost"
            onClick={() => {
              setEditing(null);
              setDraftType(null);
            }}
          >
            Cancel
          </Button>
          <Button disabled={!draftType || draftType === editing?.habit} onClick={saveChange}>
            Save change
          </Button>
        </div>
      </Modal>
    </>
  );
}

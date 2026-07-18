"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Send, LifeBuoy, HeartHandshake, ArrowRight } from "lucide-react";
import { PageContainer } from "@/components/layout/PageContainer";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Textarea";
import { AILoadingDots } from "@/components/ui/AILoadingDots";
import { AiErrorState } from "@/components/system/AiErrorState";
import { ProviderBadge } from "@/components/system/ProviderBadge";
import { FormattedMessage } from "@/components/coach/FormattedMessage";
import { useApp } from "@/lib/store/AppContext";
import { chat, SUGGESTED_PROMPTS, detectIntent } from "@/lib/ai/coachService";
import { extractAiMeta, getErrorMessage, recordLastAiAction, type AiResponseMeta } from "@/lib/ai/meta";
import type { ChatMessage } from "@/lib/types";
import { cn } from "@/lib/utils/cn";

export default function CoachPage() {
  const { state, addChatMessage } = useApp();
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [meta, setMeta] = useState<AiResponseMeta | null>(null);
  const [pendingRetry, setPendingRetry] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const lastUserIntent = [...state.chatHistory].reverse().find((m) => m.role === "user")?.intent;

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [state.chatHistory.length, sending]);

  async function sendMessage(text: string) {
    const trimmed = text.trim();
    if (!trimmed || sending) return;

    setError(null);
    setPendingRetry(null);
    setInput("");

    const userMsg: ChatMessage = {
      id: `chat-user-${crypto.randomUUID()}`,
      role: "user",
      content: trimmed,
      timestamp: new Date().toISOString(),
      intent: detectIntent(trimmed),
    };
    addChatMessage(userMsg);

    const history = [...state.chatHistory, userMsg];
    setSending(true);
    try {
      const reply = await chat(history, state.profile?.habit ?? null);
      addChatMessage(reply);
      const replyMeta = extractAiMeta(reply);
      setMeta(replyMeta);
      recordLastAiAction("Coach chat", replyMeta);
    } catch (err) {
      setError(getErrorMessage(err, "Coach could not reply."));
      setPendingRetry(trimmed);
    } finally {
      setSending(false);
    }
  }

  return (
    <PageContainer className="flex min-h-[calc(100vh-8rem)] flex-col gap-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">AI Coach</h1>
          <p className="text-sm text-foreground-muted">Talk through cravings, slips, or low-motivation days.</p>
        </div>
        <ProviderBadge meta={meta} />
      </div>

      {lastUserIntent === "craving" && (
        <Card className="flex flex-col gap-3 border-danger/20 bg-danger-soft/30 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <LifeBuoy size={18} className="mt-0.5 shrink-0 text-danger" />
            <div>
              <p className="text-sm font-semibold text-foreground">Sounds like a craving</p>
              <p className="text-sm text-foreground-muted">Open Emergency support for breathing, delay, and grounding tools.</p>
            </div>
          </div>
          <Link href="/emergency">
            <Button size="sm" variant="danger" iconRight={<ArrowRight size={14} />}>
              Emergency support
            </Button>
          </Link>
        </Card>
      )}

      {lastUserIntent === "relapse" && (
        <Card className="flex flex-col gap-3 border-accent/20 bg-accent-soft/40 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <HeartHandshake size={18} className="mt-0.5 shrink-0 text-accent" />
            <div>
              <p className="text-sm font-semibold text-foreground">A slip deserves a reset</p>
              <p className="text-sm text-foreground-muted">Reflect briefly to adjust your plan and restart your streak with clarity.</p>
            </div>
          </div>
          <Link href="/relapse">
            <Button size="sm" variant="secondary" iconRight={<ArrowRight size={14} />}>
              Relapse reflection
            </Button>
          </Link>
        </Card>
      )}

      <Card className="flex flex-1 flex-col gap-4 overflow-hidden p-4 sm:p-5">
        <div className="flex-1 space-y-3 overflow-y-auto max-h-[55vh] pr-1">
          {state.chatHistory.length === 0 && (
            <div className="rounded-xl border border-dashed border-border-soft px-4 py-8 text-center">
              <p className="text-sm text-foreground-muted">
                Start a conversation — or tap a suggestion below.
              </p>
            </div>
          )}
          {state.chatHistory.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn("flex", msg.role === "user" ? "justify-end" : "justify-start")}
            >
              <div
                className={cn(
                  "max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
                  msg.role === "user"
                    ? "bg-accent text-background rounded-br-md"
                    : "bg-surface-raised border border-border-soft text-foreground rounded-bl-md",
                )}
              >
                <FormattedMessage content={msg.content} />
              </div>
            </motion.div>
          ))}
          {sending && (
            <div className="flex justify-start">
              <div className="rounded-2xl rounded-bl-md border border-border-soft bg-surface-raised px-4 py-3">
                <AILoadingDots label="Coach is thinking" />
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {error && (
          <AiErrorState
            message={error}
            compact
            onRetry={pendingRetry ? () => void sendMessage(pendingRetry) : undefined}
          />
        )}

        {!sending && state.chatHistory.length < 4 && (
          <div className="flex flex-wrap gap-2">
            {SUGGESTED_PROMPTS.map((prompt) => (
              <button
                key={prompt}
                type="button"
                onClick={() => void sendMessage(prompt)}
                className="rounded-full border border-border-soft bg-overlay px-3 py-1.5 text-xs text-foreground-muted hover:border-accent/40 hover:text-accent transition-colors"
              >
                {prompt}
              </button>
            ))}
          </div>
        )}

        <div className="flex items-end gap-2">
          <Textarea
            rows={2}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="What's on your mind?"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                void sendMessage(input);
              }
            }}
            disabled={sending}
          />
          <Button
            size="lg"
            disabled={!input.trim() || sending}
            onClick={() => void sendMessage(input)}
            icon={<Send size={16} />}
            aria-label="Send"
          />
        </div>
      </Card>
    </PageContainer>
  );
}

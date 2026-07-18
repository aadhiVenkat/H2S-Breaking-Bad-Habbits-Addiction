"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, MessageCircle, ShieldCheck, Sparkles, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { DisclaimerFooter } from "@/components/layout/DisclaimerFooter";

const FEATURES = [
  {
    icon: MessageCircle,
    title: "An AI coach that actually listens",
    description: "Talk through cravings, slip-ups, or low-motivation days with a coach that remembers your patterns.",
  },
  {
    icon: TrendingUp,
    title: "See your progress, not just your streak",
    description: "Craving trends, trigger patterns, and weekly AI reflections make invisible progress visible.",
  },
  {
    icon: ShieldCheck,
    title: "No shame, ever",
    description: "Relapse is treated as data, not failure. Every flow is built to keep you moving forward.",
  },
];

export default function LandingPage() {
  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-32 left-1/2 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-accent/10 blur-[120px]" />
      </div>

      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent-soft">
            <span className="h-3 w-3 rounded-full bg-accent" />
          </span>
          <span className="font-serif text-2xl italic">Reclaim AI</span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/login" className="text-sm text-foreground-muted transition-colors hover:text-foreground">
            Log in
          </Link>
          <Link href="/login" className="text-sm text-foreground-muted transition-colors hover:text-foreground">
            Create profile
          </Link>
        </div>
      </header>

      <main className="mx-auto flex max-w-3xl flex-col items-center px-6 pb-20 pt-10 text-center sm:pt-16">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-5 inline-flex items-center gap-2 rounded-full border border-border-soft bg-overlay px-3.5 py-1.5 text-xs font-medium text-foreground-muted"
        >
          <Sparkles size={13} className="text-accent" />
          GenAI-powered habit recovery coach
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.05 }}
          className="text-4xl font-semibold tracking-tight text-foreground sm:text-6xl"
        >
          Break the habit.
          <br />
          <span className="text-gradient-accent">Keep your progress.</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.12 }}
          className="mt-5 max-w-xl text-base text-foreground-muted sm:text-lg"
        >
          Reclaim AI pairs a supportive AI coach with real behavioral tracking to help you reduce, replace, or quit
          compulsive habits — one honest day at a time, without judgment.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-8 flex w-full flex-col items-center gap-3 sm:w-auto sm:flex-row"
        >
          <Link href="/login" className="w-full sm:w-auto">
            <Button size="lg" fullWidth className="sm:w-auto" iconRight={<ArrowRight size={18} />}>
              Create profile
            </Button>
          </Link>
          <Link href="/login" className="w-full sm:w-auto">
            <Button size="lg" variant="secondary" fullWidth className="sm:w-auto">
              Log in
            </Button>
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.35 }}
          className="mt-16 grid w-full gap-4 text-left sm:grid-cols-3"
        >
          {FEATURES.map((feature) => {
            const Icon = feature.icon;
            return (
              <div key={feature.title} className="card-surface rounded-2xl p-5">
                <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-accent-soft">
                  <Icon size={18} className="text-accent" />
                </div>
                <h3 className="mb-1.5 text-sm font-semibold text-foreground">{feature.title}</h3>
                <p className="text-sm leading-relaxed text-foreground-muted">{feature.description}</p>
              </div>
            );
          })}
        </motion.div>
      </main>

      <footer className="mx-auto flex max-w-3xl flex-col items-center gap-3 px-6 pb-12 text-center">
        <DisclaimerFooter className="text-center" />
      </footer>
    </div>
  );
}

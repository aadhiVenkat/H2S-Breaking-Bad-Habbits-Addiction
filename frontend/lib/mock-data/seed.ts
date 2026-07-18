import type {
  AIInsight,
  AppState,
  CravingEvent,
  DailyCheckIn,
  EmergencySessionLog,
  Nudge,
  RecoveryPlan,
  RelapseEvent,
  ReplacementHabit,
  TriggerCategory,
  UserProfile,
} from "@/lib/types";
import { daysAgoISO } from "@/lib/utils/dates";
import { computeStreak } from "@/lib/utils/streak";
import { buildMilestones } from "@/lib/mock-data/milestones";

/**
 * Sample journey data for local/dev fixtures. Not exposed in the product UI;
 * live users start via Create profile → onboarding.
 */

const SEED_TRIGGER_CYCLE: TriggerCategory[] = [
  "boredom",
  "stress",
  "night_routine",
  "loneliness",
  "habit_cue",
  "anxiety",
  "fatigue",
];

export const SEED_PROFILE: UserProfile = {
  id: "demo-user",
  name: "Alex",
  createdAt: daysAgoISO(24) + "T09:00:00.000Z",
  onboarded: true,
  habit: {
    habit: "doomscrolling",
    habitLabel: "Doomscrolling",
    frequencyPerDay: 18,
    yearsActive: 3,
    intensity: 4,
    triggers: ["boredom", "stress", "night_routine", "loneliness"],
    peakTimes: ["night", "late_night", "morning"],
    motivation: "I want my evenings and my focus back — I'm tired of losing hours to my phone.",
    goal: "reduce",
  },
  currentPlanId: "plan-seed-1",
};

export const SEED_PLAN: RecoveryPlan = {
  id: "plan-seed-1",
  createdAt: daysAgoISO(24) + "T09:05:00.000Z",
  habit: "doomscrolling",
  goal: "reduce",
  title: "Reclaiming your evenings, one scroll-free hour at a time",
  summary:
    "A gradual, trigger-aware plan built around your biggest pull points — boredom and late-night scrolling — replacing autopilot screen time with small, satisfying rituals.",
  weeks: [
    {
      weekNumber: 1,
      focus: "Notice the pull before you act on it",
      actions: [
        "Log a quick note every time you reach for your phone out of boredom",
        "Move your phone charger outside the bedroom",
        "Try one 10-minute replacement activity during your usual night scroll window",
      ],
    },
    {
      weekNumber: 2,
      focus: "Build a replacement ritual for your peak trigger window",
      actions: [
        "Set a screen-dim reminder 30 minutes before your usual scroll time",
        "Pick one replacement habit and use it at least 4 nights this week",
        "Do a 2-minute breathing reset whenever a craving hits above 6/10",
      ],
    },
    {
      weekNumber: 3,
      focus: "Strengthen your streak with social support",
      actions: [
        "Tell one person about your goal this week",
        "Batch-check social apps twice a day instead of constantly",
        "Celebrate small wins — write down one win each night",
      ],
    },
    {
      weekNumber: 4,
      focus: "Make the new pattern stick",
      actions: [
        "Review your triggers and update your replacement list with what's working",
        "Plan for a known high-risk day (travel, stress, social event) in advance",
        "Reflect on how your evenings feel different from day one",
      ],
    },
  ],
  dailyPractices: [
    "Morning intention: name today's biggest trigger before it happens",
    "Midday check: rate your craving intensity once",
    "Night wind-down: swap the last scroll session for your chosen replacement",
  ],
  milestoneDays: [1, 3, 7, 14, 21, 30, 45, 60, 90],
};

function buildSeedCheckIns(): DailyCheckIn[] {
  const days = 20;
  const checkIns: DailyCheckIn[] = [];
  for (let i = days; i >= 1; i -= 1) {
    const date = daysAgoISO(i);
    const wave = Math.sin(i / 3) * 1.5;
    const trend = (days - i) * -0.12;
    const cravingIntensity = Math.max(1, Math.min(9, Math.round(5.5 + wave + trend)));
    const mood = Math.max(1, Math.min(5, Math.round(3 + (days - i) * 0.06 - wave / 3))) as DailyCheckIn["mood"];
    const trigger = SEED_TRIGGER_CYCLE[i % SEED_TRIGGER_CYCLE.length];
    const difficulty = Math.max(1, Math.min(5, Math.round(cravingIntensity / 2))) as DailyCheckIn["difficulty"];

    checkIns.push({
      id: `checkin-${date}`,
      date,
      mood,
      cravingIntensity,
      triggers: [trigger],
      difficulty,
      journal:
        i % 4 === 0
          ? "Rough patch in the evening but I caught myself before spiraling into an hour of scrolling."
          : "Steady day. Stayed aware of my phone pickups.",
      aiSummary:
        i % 4 === 0
          ? "A harder evening, driven by loneliness — but you noticed the pattern early and that awareness is real progress."
          : "A calmer, more aware day. Your evening routine is starting to hold.",
      aiGuidance:
        i % 4 === 0
          ? "Tonight, try texting a friend instead of opening social apps — connection often resolves loneliness faster than scrolling does."
          : "Keep the same wind-down routine tonight. Consistency is what turns this into a habit.",
    });
  }
  return checkIns;
}

function buildSeedCravingEvents(): CravingEvent[] {
  const events: CravingEvent[] = [];
  const days = 20;
  for (let i = days; i >= 1; i -= 1) {
    const date = daysAgoISO(i);
    const perDay = i % 3 === 0 ? 2 : 1;
    for (let j = 0; j < perDay; j += 1) {
      const hour = j === 0 ? 21 : 8;
      const trigger = SEED_TRIGGER_CYCLE[(i + j) % SEED_TRIGGER_CYCLE.length];
      const intensity = Math.max(1, Math.min(9, Math.round(6 - (days - i) * 0.1 + (j === 0 ? 1 : -1))));
      events.push({
        id: `craving-${date}-${j}`,
        timestamp: `${date}T${String(hour).padStart(2, "0")}:${j === 0 ? "40" : "15"}:00.000Z`,
        intensity,
        trigger,
        resisted: !(i === 11 || i === 4),
        note: undefined,
      });
    }
  }
  return events;
}

const SEED_RELAPSES: RelapseEvent[] = [
  {
    id: "relapse-1",
    timestamp: daysAgoISO(11) + "T22:30:00.000Z",
    trigger: "loneliness",
    intensityBefore: 8,
    reflection: "Felt really isolated after a quiet weekend and lost track of time scrolling for almost two hours.",
    whatHelped: "Talking to my sister the next morning helped me reset.",
    aiGuidance:
      "Loneliness late at night is your strongest pull. A two-hour session isn't a failure — it's data. We adjusted your plan to add a same-night connection ritual.",
    updatedPlanNote: "Added: text or call one person before 9pm on quiet weekend nights.",
  },
  {
    id: "relapse-2",
    timestamp: daysAgoISO(4) + "T23:10:00.000Z",
    trigger: "stress",
    intensityBefore: 7,
    reflection: "Stressful day at work, opened social apps to numb out and scrolled longer than I meant to.",
    whatHelped: "Journaling for five minutes afterward helped me stop and reflect instead of continuing.",
    aiGuidance:
      "Stress-driven scrolling is common and treatable — your recovery is on track. We're adding a 5-minute decompression step right after work, before screens.",
    updatedPlanNote: "Added: 5-minute walk or stretch immediately after work, before checking phone.",
  },
];

function buildSeedReplacementHabits(): ReplacementHabit[] {
  return [
    {
      id: "rep-1",
      title: "2-minute stretch reset",
      description: "A short stretch sequence to interrupt the urge to pick up your phone.",
      linkedTriggers: ["boredom", "fatigue"],
      timesUsed: 9,
      rating: 4,
      savedByUser: true,
      aiGenerated: true,
    },
    {
      id: "rep-2",
      title: "Text a friend instead",
      description: "Send one message to someone you like talking to, before opening social apps.",
      linkedTriggers: ["loneliness", "night_routine"],
      timesUsed: 6,
      rating: 5,
      savedByUser: true,
      aiGenerated: true,
    },
    {
      id: "rep-3",
      title: "Read one page",
      description: "Open a physical book or e-reader and commit to just one page — often turns into more.",
      linkedTriggers: ["night_routine", "boredom"],
      timesUsed: 4,
      rating: 4,
      savedByUser: true,
      aiGenerated: false,
    },
    {
      id: "rep-4",
      title: "5-minute tidy sprint",
      description: "Reset one small area of your space — desk, nightstand, kitchen counter.",
      linkedTriggers: ["stress", "boredom"],
      timesUsed: 2,
      rating: null,
      savedByUser: false,
      aiGenerated: true,
    },
    {
      id: "rep-5",
      title: "Step outside for air",
      description: "Even two minutes on a balcony or doorstep resets your nervous system.",
      linkedTriggers: ["stress", "anxiety", "conflict"],
      timesUsed: 3,
      rating: 3,
      savedByUser: false,
      aiGenerated: true,
    },
  ];
}

function buildSeedNudges(): Nudge[] {
  return [
    {
      id: "nudge-1",
      createdAt: new Date().toISOString(),
      tone: "check_in",
      message: "Evenings have been your toughest window this week. Want a 2-minute grounding exercise before tonight's wind-down?",
      actionLabel: "Try grounding",
      actionHref: "/emergency",
    },
    {
      id: "nudge-2",
      createdAt: new Date().toISOString(),
      tone: "encouragement",
      message: "You've resisted 8 out of your last 10 logged cravings. That ratio is genuinely strong — your awareness is working.",
    },
    {
      id: "nudge-3",
      createdAt: new Date().toISOString(),
      tone: "milestone",
      message: "You're a few days from your next milestone. Keep the streak visible on your dashboard as a reminder of your progress.",
      actionLabel: "View milestones",
      actionHref: "/dashboard",
    },
  ];
}

const SEED_INSIGHT: AIInsight = {
  id: "insight-seed-1",
  createdAt: daysAgoISO(1) + "T08:00:00.000Z",
  period: "weekly",
  headline: "Your evenings are steadily getting easier",
  reflection:
    "Over the last 7 days, your average craving intensity dropped from 6.1 to 4.8, and you resisted 80% of logged urges — up from 60% two weeks ago. Loneliness and stress remain your top triggers, both concentrated between 9-11pm. Your two relapses this month both followed quiet, unstructured evenings, which is a useful pattern to plan around rather than a sign of failure.",
  suggestions: [
    "Pre-plan quiet evenings with one small social touchpoint before 9pm",
    "Keep using the stretch reset — it's your most-used and highest-rated replacement habit",
    "Consider a short wind-down alarm 30 minutes before your typical peak scroll time",
  ],
  trendDirection: "improving",
};

function buildSeedEmergencyLogs(): EmergencySessionLog[] {
  return [
    {
      id: "em-1",
      timestamp: daysAgoISO(4) + "T21:50:00.000Z",
      toolUsed: "breathing",
      cravingIntensityBefore: 7,
      cravingIntensityAfter: 4,
      note: "Used breathing timer during a stressful evening.",
    },
    {
      id: "em-2",
      timestamp: daysAgoISO(9) + "T22:05:00.000Z",
      toolUsed: "delay",
      cravingIntensityBefore: 6,
      cravingIntensityAfter: 3,
    },
  ];
}

export function buildSeedState(): AppState {
  const checkIns = buildSeedCheckIns();
  const cravingEvents = buildSeedCravingEvents();
  const streak = computeStreak(daysAgoISO(4), SEED_RELAPSES);
  const milestones = buildMilestones(streak.currentStreakDays);

  return {
    profile: SEED_PROFILE,
    assessment: null,
    plan: SEED_PLAN,
    checkIns,
    cravingEvents,
    relapseEvents: SEED_RELAPSES,
    streak,
    nudges: buildSeedNudges(),
    replacementHabits: buildSeedReplacementHabits(),
    chatHistory: [
      {
        id: "chat-seed-1",
        role: "assistant" as const,
        content:
          "Hi Alex — I'm your Reclaim AI coach. I've seen your last few check-ins, and I noticed evenings have been the toughest window. Want to talk through what's coming up tonight, or just check in on how you're doing?",
        timestamp: daysAgoISO(1) + "T20:00:00.000Z",
      },
    ],
    insights: [SEED_INSIGHT],
    milestones,
    emergencyLogs: buildSeedEmergencyLogs(),
    hydrated: true,
  };
}

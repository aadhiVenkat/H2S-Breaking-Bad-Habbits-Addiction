# Reclaim AI — React (Next.js) frontend

The Reclaim AI UI is built with **React** on **Next.js 15** (App Router), TypeScript, and Tailwind CSS.

## Purpose

Renders the recovery journey: landing, login, onboarding, dashboard, coach, check-ins, insights, emergency tools, relapse reflection, and profile. Calls the Express backend for live AI features via `NEXT_PUBLIC_API_BASE_URL`. Per-user progress is stored in **localStorage** (`reclaim_state_<userId>`). Accounts and sessions use `reclaim_accounts_v1` / `reclaim_session_v1`.

## Routes

| Route | Purpose |
|-------|---------|
| `/` | Landing — create profile or log in |
| `/login` | Create profile or log in (local username/password) |
| `/onboarding` | Multi-step assessment → AI-generated recovery plan |
| `/dashboard` | Streak, smart nudges, quick actions, craving trend, milestones |
| `/coach` | Conversational AI coach |
| `/check-in` | Daily mood/craving/trigger log; optional AI summarize |
| `/insights` | Charts + weekly AI reflection |
| `/emergency` | Craving support tools |
| `/relapse` | Compassionate relapse reflection |
| `/profile` | Account, API key (BYOK), habit profile, replacements, AI status |

## Stack

- **React 19** + **Next.js 15** (App Router)
- TypeScript, Tailwind CSS, Framer Motion, Recharts
- Client store: React context + `useReducer` → localStorage
- Auth: client-only username/password (Web Crypto SHA-256)

## Setup

```bash
cd frontend
cp .env.example .env.local
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Environment

| Variable | Default | Description |
|----------|---------|-------------|
| `NEXT_PUBLIC_API_BASE_URL` | `http://localhost:4000` | Express backend origin (no trailing slash) |

Required per-user Google Gemini keys are stored in the browser and sent as `X-Gemini-Key`. Server `GEMINI_API_KEY` is a fallback when no browser key is sent. Provider env keys belong in the **backend** `.env`, not here.

### Scripts

```bash
npm run dev      # Next.js development server
npm run build    # production build
npm start        # serve production build
npm test         # vitest
```

Ensure the backend is running on port 4000 so Profile → AI status can reach `GET /api/ai/health`.

Production deploy (Firebase App Hosting + Cloud Run) is documented in [`../DEPLOY.md`](../DEPLOY.md).

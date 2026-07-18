# Reclaim AI

## Use case

Reclaim AI helps people who want to **quit, reduce, or replace** a compulsive habit (doomscrolling, smoking, vaping, alcohol, junk food, gambling, and similar patterns). It guides them from a short onboarding assessment into a personalized recovery plan, then supports day-to-day recovery with check-ins, an AI coach, emergency craving tools, relapse reflection, and progress insights — without shame or clinical pretenses.

## Description

Reclaim AI is split into two packages:

| Package | Stack | Role |
|---------|--------|------|
| [`frontend/`](frontend/) | **React (Next.js)** | UI, routing, localStorage auth + state |
| [`backend/`](backend/) | **Express + TypeScript** | AI API (Gemini) |
| [`shared/`](shared/) | TypeScript types | Domain contracts shared by both |

Personal data and accounts stay in the browser (**localStorage**). A required per-user Gemini API key (BYOK) is sent as `X-Gemini-Key`; otherwise the backend uses `GEMINI_API_KEY`. No cloud user database.

> **Safety disclaimer:** Reclaim AI is a wellness support tool, not clinical care, therapy, or a medical device. It does not diagnose or treat addiction. If you are in crisis or at risk of harm, contact local emergency services or a qualified professional.

## Quick start (both processes)

**1. Backend** (port 4000):

```bash
cd backend
cp .env.example .env   # add GEMINI_API_KEY
npm install
npm run dev
```

**2. Frontend** (port 3000):

```bash
cd frontend
cp .env.example .env.local   # NEXT_PUBLIC_API_BASE_URL=http://localhost:4000
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Create a profile or log in, then check AI readiness at **Profile → AI status**, or:

```bash
curl http://localhost:4000/api/ai/health
```

## Folder map

```
H2S-Breaking-Bad-Happits-Addiction/
├── README.md          # this file
├── DEPLOY.md          # Firebase Blaze / Cloud Run / App Hosting
├── firebase.json      # App Hosting (frontend)
├── frontend/          # React (Next.js) UI
├── backend/           # Express AI API (+ Dockerfile for Cloud Run)
└── shared/            # shared domain types
```

See each package README for routes, env vars, and scripts. Production deploy steps are in [`DEPLOY.md`](DEPLOY.md).

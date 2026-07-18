# Reclaim AI — Express backend

**Express + TypeScript** API that powers Reclaim AI’s live AI features (Gemini).

## Purpose

Accepts prompt payloads from the React (Next.js) frontend, calls Gemini, validates JSON shapes, and returns typed domain objects. No user accounts or persistent storage — the frontend keeps personal data in localStorage.

## Setup

```bash
cd backend
cp .env.example .env
npm install
npm run dev
```

Server listens on [http://localhost:4000](http://localhost:4000) by default.

### Environment

| Variable | Required | Description |
|----------|----------|-------------|
| `GEMINI_API_KEY` | Fallback for Gemini routes | Used when the client does not send `X-Gemini-Key` |
| `GEMINI_MODEL` | No | Default `gemini-3.5-flash` |
| `PORT` | No | Default `4000` |
| `CORS_ORIGIN` | No | Default `http://localhost:3000` |

### Bring-your-own Gemini key

Gemini routes (and health ping) accept a required user `X-Gemini-Key` header when present and non-empty; otherwise the server falls back to `GEMINI_API_KEY` (useful for Cloud Run / local without a browser key).

### Scripts

```bash
npm run dev      # tsx watch
npm run build    # typecheck (tsc --noEmit)
npm start        # run with tsx (also used in Docker / Cloud Run)
npm test         # vitest
```

### Production / Cloud Run

`Dockerfile` runs `npm start` (`tsx`) and listens on `PORT` (Cloud Run default `8080`). See [`../DEPLOY.md`](../DEPLOY.md) for `gcloud run deploy` commands, env vars, and CORS wiring.

## Endpoints

All under `/api/ai`:

| Method | Path | Provider |
|--------|------|----------|
| `GET` | `/api/ai/health` | — (optional `?ping=1`) |
| `POST` | `/api/ai/plan` | Gemini |
| `POST` | `/api/ai/coach` | Gemini |
| `POST` | `/api/ai/checkin` | Gemini |
| `POST` | `/api/ai/emergency` | Gemini |
| `POST` | `/api/ai/relapse` | Gemini |
| `POST` | `/api/ai/nudge` | Gemini |
| `POST` | `/api/ai/insight` | Gemini |
| `POST` | `/api/ai/replacements` | Gemini |

### Health check

```bash
curl http://localhost:4000/api/ai/health
```

Returns configured models and whether keys are present (never returns secret values). Send `X-Gemini-Key` to check a user-supplied key.

## CORS

`CORS_ORIGIN` must match the frontend origin (default `http://localhost:3000`). Allowed headers include `Content-Type` and `X-Gemini-Key`.

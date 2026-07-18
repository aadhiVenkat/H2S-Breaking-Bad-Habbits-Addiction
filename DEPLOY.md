# Firebase deploy guide (beginner)

Deploy **Reclaim AI** to Firebase on the **Blaze** plan.

| Part | Goes to | Folder |
|------|---------|--------|
| Website (Next.js) | Firebase **App Hosting** | `frontend/` |
| AI API (Express) | Google **Cloud Run** | `backend/` |
| User data | Browser only (`localStorage`) | — |

**Your Firebase project ID:** `reclaim-ai-f207c` (already in `.firebaserc`)

**Order:** backend first → frontend second → fix CORS last.

Commands below are for **PowerShell** on Windows.

---

## Checklist

- [ ] Step 0 — Install tools
- [ ] Step 1 — Login and enable APIs
- [ ] Step 2 — Deploy backend (Cloud Run)
- [ ] Step 3 — Set Gemini API key
- [ ] Step 4 — Put Cloud Run URL in `frontend/apphosting.yaml`
- [ ] Step 5 — Deploy frontend (App Hosting)
- [ ] Step 6 — Set `CORS_ORIGIN` to the live site URL
- [ ] Step 7 — Open the site and test AI

---

## Step 0 — Install tools (one time)

1. **Node.js** — https://nodejs.org/ (LTS)
2. **Firebase CLI**

   ```powershell
   npm install -g firebase-tools
   firebase --version
   ```

3. **Google Cloud SDK (`gcloud`)** — https://cloud.google.com/sdk/docs/install  
   After install, **close and reopen** PowerShell, then:

   ```powershell
   gcloud --version
   ```

---

## Step 1 — Login and enable APIs

```powershell
cd D:\H2S\H2S-Main-Challenge\H2S-Breaking-Bad-Happits-Addiction

firebase login
gcloud auth login
gcloud config set project reclaim-ai-f207c
```

Confirm Blaze is enabled: [Firebase Console](https://console.firebase.google.com/) → project **reclaim-ai-f207c** → billing shows **Blaze**.

Enable APIs:

```powershell
gcloud services enable run.googleapis.com cloudbuild.googleapis.com artifactregistry.googleapis.com firebase.googleapis.com
```

---

## Step 2 — Deploy the backend (AI API)

```powershell
cd D:\H2S\H2S-Main-Challenge\H2S-Breaking-Bad-Happits-Addiction\backend

gcloud run deploy breakfree-api `
  --source . `
  --region us-central1 `
  --allow-unauthenticated `
  --port 8080 `
  --set-env-vars "CORS_ORIGIN=http://localhost:3000"
```

- First deploy often takes **5–10 minutes**.
- When it finishes, **copy the Service URL**, for example:  
  `https://breakfree-api-xxxxx-uc.a.run.app`  
  You need this URL in later steps. Call it **CLOUD_RUN_URL**.

Temporary CORS (`localhost`) is fine until the website is live (Step 6).

---

## Step 3 — Set API keys on Cloud Run

Do **not** put keys in git or commit them.

```powershell
gcloud run services update breakfree-api `
  --region us-central1 `
  --update-env-vars "GEMINI_API_KEY=YOUR_GEMINI_KEY,CORS_ORIGIN=http://localhost:3000"
```

Replace `YOUR_GEMINI_KEY` with your key from [Google AI Studio](https://aistudio.google.com/apikey).

**Health check:**

```powershell
curl https://YOUR_CLOUD_RUN_URL/api/ai/health
```

You should get JSON back (not an HTML error page).

---

## Step 4 — Point the frontend at the API

Open `frontend/apphosting.yaml` and set `NEXT_PUBLIC_API_BASE_URL` to your **CLOUD_RUN_URL** (no trailing slash):

```yaml
env:
  - variable: NEXT_PUBLIC_API_BASE_URL
    value: https://breakfree-api-xxxxx-uc.a.run.app
    availability:
      - BUILD
      - RUNTIME
```

Save the file. This value must be present at **build** time so the browser can call the API.

---

## Step 5 — Deploy the frontend

From the **repo root**:

```powershell
cd D:\H2S\H2S-Main-Challenge\H2S-Breaking-Bad-Happits-Addiction

firebase use reclaim-ai-f207c
```

### First time only — create App Hosting

```powershell
firebase init apphosting
```

When asked:

| Prompt | Answer |
|--------|--------|
| Project | `reclaim-ai-f207c` |
| Backend id | `breakfree-web` |
| Root directory | `frontend` |

### Deploy

```powershell
firebase deploy --only apphosting:breakfree-web
```

When it finishes, **copy the App Hosting URL**. Call it **APP_HOSTING_URL**.

### If CLI deploy fails

Use the console instead:

1. [Firebase Console](https://console.firebase.google.com/) → **App Hosting** → Create backend  
2. Connect your GitHub repo  
3. Set **root directory** to `frontend`  
4. Set env var `NEXT_PUBLIC_API_BASE_URL` = your Cloud Run URL  
5. Deploy / roll out  

---

## Step 6 — Fix CORS (required)

The API must allow requests from your live website:

```powershell
gcloud run services update breakfree-api `
  --region us-central1 `
  --update-env-vars "CORS_ORIGIN=https://YOUR_APP_HOSTING_URL"
```

Rules:

- Use `https://...`
- No path (`/dashboard` etc.)
- No trailing slash  
- Must match the site origin **exactly**

If you later change `NEXT_PUBLIC_API_BASE_URL`, redeploy the frontend so the new build picks it up.

---

## Step 7 — Verify

1. Open **APP_HOSTING_URL** in the browser.  
2. Create a profile / complete onboarding.  
3. Open **Profile → AI status**, or:

   ```powershell
   curl https://YOUR_CLOUD_RUN_URL/api/ai/health
   ```

4. Try Coach or Check-in (needs valid API keys).

---

## Common problems

| Problem | What to do |
|---------|------------|
| `gcloud` / `firebase` not found | Reopen PowerShell after install; check `npm` global path |
| Billing / permission errors | Confirm Blaze on project `reclaim-ai-f207c` |
| Browser CORS errors | Set `CORS_ORIGIN` to the exact App Hosting URL (Step 6) |
| AI calls go to localhost | Fix `NEXT_PUBLIC_API_BASE_URL` in `apphosting.yaml` and **redeploy** frontend |
| First deploy is slow | Normal for Cloud Build / App Hosting |
| Keys leaked in chat/git | Rotate keys at Google AI Studio and update Cloud Run env |

---

## Optional: Cloud Build YAML

`backend/cloudbuild.yaml` can build and push an image, then deploy Cloud Run. Create the Artifact Registry repo once:

```powershell
gcloud artifacts repositories create breakfree-api `
  --repository-format=docker `
  --location=us-central1

cd D:\H2S\H2S-Main-Challenge\H2S-Breaking-Bad-Happits-Addiction\backend
gcloud builds submit --config cloudbuild.yaml .
```

Still set env vars / keys on the Cloud Run service afterward (Steps 3 and 6).

---

## Optional: local Docker smoke test

```powershell
cd D:\H2S\H2S-Main-Challenge\H2S-Breaking-Bad-Happits-Addiction\backend
docker build -t breakfree-api .
docker run --rm -p 8080:8080 `
  -e GEMINI_API_KEY= `
  -e CORS_ORIGIN=http://localhost:3000 `
  breakfree-api
```

---

## Config files in this repo

| Path | Role |
|------|------|
| `.firebaserc` | Default project: `reclaim-ai-f207c` |
| `firebase.json` | App Hosting → `frontend/`, backend id `breakfree-web` |
| `frontend/apphosting.yaml` | Run size + `NEXT_PUBLIC_API_BASE_URL` |
| `backend/Dockerfile` | Cloud Run image |
| `backend/.dockerignore` | Slimer image build |
| `backend/cloudbuild.yaml` | Optional image + deploy pipeline |

---

## Placeholders you replace

| Name | Example | Where |
|------|---------|--------|
| `CLOUD_RUN_URL` | `https://breakfree-api-xxxxx-uc.a.run.app` | `apphosting.yaml`, health curls |
| `APP_HOSTING_URL` | `https://....hosted.app` | Cloud Run `CORS_ORIGIN` |
| API keys | from Google AI Studio | Cloud Run env only (never commit) |

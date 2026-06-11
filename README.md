# AI-Career-Path-Recommendation-System
University final project

## ML career API (Flask) — if you see “connection refused” on port 5052

The .NET backend calls `http://127.0.0.1:5052` when `ML:PythonPredictStyle` is `Flask`. That server must be running in a **separate terminal**:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\start-flask-career-api-window.ps1
```

Or: `cd ml\career_flask_api` → `.\start-career-api.ps1` (installs Python deps automatically if needed). Details: `ml/career_flask_api/README.md`.

## Front end (React / Vite)

The UI is in the **`Front End`** folder (not the repo root).

```powershell
cd C:\Project\AI-Career-Path-Recommendation-System
npm run install:front
npm run dev
```

Or from the app folder only:

```powershell
cd "C:\Project\AI-Career-Path-Recommendation-System\Front End"
npm install
npm run dev
```

Vite usually serves at **http://localhost:5173** — keep the **Back-End** API on **http://localhost:8000** (see `Back-End/Properties/launchSettings.json`).

## Deploy on Vercel (full stack — migration in progress)

The app can run **on Vercel only** using **serverless API** (`api/`) + **MongoDB Atlas** (free). Routes are ported **one by one** from .NET.

### Phase 1 (done): Auth + health

| Route | Status |
|-------|--------|
| `GET /api/health/db` | Native (MongoDB) |
| `POST /api/auth/signup` | Native |
| `POST /api/auth/login-json` | Native |
| `GET /api/auth/me` | Native |
| All other `/api/*` | 501 until ported, or proxy if `BACKEND_API_BASE_URL` set |

### Setup Vercel + MongoDB Atlas (free)

1. [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) → free cluster → **Connect** → driver → copy URI.
2. Replace `<password>` and allow **Network Access** `0.0.0.0/0` (or Vercel IPs).
3. Vercel → Project → **Environment Variables**:
   - `MONGODB_URI` = your Atlas connection string
   - `JWT_KEY` = long random secret (recommended)
   - Optional: `BACKEND_API_BASE_URL` = Render URL for routes not ported yet
4. Push repo and **Redeploy** Vercel.
5. Test: `https://YOUR-APP.vercel.app/api/health/db` → `"ok": true`
6. Test login/signup on your Vercel site.

### Legacy: Vercel UI + Render .NET backend

See **Render** section below if you prefer keeping the full .NET API until migration finishes.

## Deploy free: Vercel (frontend) + Render (backend)

Vercel **cannot** run the .NET API. Use **one GitHub repo**, two **free** hosts:

| Part | Host | Cost |
|------|------|------|
| React UI | [Vercel](https://vercel.com) | Free |
| .NET API + PostgreSQL | [Render](https://render.com) | **Free tier** |

> **Render free note:** The API **sleeps after ~15 minutes** with no traffic. The first request after sleep may take **30–60 seconds** (cold start). Fine for demos and coursework.

### 1. Backend on Render (free, like Railway)

1. Push this repo to GitHub.
2. Go to [dashboard.render.com](https://dashboard.render.com) → sign up (GitHub login).
3. **New** → **Blueprint** → connect this repository.
4. Render reads `render.yaml` and creates:
   - **Web Service** `career-path-api` (Docker, free)
   - **PostgreSQL** `career-path-db` (free)
5. When prompted, set environment variables:
   - `CORS_ORIGIN` = `https://YOUR-PROJECT.vercel.app` (your Vercel URL)
   - `GEMINI_API_KEY` = optional, for AI recommendations
6. Wait for deploy to finish → copy the API URL, e.g. `https://career-path-api.onrender.com`.
7. Test: `https://career-path-api.onrender.com/api/health/db` → `"ok": true`.

**Manual setup (without Blueprint):** New → Web Service → Docker → repo root → Dockerfile path `Back-End/Dockerfile`. Add free PostgreSQL separately and set `DATABASE_URL` on the web service.

### 2. Frontend on Vercel

1. [vercel.com](https://vercel.com) → import the **same repo**.
2. Root `vercel.json` builds `Front End` and runs `scripts/prepare-vercel.mjs`.
3. **Environment Variables** (Production):
   - `BACKEND_API_BASE_URL` = `https://career-path-api.onrender.com` (your Render URL)
4. **Redeploy** after saving the variable.

The repo includes `api/[...path].js` — Vercel proxies `/api/*` to Render (same-origin, no CORS issues).

### 3. Verify

- Open your Vercel URL → no yellow “backend not connected” banner (if `BACKEND_API_BASE_URL` was set before build).
- First login after idle may be slow (Render waking up).
- Sign up / log in / recommendations should work.

### Paid alternative: Railway

If you need **always-on** (no sleep), use [Railway](https://railway.app) (~$5/month Hobby) with `railway.toml` instead of Render. Steps are similar: deploy repo, add Postgres, set `CORS_ORIGIN`, put the Railway URL in Vercel `BACKEND_API_BASE_URL`.


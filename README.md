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

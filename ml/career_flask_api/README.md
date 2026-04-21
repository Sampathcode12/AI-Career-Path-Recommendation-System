# Career recommendation Flask API

Production-style Flask service that loads your Colab exports (`vectorizer.pkl`, `career_model.pkl`, `label_encoder.pkl`) and returns career predictions from a single text field (skills, interests, education, certifications combined).

## 0. Verify the model (before starting Flask)

From `ml/career_flask_api`:

```powershell
# If your files are in Downloads:
$env:CAREER_MODEL_DIR = "C:\Users\Lahiru\Downloads\model"
python verify_ml_model.py
```

You should see **All checks passed.** If Colab saved objects with **`joblib.dump`** but used a **`.pkl`** filename, that is supported (the loader tries `pickle` then `joblib`). If you see **InconsistentVersionWarning** for scikit-learn, consider `pip install scikit-learn==1.6.1` (match your Colab version) for identical behavior.

---

## 1. Place model files

Copy these three files into **either**:

- **`ml/career_flask_api/models/`** (default), or  
- Any folder you point to with **`CAREER_MODEL_DIR`**

Required filenames (exact):

- `vectorizer.pkl` — TF-IDF vectorizer  
- `career_model.pkl` — trained classifier  
- `label_encoder.pkl` — sklearn `LabelEncoder` (or compatible)

Example (PowerShell):

```powershell
New-Item -ItemType Directory -Force -Path "C:\Project\AI-Career-Path-Recommendation-System\ml\career_flask_api\models"
Copy-Item "C:\Users\Lahiru\Downloads\model\*.pkl" -Destination "C:\Project\AI-Career-Path-Recommendation-System\ml\career_flask_api\models\"
```

Or use your Downloads folder directly:

```powershell
$env:CAREER_MODEL_DIR = "C:\Users\Lahiru\Downloads\model"
```

## 2. Install dependencies

```powershell
cd C:\Project\AI-Career-Path-Recommendation-System\ml\career_flask_api
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

Use the **same Python version** you used in Colab when exporting the pickles (e.g. 3.10–3.12), and matching **scikit-learn** major version if possible, to avoid unpickling issues.

## 3. Run the server

**Option A — Flask dev server (simplest):**

```powershell
cd C:\Project\AI-Career-Path-Recommendation-System\ml\career_flask_api
$env:CAREER_MODEL_DIR = "C:\Users\Lahiru\Downloads\model"   # optional if files are in .\models\
python app.py
```

**One-liner (PowerShell):** from this folder run `.\start-career-api.ps1` (uses `.venv` if present).

By default the API listens on **http://127.0.0.1:5052** (port 5000 is often busy on Windows).

Optional environment variables:

| Variable | Purpose |
|----------|---------|
| `CAREER_MODEL_DIR` | Directory containing the three `.pkl` files |
| `HOST` | Bind address (default `127.0.0.1`) |
| `PORT` | Port (default **5052**; set to another value if the port is in use, and match `ML:PythonPredictBaseUrl` in appsettings) |
| `FLASK_DEBUG` | `1` / `true` for debug mode |
| `CORS_ORIGINS` | Extra allowed origins, comma-separated |
| `CORS_ALLOW_ALL` | Set to `1` or `true` to allow any origin (handy for PHP / ad-hoc dev ports; avoid in production with cookies) |

**Option B — Flask CLI:**

```powershell
cd C:\Project\AI-Career-Path-Recommendation-System\ml\career_flask_api
$env:FLASK_APP = "app.py"
flask run --host 127.0.0.1 --port 5052
```

**Option C — Production-style (Linux/macOS):** use a WSGI server such as Gunicorn:

```bash
pip install gunicorn
gunicorn -w 2 -b 0.0.0.0:5052 app:app
```

On Windows, consider **waitress** instead:

```powershell
pip install waitress
waitress-serve --listen=127.0.0.1:5052 app:app
```

## 4. API

### `GET /`

Health check. Example response:

```json
{
  "status": "ok",
  "service": "career-recommendation-api",
  "model_loaded": true,
  "model_error": null
}
```

If `model_loaded` is `false`, check `model_error` and verify `CAREER_MODEL_DIR` and file names.

### `POST /recommend-career`

**Request** (`Content-Type: application/json`):

```json
{
  "text": "python sql machine learning data analysis"
}
```

**Response:**

```json
{
  "best_career": "data_science"
}
```

The server lowercases and trims `text` before vectorizing.

### `POST /recommend-top3`

Same body as above. **Response:**

```json
{
  "recommendations": [
    { "career": "data_science", "probability": 0.52 },
    { "career": "software_engineering", "probability": 0.25 },
    { "career": "business_analysis", "probability": 0.12 }
  ]
}
```

Requires a model with **`predict_proba`** (e.g. Random Forest, Logistic Regression, XGBoost). Plain `SVC` without `probability=True` returns **501** with `code: MODEL_NO_PROBA`.

### Error responses

JSON shape: `{ "error": "...", "code": "..." }` with appropriate HTTP status (400, 415, 500, 501, 503).

Examples: empty `text`, missing `text`, invalid JSON, model files missing.

## 5. Quick test (curl)

```powershell
curl http://127.0.0.1:5052/

curl -X POST http://127.0.0.1:5052/recommend-career -H "Content-Type: application/json" -d "{\"text\": \"python sql machine learning\"}"

curl -X POST http://127.0.0.1:5052/recommend-top3 -H "Content-Type: application/json" -d "{\"text\": \"python sql machine learning\"}"
```

## 6. Project layout

```
career_flask_api/
  app.py              # Flask routes, CORS, error handling
  model_loader.py     # Load pickles from disk
  predictor.py        # Preprocess + predict
  requirements.txt
  README.md
  models/             # Put vectorizer.pkl, career_model.pkl, label_encoder.pkl here (or use CAREER_MODEL_DIR)
```

CORS is enabled for common local frontends (Vite, React, .NET dev ports). Add more with `CORS_ORIGINS`.

## 7. “Could not reach the Flask career API” (.NET / React)

**`actively refused`** means nothing is listening on that port — usually the Flask process is **not running** or it **exited immediately** (often **`ModuleNotFoundError: flask`** if dependencies were never installed).

1. **From repo root**, open a dedicated window (stays open):  
   `powershell -ExecutionPolicy Bypass -File .\scripts\start-flask-career-api-window.ps1`  
   Or from `ml/career_flask_api`: `.\start-career-api.ps1` (it will **`pip install -r requirements.txt`** if Flask/sklearn are missing).
2. **Leave that window open** until you stop coding. If it closes right away, read the red error text — fix `pip install` or Python path (`py -3` vs `python`).
3. **Match the URL:** `Back-End/appsettings.json` → `ML:PythonPredictBaseUrl` must match the URL printed when Flask starts (default `http://127.0.0.1:5052`).
4. **Quick test:** `Invoke-WebRequest -Uri http://127.0.0.1:5052/ -UseBasicParsing` — expect JSON with `model_loaded`.
5. **Port in use:** `$env:PORT = 5100`, run the start script again, then set `PythonPredictBaseUrl` to `http://127.0.0.1:5100`.
6. **Restart the .NET API** after changing `appsettings.json`.

**Note:** A **Gemini** API key (see `docs/OPENAI-SETUP.md`) is only for the **LLM** (wording of careers + chat). The **Flask** service is your **separate** survey ML model — you still need it running for `PythonPredictStyle: Flask`.

**Development auto-start:** `Back-End/appsettings.Development.json` sets **`ML:AutoStartFlask`: true** so the .NET API can spawn `python app.py` in this folder when nothing responds on `PythonPredictBaseUrl`. Disable with **`AutoStartFlask`: false** if you prefer a manual terminal. Production `appsettings.json` uses **`AutoStartFlask`: false**.

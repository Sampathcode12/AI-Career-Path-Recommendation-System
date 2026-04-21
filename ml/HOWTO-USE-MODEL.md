# Use your Colab-trained model in this project

You trained **TF-IDF text features** + **XGBoost** to predict `target_clean` (interest categories: `technology`, `data_science`, etc.) from three text fields. The .NET + React app does not run Python by default, so the simplest path is a **small local Python API** that loads your saved files; the front end or back end can call it over HTTP.

---

## Step 1 — Save files from Colab (once)

### If you use **pickle** like `untitled5.py` (Downloads)

After your last successful `model.fit(...)`:

```python
import pickle
from pathlib import Path

out = Path("/content/artifacts")
out.mkdir(parents=True, exist_ok=True)

with open(out / "vectorizer.pkl", "wb") as f:
    pickle.dump(vectorizer, f)
with open(out / "career_model.pkl", "wb") as f:
    pickle.dump(model, f)
with open(out / "label_encoder.pkl", "wb") as f:
    pickle.dump(le, f)
```

Copy those **three files** into:

```text
AI-Career-Path-Recommendation-System/ml/artifacts/
  vectorizer.pkl
  career_model.pkl
  label_encoder.pkl
```

`predict_api.py` and `career_flask_api` load this set automatically. If Colab used **`joblib.dump`** but kept a **`.pkl`** filename, both servers still load it (they try `pickle` then `joblib`).

### Alternative: **joblib** names

```python
import joblib
from pathlib import Path
out = Path("/content/artifacts")
out.mkdir(parents=True, exist_ok=True)
joblib.dump(vectorizer, out / "tfidf_vectorizer.joblib")
joblib.dump(model, out / "interest_xgb_model.joblib")
joblib.dump(le, out / "target_label_encoder.joblib")
```

Optional `classes.json`: list of class names for the UI.

Use the **same** `vectorizer` that built the `X` you trained on; if you change `TfidfVectorizer` settings, refit on `combined_text` and retrain before exporting.

---

## Step 2 — Install Python dependencies (Windows)

```powershell
cd C:\Project\AI-Career-Path-Recommendation-System\ml
py -m pip install -r requirements-serve.txt
```

Use `python` instead of `py` if that is how you run Python.

---

## Step 3 — Start the prediction API

```powershell
cd C:\Project\AI-Career-Path-Recommendation-System\ml
py -m uvicorn predict_api:app --host 127.0.0.1 --port 5055
```

Leave this terminal open while you develop.

Check: open `http://127.0.0.1:5055/health` — `"ok": true` and `"artifact_format": "pickle_colab"` or `"joblib"` means the model loaded.

### Option B — Flask API (`career_flask_api`, default in `appsettings.json`)

If you use **`ml/career_flask_api`** (POST `/recommend-career` with a single `text` field):

```powershell
cd C:\Project\AI-Career-Path-Recommendation-System\ml\career_flask_api
pip install -r requirements.txt
# Copy vectorizer.pkl, career_model.pkl, label_encoder.pkl into .\models\ (or set CAREER_MODEL_DIR)
python app.py
```

Check: `http://127.0.0.1:5052/` — `"model_loaded": true`.

In **`Back-End/appsettings.json`** use `"PythonPredictBaseUrl": "http://127.0.0.1:5052"` and `"PythonPredictStyle": "Flask"`. For FastAPI instead, set `"PythonPredictStyle": "FastApi"` and port **5055**.

---

## Step 4 — Test a prediction

PowerShell:

```powershell
Invoke-RestMethod -Method Post -Uri "http://127.0.0.1:5055/predict/json" `
  -ContentType "application/json" `
  -Body '{"interests":"technology and cloud","skills":"python sql","certificate_course_title":"aws"}'
```

You should get JSON like:

```json
{
  "predicted_category": "technology",
  "label_index": 5,
  "classes": ["data_science", "finance", "marketing", "other", "teaching", "technology"]
}
```

---

## Step 5 — Integrated in this repo (recommended)

The **ASP.NET** API proxies the Python service so the React app does not call Python directly:

1. In **`Back-End/appsettings.json`**, set:

   **Flask (default in repo):**  
   `"ML": { "PythonPredictBaseUrl": "http://127.0.0.1:5052", "PythonPredictStyle": "Flask" }`

   **FastAPI:**  
   `"ML": { "PythonPredictBaseUrl": "http://127.0.0.1:5055", "PythonPredictStyle": "FastApi" }`

   Use an empty `PythonPredictBaseUrl` to disable ML preview.

2. Start the Python API (Step 3), then start the **Back-End** on port 8000.

3. On **Career survey**, click **“Preview interest category (ML)”** — the SPA calls **`POST /api/ml/predict-interest`** (with your JWT); .NET forwards to Flask **`/recommend-top3`** or **`/recommend-career`**, or FastAPI **`/predict/json`** (depending on `PythonPredictStyle`).

4. **Recommendations page — Generate / Regenerate:** the backend calls the same Python model using the **saved profile** (interests, skills, certificates, UG course & specialization). That signal is sent to **Gemini/OpenAI** to steer suggested careers, and if the LLM is off, **template** careers are **reordered** (e.g. `technology` → Software/DevOps first).

**Production:** deploy `predict_api.py` on a private host, set `PythonPredictBaseUrl` to that URL (HTTPS), and keep the browser talking only to your .NET API.

---

## Step 6 — Call Python directly from React (optional)

You can still `fetch('http://127.0.0.1:5055/predict/json', …)` if you enable CORS in `predict_api.py` for your dev port.

---

## Troubleshooting

| Problem | What to do |
|--------|------------|
| `503` / model missing | Confirm the four files are under `ml/artifacts/` with **exact** names above. |
| Wrong predictions | Vectorizer and model must come from the **same** training run; re-export from Colab after one clean train. |
| `ModuleNotFoundError: xgboost` | `pip install -r requirements-serve.txt` in the same Python you use for uvicorn. |
| CORS errors in browser | Add your front-end origin to `CORSMiddleware` in `predict_api.py`. |

---

## Summary

1. Export **`tfidf_vectorizer.joblib`**, **`interest_xgb_model.joblib`**, **`target_label_encoder.joblib`** from Colab.  
2. Copy them into **`ml/artifacts/`**.  
3. Run **`uvicorn predict_api:app --port 5055`**.  
4. Call **`POST /predict/json`** with `interests`, `skills`, `certificate_course_title`.

That is how you “plug in” the model you trained in Colab to your system.

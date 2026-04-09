# Paste at end of Colab after training — choose ONE export style.

# --- Option A: Pickle (matches untitled5.py / Downloads) — recommended for your notebook ---
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

print("Saved pickle trio to", out)

# Download folder or zip:
# !zip -r /content/ml_artifacts.zip /content/artifacts
# from google.colab import files
# files.download("/content/ml_artifacts.zip")

# --- Option B: Joblib (alternative names expected by older docs) ---
# import joblib
# joblib.dump(vectorizer, out / "tfidf_vectorizer.joblib")
# joblib.dump(model, out / "interest_xgb_model.joblib")
# joblib.dump(le, out / "target_label_encoder.joblib")

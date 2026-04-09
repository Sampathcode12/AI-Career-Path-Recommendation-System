"""
Serve your Colab-trained model (TF-IDF + XGBoost / RandomForest).

Artifacts in ml/artifacts/ — use ONE of:

  A) Pickle (untitled5.py / Colab):
       vectorizer.pkl, career_model.pkl, label_encoder.pkl

  B) Joblib (older docs):
       tfidf_vectorizer.joblib, interest_xgb_model.joblib, target_label_encoder.joblib

Run: uvicorn predict_api:app --host 127.0.0.1 --port 5055
"""

from __future__ import annotations

import json
import pickle
from pathlib import Path

import joblib
import numpy as np
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import AliasChoices, BaseModel, ConfigDict, Field

ARTIFACTS_DIR = Path(__file__).resolve().parent / "artifacts"

app = FastAPI(title="Career interest predictor", version="1.1.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

_vectorizer = None
_model = None
_label_encoder = None
_classes: list[str] | None = None
_artifact_format: str = "none"


def _load_pickle_or_joblib(path: Path):
    """Colab often uses joblib.dump(..., '.pkl') — pickle.load fails; joblib.load works."""
    with open(path, "rb") as f:
        try:
            return pickle.load(f)
        except Exception:
            f.seek(0)
            return joblib.load(f)


def _load_artifacts() -> None:
    global _vectorizer, _model, _label_encoder, _classes, _artifact_format
    _vectorizer = _model = _label_encoder = None
    _classes = None
    _artifact_format = "none"

    cls_path = ARTIFACTS_DIR / "classes.json"

    # A) Pickle bundle (matches Downloads/untitled5.py Colab export)
    vp = ARTIFACTS_DIR / "vectorizer.pkl"
    mp = ARTIFACTS_DIR / "career_model.pkl"
    lep = ARTIFACTS_DIR / "label_encoder.pkl"
    if vp.is_file() and mp.is_file() and lep.is_file():
        try:
            _vectorizer = _load_pickle_or_joblib(vp)
            _model = _load_pickle_or_joblib(mp)
            _label_encoder = _load_pickle_or_joblib(lep)
            _artifact_format = "pickle_colab"
        except Exception:
            _vectorizer = _model = _label_encoder = None
            _artifact_format = "none"

    # B) Joblib bundle (if .pkl trio missing or failed to load)
    if _label_encoder is None:
        v_path = ARTIFACTS_DIR / "tfidf_vectorizer.joblib"
        m_path = ARTIFACTS_DIR / "interest_xgb_model.joblib"
        le_path = ARTIFACTS_DIR / "target_label_encoder.joblib"
        if v_path.is_file() and m_path.is_file() and le_path.is_file():
            _vectorizer = joblib.load(v_path)
            _model = joblib.load(m_path)
            _label_encoder = joblib.load(le_path)
            _artifact_format = "joblib"

    if _label_encoder is None:
        return

    if cls_path.is_file():
        _classes = json.loads(cls_path.read_text(encoding="utf-8"))
    else:
        _classes = list(getattr(_label_encoder, "classes_", []) or [])


_load_artifacts()


class PredictBody(BaseModel):
    """Matches Colab combined_text: interests + skills + cert; optional UG (untitled5 extended columns)."""

    model_config = ConfigDict(populate_by_name=True, extra="ignore")

    interests: str = ""
    skills: str = ""
    certificate_course_title: str = Field(
        default="",
        validation_alias=AliasChoices(
            "certificate_course_title",
            "certificateCourseTitle",
            "certificate_course_titles",
        ),
    )
    ug_course: str = Field(
        default="",
        validation_alias=AliasChoices("ug_course", "ugCourse"),
    )
    ug_specialization: str = Field(
        default="",
        validation_alias=AliasChoices("ug_specialization", "ugSpecialization"),
    )
    top_k: int | None = Field(
        default=None,
        description="If set (e.g. 3) and model supports predict_proba, return top_predictions",
    )


def _combined_text(b: PredictBody) -> str:
    parts = [
        (b.interests or "").strip(),
        (b.skills or "").strip(),
        (b.certificate_course_title or "").strip(),
        (b.ug_course or "").strip(),
        (b.ug_specialization or "").strip(),
    ]
    return " ".join(p for p in parts if p).lower()


@app.on_event("startup")
def startup() -> None:
    _load_artifacts()


@app.get("/health")
def health() -> dict:
    ok = _vectorizer is not None and _model is not None and _label_encoder is not None
    return {
        "ok": ok,
        "artifact_format": _artifact_format,
        "artifacts_dir": str(ARTIFACTS_DIR),
        "expected_pickle": ["vectorizer.pkl", "career_model.pkl", "label_encoder.pkl"],
        "expected_joblib": [
            "tfidf_vectorizer.joblib",
            "interest_xgb_model.joblib",
            "target_label_encoder.joblib",
        ],
        "classes": _classes or (list(_label_encoder.classes_) if _label_encoder else []),
    }


@app.post("/predict/json")
def predict_json(body: PredictBody) -> dict:
    if _vectorizer is None or _model is None or _label_encoder is None:
        raise HTTPException(
            status_code=503,
            detail=(
                "Model files missing. Place EITHER pickle files (vectorizer.pkl, career_model.pkl, label_encoder.pkl) "
                "OR joblib files in ml/artifacts/ — see ml/HOWTO-USE-MODEL.md"
            ),
        )
    text = _combined_text(body)
    if not text.strip():
        raise HTTPException(status_code=400, detail="Provide at least one non-empty text field.")

    X = _vectorizer.transform([text])
    pred = _model.predict(X)
    idx = int(pred[0])
    try:
        label = _label_encoder.inverse_transform(np.asarray(pred).ravel())[0]
    except Exception:
        label = str(idx)

    out: dict = {
        "predicted_category": str(label),
        "label_index": idx,
        "classes": _classes or list(_label_encoder.classes_),
    }

    k = body.top_k
    if k is not None and k > 1 and hasattr(_model, "predict_proba"):
        try:
            probs = _model.predict_proba(X)[0]
            order = np.argsort(probs)[-k:][::-1]
            top = []
            for i in order:
                try:
                    lab = _label_encoder.inverse_transform(np.array([int(i)]).ravel())[0]
                except Exception:
                    lab = str(int(i))
                top.append({"label": str(lab), "probability": float(probs[int(i)])})
            out["top_predictions"] = top
        except Exception:
            pass

    return out

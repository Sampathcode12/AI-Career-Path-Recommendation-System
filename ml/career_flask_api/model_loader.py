"""
Load TF-IDF vectorizer, classifier, and label encoder from disk (Colab export).
Path is set via CAREER_MODEL_DIR (default: ./models next to this package).
"""

from __future__ import annotations

import os
import pickle
from pathlib import Path
from typing import Any

import joblib

# Default: folder named "models" alongside this file (copy your .pkl files here)
_DEFAULT_DIR = Path(__file__).resolve().parent / "models"


def _artifacts_dir() -> Path:
    raw = os.environ.get("CAREER_MODEL_DIR", "").strip()
    return Path(raw) if raw else _DEFAULT_DIR


_vectorizer: Any | None = None
_model: Any | None = None
_label_encoder: Any | None = None
_load_error: str | None = None


def artifacts_directory() -> Path:
    return _artifacts_dir()


def _load_pickle_or_joblib(path: Path) -> Any:
    """Colab often uses joblib.dump(..., '.pkl') — pickle.load then fails; joblib.load works."""
    with open(path, "rb") as f:
        try:
            return pickle.load(f)
        except Exception:
            f.seek(0)
            return joblib.load(f)


def load_artifacts() -> None:
    """Load pickles from CAREER_MODEL_DIR (or default models/). Idempotent."""
    global _vectorizer, _model, _label_encoder, _load_error
    if _vectorizer is not None and _model is not None and _label_encoder is not None:
        return

    _vectorizer = _model = _label_encoder = None
    _load_error = None

    base = _artifacts_dir()
    v_path = base / "vectorizer.pkl"
    m_path = base / "career_model.pkl"
    le_path = base / "label_encoder.pkl"

    if not base.is_dir():
        _load_error = f"Model directory does not exist: {base}"
        return
    missing = [p.name for p in (v_path, m_path, le_path) if not p.is_file()]
    if missing:
        _load_error = f"Missing files in {base}: {', '.join(missing)}"
        return

    try:
        _vectorizer = _load_pickle_or_joblib(v_path)
        _model = _load_pickle_or_joblib(m_path)
        _label_encoder = _load_pickle_or_joblib(le_path)
    except Exception as e:  # noqa: BLE001 — surface load failures to API
        _vectorizer = _model = _label_encoder = None
        _load_error = f"Failed to load model files: {e}"


def get_artifacts():
    """Return (vectorizer, model, label_encoder) or raise RuntimeError."""
    load_artifacts()
    if _load_error:
        raise RuntimeError(_load_error)
    if _vectorizer is None or _model is None or _label_encoder is None:
        raise RuntimeError("Model artifacts are not loaded.")
    return _vectorizer, _model, _label_encoder


def is_ready() -> bool:
    load_artifacts()
    return (
        _load_error is None
        and _vectorizer is not None
        and _model is not None
        and _label_encoder is not None
    )


def last_load_error() -> str | None:
    load_artifacts()
    return _load_error

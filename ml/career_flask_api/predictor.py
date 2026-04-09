"""
Preprocess user text, TF-IDF transform, and predict career label(s).
"""

from __future__ import annotations

from typing import Any

import numpy as np

from model_loader import get_artifacts


def preprocess_text(text: str) -> str:
    """Normalize input: strip and lowercase."""
    return (text or "").strip().lower()


def _decode_from_model_prediction(label_encoder: Any, model: Any, pred_value: Any) -> str:
    """Decode sklearn model.predict output to string career label."""
    v = int(np.asarray(pred_value).ravel()[0])
    try:
        return str(label_encoder.inverse_transform(np.array([v]))[0])
    except Exception:  # noqa: BLE001
        pass
    if hasattr(model, "classes_") and model.classes_ is not None and 0 <= v < len(model.classes_):
        cls_val = model.classes_[v]
        try:
            return str(label_encoder.inverse_transform(np.array([cls_val]))[0])
        except Exception:  # noqa: BLE001
            return str(cls_val)
    return str(v)


def _decode_proba_column(label_encoder: Any, model: Any, column_index: int) -> str:
    """Decode column j of predict_proba (aligns with model.classes_[j])."""
    j = int(column_index)
    if not hasattr(model, "classes_") or model.classes_ is None:
        return str(j)
    cls_val = model.classes_[j]
    try:
        return str(label_encoder.inverse_transform(np.array([cls_val]))[0])
    except Exception:  # noqa: BLE001
        return str(cls_val)


def predict_best_career(text: str) -> str:
    """Return single best career label."""
    vectorizer, model, label_encoder = get_artifacts()
    processed = preprocess_text(text)
    if not processed:
        raise ValueError("EMPTY_TEXT")

    X = vectorizer.transform([processed])
    pred = model.predict(X)
    return _decode_from_model_prediction(label_encoder, model, pred[0])


def predict_top3(text: str) -> list[dict[str, float | str]]:
    """Return top 3 careers with probabilities (requires predict_proba)."""
    vectorizer, model, label_encoder = get_artifacts()
    processed = preprocess_text(text)
    if not processed:
        raise ValueError("EMPTY_TEXT")

    if not hasattr(model, "predict_proba"):
        raise RuntimeError("MODEL_NO_PROBA")

    X = vectorizer.transform([processed])
    probs = model.predict_proba(X)[0]
    k = min(3, len(probs))
    order = np.argsort(probs)[-k:][::-1]

    return [
        {
            "career": _decode_proba_column(label_encoder, model, int(j)),
            "probability": float(probs[int(j)]),
        }
        for j in order
    ]

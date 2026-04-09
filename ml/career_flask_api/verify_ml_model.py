"""
Smoke test: imports, load pickles, run one prediction.
Run from this folder:  python verify_ml_model.py

Optional: set CAREER_MODEL_DIR to the folder with vectorizer.pkl, career_model.pkl, label_encoder.pkl
"""
from __future__ import annotations

import os
import sys


def main() -> int:
    print("Step 1: Python imports (flask, sklearn, numpy)...")
    try:
        import numpy  # noqa: F401
        import sklearn  # noqa: F401
        from flask import Flask  # noqa: F401
    except ImportError as e:
        print(f"  FAIL: {e}")
        print("  Fix: python -m pip install -r requirements.txt")
        return 1
    print("  OK")

    print("Step 2: Load model_loader + predictor...")
    try:
        from model_loader import artifacts_directory, get_artifacts, is_ready, last_load_error, load_artifacts
    except ImportError as e:
        print(f"  FAIL: {e}")
        print("  Run this script from ml/career_flask_api (same folder as model_loader.py).")
        return 1
    print("  OK")

    d = artifacts_directory()
    print(f"Step 3: Artifact directory = {d}")
    load_artifacts()
    if not is_ready():
        print(f"  FAIL: {last_load_error()}")
        print("  Copy from Colab export into this folder (or set CAREER_MODEL_DIR):")
        print("    - vectorizer.pkl")
        print("    - career_model.pkl")
        print("    - label_encoder.pkl")
        return 2
    print("  OK (all three .pkl files loaded)")

    print("Step 4: Single prediction (best career)...")
    try:
        from predictor import predict_best_career, predict_top3

        text = "python sql machine learning data analysis"
        best = predict_best_career(text)
        print(f"  best_career = {best!r}")
        try:
            top = predict_top3(text)
            print(f"  top3 = {top}")
        except RuntimeError as e:
            if "MODEL_NO_PROBA" in str(e):
                print("  (top3 skipped: model has no predict_proba — OK for best-career only)")
            else:
                raise
    except Exception as e:  # noqa: BLE001
        print(f"  FAIL: {e}")
        return 3
    print("  OK")

    print("\nAll checks passed. Start the API with: python app.py")
    return 0


if __name__ == "__main__":
    sys.exit(main())

"""
Flask API: career recommendation from Colab-exported TF-IDF + classifier + label_encoder.
"""

from __future__ import annotations

import logging
import os
import traceback

from flask import Flask, jsonify, request
from flask_cors import CORS

from model_loader import is_ready, last_load_error, load_artifacts
from predictor import predict_best_career, predict_top3

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
# Broad origins for local dev; tighten in production (specific origins or env list)
_default_origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:5174",
    "http://127.0.0.1:5174",
    "http://localhost:5175",
    "http://127.0.0.1:5175",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:5000",
    "http://127.0.0.1:5000",
    "http://localhost:5052",
    "http://127.0.0.1:5052",
    "http://localhost:8000",
    "http://127.0.0.1:8000",
    "https://localhost:5173",
    "https://localhost:7043",
    "https://127.0.0.1:7043",
    "https://localhost:7071",
    "https://127.0.0.1:7071",
]
_extra = os.environ.get("CORS_ORIGINS", "").strip()
if _extra:
    _default_origins.extend([o.strip() for o in _extra.split(",") if o.strip()])

# Set CORS_ALLOW_ALL=1 for any origin (dev only; do not use with credentialed cookies in prod)
if os.environ.get("CORS_ALLOW_ALL", "").lower() in ("1", "true", "yes"):
    CORS(
        app,
        resources={r"/*": {"origins": "*"}},
        allow_headers=["Content-Type", "Authorization"],
        methods=["GET", "POST", "OPTIONS"],
    )
else:
    CORS(
        app,
        resources={r"/*": {"origins": _default_origins}},
        supports_credentials=True,
        allow_headers=["Content-Type", "Authorization"],
        methods=["GET", "POST", "OPTIONS"],
    )


@app.route("/", methods=["GET"])
def root():
    load_artifacts()
    return jsonify(
        {
            "status": "ok",
            "service": "career-recommendation-api",
            "model_loaded": is_ready(),
            "model_error": last_load_error(),
        }
    )


@app.route("/recommend-career", methods=["POST"])
def recommend_career():
    if not is_ready():
        return (
            jsonify(
                {
                    "error": last_load_error() or "Model not loaded.",
                    "code": "MODEL_NOT_LOADED",
                }
            ),
            503,
        )

    if not request.is_json:
        return jsonify({"error": "Expected Content-Type: application/json", "code": "INVALID_CONTENT_TYPE"}), 415

    try:
        body = request.get_json(force=False, silent=False)
    except Exception:  # noqa: BLE001
        return jsonify({"error": "Invalid JSON body.", "code": "INVALID_JSON"}), 400

    if body is None:
        return jsonify({"error": "Missing JSON body.", "code": "MISSING_BODY"}), 400

    if "text" not in body:
        return jsonify({"error": 'Missing required field "text".', "code": "MISSING_FIELD"}), 400

    text = body.get("text")
    if text is None:
        return jsonify({"error": 'Field "text" must not be null.', "code": "INVALID_FIELD"}), 400
    if not isinstance(text, str):
        return jsonify({"error": 'Field "text" must be a string.', "code": "INVALID_FIELD"}), 400

    if not text.strip():
        return jsonify({"error": 'Field "text" must not be empty.', "code": "EMPTY_TEXT"}), 400

    try:
        best = predict_best_career(text)
        return jsonify({"best_career": best})
    except ValueError as e:
        if str(e) == "EMPTY_TEXT":
            return jsonify({"error": 'Field "text" must not be empty.', "code": "EMPTY_TEXT"}), 400
        raise
    except RuntimeError as e:
        logger.exception("Prediction failed: %s", e)
        return jsonify({"error": str(e), "code": "PREDICTION_ERROR"}), 503
    except Exception:  # noqa: BLE001
        logger.exception("Unexpected error in recommend-career")
        return (
            jsonify(
                {
                    "error": "Internal server error during prediction.",
                    "code": "SERVER_ERROR",
                }
            ),
            500,
        )


@app.route("/recommend-top3", methods=["POST"])
def recommend_top3():
    if not is_ready():
        return (
            jsonify(
                {
                    "error": last_load_error() or "Model not loaded.",
                    "code": "MODEL_NOT_LOADED",
                }
            ),
            503,
        )

    if not request.is_json:
        return jsonify({"error": "Expected Content-Type: application/json", "code": "INVALID_CONTENT_TYPE"}), 415

    try:
        body = request.get_json(force=False, silent=False)
    except Exception:  # noqa: BLE001
        return jsonify({"error": "Invalid JSON body.", "code": "INVALID_JSON"}), 400

    if body is None:
        return jsonify({"error": "Missing JSON body.", "code": "MISSING_BODY"}), 400

    if "text" not in body:
        return jsonify({"error": 'Missing required field "text".', "code": "MISSING_FIELD"}), 400

    text = body.get("text")
    if text is None:
        return jsonify({"error": 'Field "text" must not be null.', "code": "INVALID_FIELD"}), 400
    if not isinstance(text, str):
        return jsonify({"error": 'Field "text" must be a string.', "code": "INVALID_FIELD"}), 400

    if not text.strip():
        return jsonify({"error": 'Field "text" must not be empty.', "code": "EMPTY_TEXT"}), 400

    try:
        recs = predict_top3(text)
        return jsonify({"recommendations": recs})
    except RuntimeError as e:
        if str(e) == "MODEL_NO_PROBA":
            return (
                jsonify(
                    {
                        "error": "This model does not support probability scores (predict_proba). "
                        "Train with a classifier that exposes predict_proba (e.g. RandomForest, XGBoost, "
                        "LogisticRegression) or use SVC(probability=True).",
                        "code": "MODEL_NO_PROBA",
                    }
                ),
                501,
            )
        logger.exception("Top-3 prediction failed: %s", e)
        return jsonify({"error": str(e), "code": "PREDICTION_ERROR"}), 503
    except ValueError as e:
        if str(e) == "EMPTY_TEXT":
            return jsonify({"error": 'Field "text" must not be empty.', "code": "EMPTY_TEXT"}), 400
        raise
    except Exception:  # noqa: BLE001
        logger.exception("Unexpected error in recommend-top3")
        return (
            jsonify(
                {
                    "error": "Internal server error during prediction.",
                    "code": "SERVER_ERROR",
                }
            ),
            500,
        )


@app.errorhandler(404)
def not_found(_e):
    return jsonify({"error": "Not found.", "code": "NOT_FOUND"}), 404


@app.errorhandler(500)
def server_error(_e):
    return jsonify({"error": "Internal server error.", "code": "SERVER_ERROR"}), 500


if __name__ == "__main__":
    load_artifacts()
    # Default 5052: port 5000 is often taken on Windows (IIS / other services).
    port = int(os.environ.get("PORT", "5052"))
    host = os.environ.get("HOST", "127.0.0.1")
    debug = os.environ.get("FLASK_DEBUG", "").lower() in ("1", "true", "yes")
    base = f"http://{host}:{port}"
    print(f"\n>>> Career Flask API listening at {base}/", flush=True)
    print(f">>> Test: open {base}/ in a browser (expect JSON with model_loaded).", flush=True)
    print(">>> Keep this terminal open while the .NET API runs.\n", flush=True)
    app.run(host=host, port=port, debug=debug)

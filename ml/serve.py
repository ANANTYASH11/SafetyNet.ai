"""
ml/serve.py
────────────────────────────────────────────────────────────────────────────────
SafetyNet.ai — XGBoost ML Inference Service  (Flask on port 5002)

Loads trained XGBoost models and serves predictions to the Node.js backend.

Endpoints:
  POST /predict       — predict riskScore + riskLevel + confidence
  GET  /health        — service health + model metadata
  GET  /feature-importance  — model feature importances

Run:
  cd "d:\Int 428 Project\ml"
  pip install flask flask-cors xgboost scikit-learn pandas numpy joblib
  python serve.py
────────────────────────────────────────────────────────────────────────────────
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import numpy as np
import joblib
import json
import os
import time

app = Flask(__name__)
CORS(app)

# ── Load models at startup ──────────────────────────────────────────────────

MODEL_DIR = os.path.join(os.path.dirname(__file__), "model")

def load_models():
    reg  = joblib.load(os.path.join(MODEL_DIR, "risk_score_regressor.pkl"))
    clf  = joblib.load(os.path.join(MODEL_DIR, "risk_level_classifier.pkl"))
    le   = joblib.load(os.path.join(MODEL_DIR, "label_encoder_level.pkl"))
    with open(os.path.join(MODEL_DIR, "metadata.json")) as f:
        meta = json.load(f)
    return reg, clf, le, meta

try:
    regressor, classifier, label_enc, metadata = load_models()
    MODELS_LOADED = True
    print(f"[ML Service] Models loaded — R²={metadata['model_info']['test_r2']}  Acc={metadata['model_info']['test_accuracy']}")
except Exception as e:
    MODELS_LOADED = False
    print(f"[ML Service] WARNING: Could not load models — {e}")
    print("[ML Service] Run train_model.py first to generate models.")

# ── Feature encoding helpers (mirrors train_model.py) ──────────────────────

JOB_SCORE  = {"govt": 5, "corporate": 22, "freelancer": 48, "business": 38, "gig": 42}
JOB_MONTHS = {"govt": 0.0, "corporate": 1.5, "freelancer": 4.5, "business": 3.5, "gig": 3.5}

JOB_CLASSES  = ["business", "corporate", "freelancer", "gig", "govt"]
LIFE_CLASSES = ["married_with_kids", "mid_career", "pre_retirement", "single", "single_parent"]
CITY_CLASSES = ["1", "2", "3"]
LEVEL_CLASSES = ["Critical", "High", "Low", "Medium"]

def encode_categorical(value, classes, fallback_idx=0):
    try:
        return classes.index(str(value))
    except ValueError:
        return fallback_idx

def build_feature_vector(data):
    """Convert raw API input to the 16-feature vector the model expects."""
    income   = max(0, float(data.get("monthlyIncome",   data.get("income",   0))))
    expenses = max(0, float(data.get("monthlyExpenses", data.get("expenses", 0))))
    emi      = max(0, float(data.get("emi", 0)))
    savings  = max(0, float(data.get("savings", 0)))
    deps     = max(0, min(10, int(data.get("dependents", 0))))
    age      = max(18, min(90, int(data.get("age", 30))))
    insured  = 1 if str(data.get("hasHealthInsurance", "no")).lower() in ("yes", "true", "1", "partial") else 0
    renting  = 1 if str(data.get("rentOrOwn", "rent")).lower() == "rent" else 0

    job      = str(data.get("jobType", "corporate")).lower()
    life     = str(data.get("lifeStage", "mid_career")).lower()
    city     = str(data.get("cityTier", "2"))

    income_safe  = income if income > 0 else 1
    expenses_safe = expenses if expenses > 0 else 1

    emi_ratio      = emi / income_safe
    expense_ratio  = expenses / income_safe
    surplus        = max(0, income - expenses - emi)
    savings_ratio  = savings / (income_safe * 12)
    survival_months = savings / expenses_safe

    job_enc  = encode_categorical(job,  JOB_CLASSES,  JOB_CLASSES.index("corporate"))
    life_enc = encode_categorical(life, LIFE_CLASSES, LIFE_CLASSES.index("mid_career"))
    city_enc = encode_categorical(city, CITY_CLASSES, CITY_CLASSES.index("2"))

    return [
        income, expenses, emi, savings, deps, age,
        insured, renting,
        job_enc, life_enc, city_enc,
        emi_ratio, expense_ratio, surplus, savings_ratio, survival_months,
    ]

# ── Routes ──────────────────────────────────────────────────────────────────

@app.route("/health", methods=["GET"])
def health():
    return jsonify({
        "status":       "ok" if MODELS_LOADED else "degraded",
        "models_loaded": MODELS_LOADED,
        "model_info":   metadata.get("model_info", {}) if MODELS_LOADED else {},
        "service":      "SafetyNet.ai ML Service v1.0",
    })

@app.route("/predict", methods=["POST"])
def predict():
    if not MODELS_LOADED:
        return jsonify({"error": "Models not loaded. Run train_model.py first."}), 503

    data = request.get_json(silent=True)
    if not data:
        return jsonify({"error": "Invalid JSON body"}), 400

    t0 = time.time()
    try:
        fv = build_feature_vector(data)
        X  = np.array([fv])

        # Regression: predicted risk score (continuous 0–100)
        pred_score = float(regressor.predict(X)[0])
        pred_score = round(max(0, min(100, pred_score)), 1)

        # Classification: predicted risk level + class probabilities
        pred_class_idx = int(classifier.predict(X)[0])
        pred_proba     = classifier.predict_proba(X)[0].tolist()
        pred_level     = LEVEL_CLASSES[pred_class_idx]
        confidence     = round(float(max(pred_proba)) * 100, 1)

        # Per-class probabilities keyed by level name
        proba_named = {LEVEL_CLASSES[i]: round(p * 100, 1) for i, p in enumerate(pred_proba)}

        ms = round((time.time() - t0) * 1000, 1)

        return jsonify({
            "success":    True,
            "mlRiskScore": pred_score,
            "mlRiskLevel": pred_level,
            "confidence":  confidence,
            "probabilities": proba_named,
            "features_used": len(fv),
            "ms":          ms,
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/feature-importance", methods=["GET"])
def feature_importance():
    if not MODELS_LOADED:
        return jsonify({"error": "Models not loaded"}), 503

    features = metadata.get("features", [])
    importances = regressor.feature_importances_.tolist()
    data = sorted(
        [{"feature": f, "importance": round(float(imp), 4)} for f, imp in zip(features, importances)],
        key=lambda x: x["importance"], reverse=True
    )
    return jsonify({"feature_importances": data})

if __name__ == "__main__":
    print("[ML Service] Starting on http://localhost:5002")
    app.run(host="0.0.0.0", port=5002, debug=False)

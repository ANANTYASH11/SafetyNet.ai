"""
ml/train_model.py
────────────────────────────────────────────────────────────────────────────────
SafetyNet.ai — XGBoost Risk Score Predictor

Pipeline:
  1. Generate 8,000 synthetic Indian household profiles
  2. Label each using the EXACT same logic as calculationService.js
  3. Train XGBoost to predict riskScore (regression) and riskLevel (classification)
  4. Evaluate model performance on a held-out test set
  5. Save model + feature metadata to ml/model/

Run:
  cd "d:\Int 428 Project\ml"
  pip install xgboost scikit-learn pandas numpy joblib
  python train_model.py
────────────────────────────────────────────────────────────────────────────────
"""

import numpy as np
import pandas as pd
import joblib
import os
import json
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_absolute_error, r2_score, accuracy_score, classification_report
from sklearn.preprocessing import LabelEncoder
import xgboost as xgb

np.random.seed(42)
os.makedirs("model", exist_ok=True)

# ── Feature encoding maps (mirrors calculationService.js) ──────────────────

JOB_SCORE  = {"govt": 5, "corporate": 22, "freelancer": 48, "business": 38, "gig": 42}
JOB_MONTHS = {"govt": 0.0, "corporate": 1.5, "freelancer": 4.5, "business": 3.5, "gig": 3.5}

LIFE_STAGE_RISKY = {"married_with_kids", "single_parent", "family"}

RISK_LEVELS = [(25, "Low"), (50, "Medium"), (72, "High"), (100, "Critical")]

def risk_level_from_score(score):
    for threshold, level in RISK_LEVELS:
        if score <= threshold:
            return level
    return "Critical"

# ── Labelling function — exact mirror of calculationService.js ──────────────

def label_profile(row):
    income   = max(0, row["income"])
    expenses = max(0, row["expenses"])
    emi      = max(0, row["emi"])
    savings  = max(0, row["savings"])
    deps     = max(0, min(10, row["dependents"]))
    age      = max(18, min(90, row["age"]))
    city     = str(row["city_tier"])
    job      = row["job_type"]
    life     = row["life_stage"]
    insured  = row["has_insurance"]   # 1 or 0
    renting  = row["renting"]         # 1 or 0

    total_obligations = expenses + emi
    emi_ratio         = emi / income if income > 0 else 0
    expense_ratio     = expenses / income if income > 0 else 0
    surplus           = max(0, income - total_obligations)

    risk_score         = 0
    months_recommended = 3.0

    # 3a. Employment type
    risk_score         += JOB_SCORE.get(job, 22)
    months_recommended += JOB_MONTHS.get(job, 1.5)

    # 3b. Dependents
    if deps > 0:
        months_recommended += deps * 0.8
        risk_score         += deps * 7

    # 3c. EMI/debt load
    if emi_ratio > 0.5:
        months_recommended += 2.5; risk_score += 32
    elif emi_ratio > 0.3:
        months_recommended += 1.5; risk_score += 16
    elif emi_ratio > 0:
        months_recommended += 0.5; risk_score += 6

    # 3d. City tier
    city_multiplier = {"1": 1.18, "2": 1.0, "3": 0.82}.get(city, 1.0)
    if city == "1":
        months_recommended += 1; risk_score += 8
    elif city == "3":
        months_recommended -= 0.5

    # 3e. Age
    if age > 50:
        months_recommended += 1; risk_score += 10
    elif age < 27:
        risk_score -= 5

    # 3f. Health insurance
    if not insured:
        months_recommended += 1; risk_score += 18

    # 3g. Rent vs own
    if renting:
        risk_score += 5

    # 3h. Expense ratio
    if expense_ratio > 0.85:
        risk_score += 20
    # (no subtract for low expense_ratio in scoring)

    # 3i. Life stage
    if life in LIFE_STAGE_RISKY:
        months_recommended += 1; risk_score += 8

    # Clamp months
    months_recommended = min(15.0, max(3.0, months_recommended))
    risk_score         = min(100, max(0, round(risk_score)))

    # Funding-state adjustment
    target_fund   = total_obligations * months_recommended * city_multiplier
    months_covered = savings / total_obligations if total_obligations > 0 else 99

    if savings >= target_fund:
        adjusted = max(10, risk_score - 28)
    elif months_covered < 1:
        adjusted = min(100, risk_score + 22)
    else:
        adjusted = risk_score

    adjusted = min(100, max(0, adjusted))
    return adjusted, risk_level_from_score(adjusted), round(target_fund), months_recommended

# ── Synthetic data generation ───────────────────────────────────────────────

N = 8000

def rand_income():
    # Realistic Indian monthly income distribution (₹15k–₹5L)
    tier = np.random.choice(["low", "mid", "high"], p=[0.3, 0.5, 0.2])
    if tier == "low":  return np.random.randint(15000, 45000)
    if tier == "mid":  return np.random.randint(45000, 150000)
    return np.random.randint(150000, 500000)

records = []
for _ in range(N):
    income   = rand_income()
    exp_frac = np.random.uniform(0.35, 0.95)
    expenses = int(income * exp_frac)
    emi_frac = np.random.choice([0, np.random.uniform(0.05, 0.55)], p=[0.25, 0.75])
    emi      = int(income * emi_frac)
    savings  = int(np.random.choice([0, np.random.uniform(0.5, 36)], p=[0.15, 0.85]) * expenses)
    records.append({
        "income":      income,
        "expenses":    expenses,
        "emi":         emi,
        "savings":     savings,
        "dependents":  np.random.randint(0, 5),
        "age":         np.random.randint(21, 62),
        "city_tier":   np.random.choice(["1", "2", "3"], p=[0.35, 0.45, 0.20]),
        "job_type":    np.random.choice(list(JOB_SCORE.keys()), p=[0.15, 0.40, 0.20, 0.15, 0.10]),
        "life_stage":  np.random.choice(
            ["single", "mid_career", "married_with_kids", "single_parent", "pre_retirement"],
            p=[0.20, 0.30, 0.30, 0.10, 0.10]),
        "has_insurance": np.random.choice([0, 1], p=[0.55, 0.45]),
        "renting":       np.random.choice([0, 1], p=[0.35, 0.65]),
    })

df = pd.DataFrame(records)

# Apply labelling
labels = df.apply(label_profile, axis=1, result_type="expand")
labels.columns = ["risk_score", "risk_level", "recommended_fund", "months_recommended"]
df = pd.concat([df, labels], axis=1)

print(f"Generated {N} samples")
print(df["risk_level"].value_counts())
print(df["risk_score"].describe())

# ── Feature engineering ─────────────────────────────────────────────────────

# Encode categoricals
le_job   = LabelEncoder().fit(list(JOB_SCORE.keys()))
le_life  = LabelEncoder().fit(["single", "mid_career", "married_with_kids", "single_parent", "pre_retirement"])
le_city  = LabelEncoder().fit(["1", "2", "3"])
le_level = LabelEncoder().fit(["Low", "Medium", "High", "Critical"])

df["job_enc"]   = le_job.fit_transform(df["job_type"])
df["life_enc"]  = le_life.fit_transform(df["life_stage"])
df["city_enc"]  = le_city.fit_transform(df["city_tier"])
df["level_enc"] = le_level.fit_transform(df["risk_level"])

# Derived features (same as JS engine)
df["emi_ratio"]     = df["emi"] / df["income"].replace(0, 1)
df["expense_ratio"] = df["expenses"] / df["income"].replace(0, 1)
df["surplus"]       = (df["income"] - df["expenses"] - df["emi"]).clip(lower=0)
df["savings_ratio"] = df["savings"] / (df["income"].replace(0, 1) * 12)  # months of income saved
df["survival_months"] = df["savings"] / df["expenses"].replace(0, 1)

FEATURES = [
    "income", "expenses", "emi", "savings", "dependents", "age",
    "has_insurance", "renting",
    "job_enc", "life_enc", "city_enc",
    "emi_ratio", "expense_ratio", "surplus", "savings_ratio", "survival_months",
]

X = df[FEATURES]
y_score = df["risk_score"]
y_level = df["level_enc"]

X_train, X_test, ys_train, ys_test, yl_train, yl_test = train_test_split(
    X, y_score, y_level, test_size=0.2, random_state=42
)

# ── Train XGBoost regressor (risk score 0–100) ──────────────────────────────

print("\n── Training XGBoost Regressor (riskScore) ──")
reg = xgb.XGBRegressor(
    n_estimators=400,
    max_depth=7,
    learning_rate=0.05,
    subsample=0.85,
    colsample_bytree=0.85,
    min_child_weight=3,
    reg_alpha=0.1,
    reg_lambda=1.5,
    random_state=42,
    n_jobs=-1,
    verbosity=0,
)
reg.fit(X_train, ys_train, eval_set=[(X_test, ys_test)], verbose=False)

y_pred_score = reg.predict(X_test).clip(0, 100)
mae  = mean_absolute_error(ys_test, y_pred_score)
r2   = r2_score(ys_test, y_pred_score)
print(f"  MAE  : {mae:.2f} risk points")
print(f"  R²   : {r2:.4f}")

# ── Train XGBoost classifier (risk level) ───────────────────────────────────

print("\n── Training XGBoost Classifier (riskLevel) ──")
clf = xgb.XGBClassifier(
    n_estimators=400,
    max_depth=7,
    learning_rate=0.05,
    subsample=0.85,
    colsample_bytree=0.85,
    min_child_weight=3,
    use_label_encoder=False,
    eval_metric="mlogloss",
    random_state=42,
    n_jobs=-1,
    verbosity=0,
)
clf.fit(X_train, yl_train, eval_set=[(X_test, yl_test)], verbose=False)

y_pred_level = clf.predict(X_test)
acc = accuracy_score(yl_test, y_pred_level)
print(f"  Accuracy: {acc*100:.1f}%")
print(classification_report(yl_test, y_pred_level,
      target_names=le_level.classes_, zero_division=0))

# ── Feature importance ───────────────────────────────────────────────────────

print("\n── Feature Importance (Regressor) ──")
fi = pd.Series(reg.feature_importances_, index=FEATURES).sort_values(ascending=False)
for feat, imp in fi.items():
    bar = "█" * int(imp * 50)
    print(f"  {feat:<22} {bar} {imp:.4f}")

# ── Save everything ──────────────────────────────────────────────────────────

joblib.dump(reg, "model/risk_score_regressor.pkl")
joblib.dump(clf, "model/risk_level_classifier.pkl")
joblib.dump(le_level, "model/label_encoder_level.pkl")

# Save feature list + label classes for use by the Flask service
metadata = {
    "features": FEATURES,
    "job_classes":   list(le_job.classes_),
    "life_classes":  list(le_life.classes_),
    "city_classes":  list(le_city.classes_),
    "level_classes": list(le_level.classes_),
    "job_score_map":   JOB_SCORE,
    "job_months_map":  JOB_MONTHS,
    "model_info": {
        "regressor":  "XGBoostRegressor  n_estimators=400  max_depth=7",
        "classifier": "XGBoostClassifier n_estimators=400  max_depth=7",
        "train_samples": int(len(X_train)),
        "test_samples":  int(len(X_test)),
        "test_mae":      round(float(mae), 2),
        "test_r2":       round(float(r2), 4),
        "test_accuracy": round(float(acc), 4),
    }
}
with open("model/metadata.json", "w") as f:
    json.dump(metadata, f, indent=2)

print("\n✓ Models saved to ml/model/")
print(f"  risk_score_regressor.pkl   — MAE {mae:.1f} pts, R² {r2:.3f}")
print(f"  risk_level_classifier.pkl  — Accuracy {acc*100:.1f}%")
print(f"  metadata.json")
print("\n Next: python serve.py  (starts Flask service on port 5002)")

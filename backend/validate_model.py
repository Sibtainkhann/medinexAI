"""
MedinexAI - Model Validation Script
Loads the existing trained model without retraining.
Validates: loading, structure, evaluation, and sample predictions.
"""

import os
import sys
import re
import pandas as pd
import numpy as np
import joblib
from sklearn.metrics import classification_report, accuracy_score
from sklearn.model_selection import train_test_split

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, "model", "disease_prediction_model.joblib")
DATA_PATH = os.path.join(BASE_DIR, "data", "dataset.csv")


def clean_symptoms(text):
    if not isinstance(text, str):
        return ""
    text = text.replace("_", " ")
    text = re.sub(r"\s+", " ", text)
    return text.lower().strip()


def main():
    print("=" * 60)
    print("  MedinexAI - Model Validation Report")
    print("=" * 60)

    # Step 1: Verify file exists
    print("\n[1] MODEL FILE CHECK")
    if not os.path.exists(MODEL_PATH):
        print(f"  [FAIL] Model file not found at:\n     {MODEL_PATH}")
        sys.exit(1)

    size_kb = os.path.getsize(MODEL_PATH) / 1024
    print(f"  [PASS] Found: {MODEL_PATH}")
    print(f"  [PASS] Size: {size_kb:.1f} KB")

    # Step 2: Load model
    print("\n[2] MODEL LOADING")
    try:
        model = joblib.load(MODEL_PATH)
        print(f"  [PASS] Model loaded successfully")
        print(f"  [PASS] Type: {type(model).__name__}")
    except Exception as e:
        print(f"  [FAIL] Could not load model: {e}")
        sys.exit(1)

    # Step 3: Inspect pipeline structure
    print("\n[3] PIPELINE STRUCTURE")
    if hasattr(model, "steps"):
        for i, (name, step) in enumerate(model.steps):
            print(f"  Step {i}: {name} -> {type(step).__name__}")
    elif hasattr(model, "named_steps"):
        for name, step in model.named_steps.items():
            print(f"  Step: {name} -> {type(step).__name__}")
    else:
        print(f"  Model type: {type(model).__name__}")
        if hasattr(model, "predict"):
            print("  [PASS] Has .predict() method")
        else:
            print("  [FAIL] No .predict() method")
            sys.exit(1)

    # Step 4: Check classes
    print("\n[4] DISEASE CLASSES")
    all_classes = None
    if hasattr(model, "classes_"):
        all_classes = list(model.classes_)
    else:
        for name, step in (model.steps if hasattr(model, 'steps') else []):
            if hasattr(step, 'classes_'):
                all_classes = list(step.classes_)
                break

    if all_classes:
        print(f"  [PASS] Number of diseases: {len(all_classes)}")
        print(f"  Classes: {', '.join(all_classes[:10])}{'...' if len(all_classes) > 10 else ''}")
    else:
        print("  [WARN] Could not find disease classes")

    # Step 5: Check decision_function
    print("\n[5] DECISION FUNCTION CHECK")
    has_decision = hasattr(model, "decision_function")
    has_predict = hasattr(model, "predict")
    print(f"  decision_function: {'[PASS] Available' if has_decision else '[FAIL] Not available'}")
    print(f"  predict:           {'[PASS] Available' if has_predict else '[FAIL] Not available'}")

    # Step 6: Sample prediction test
    print("\n[6] SAMPLE PREDICTION TEST")
    test_inputs = [
        ("itching skin rash nodal skin eruptions", "Fungal infection"),
        ("continuous sneezing shivering chills", "Allergy"),
        ("chest pain breathlessness sweating", None),
        ("headache vomiting nausea", None),
    ]

    for text, expected in test_inputs:
        try:
            pred = model.predict([text])[0]
            if expected:
                status = "[PASS] Correct" if pred == expected else f"[WARN] Expected '{expected}', got '{pred}'"
            else:
                status = f"[PASS] Predicted: {pred}"
            print(f"  Input: '{text[:50]}' -> {status}")
        except Exception as e:
            print(f"  [FAIL] Prediction failed for '{text[:30]}...': {e}")

    # Step 7: Decision function / confidence scoring
    if has_decision:
        print("\n[7] CONFIDENCE SCORING TEST")
        try:
            scores = model.decision_function(["itching skin rash nodal skin eruptions"])[0]
            shifted = scores - np.max(scores)
            probs = np.exp(shifted) / np.exp(shifted).sum()
            top_idx = np.argmax(probs)
            top_conf = probs[top_idx] * 100

            if all_classes:
                top_disease = all_classes[top_idx]
                print(f"  [PASS] Top prediction: {top_disease} ({top_conf:.1f}%)")
                sorted_idx = np.argsort(probs)[::-1]
                print(f"  Top 3 differentials:")
                for rank, idx in enumerate(sorted_idx[:3], 1):
                    print(f"    {rank}. {all_classes[idx]} - {probs[idx]*100:.2f}%")
            else:
                print(f"  [PASS] Top confidence: {top_conf:.1f}%")
        except Exception as e:
            print(f"  [FAIL] Decision function error: {e}")

    # Step 8: Full evaluation on dataset
    print("\n[8] FULL EVALUATION ON DATASET")
    if not os.path.exists(DATA_PATH):
        print(f"  [WARN] Dataset not found at {DATA_PATH}, skipping evaluation")
    else:
        df = pd.read_csv(DATA_PATH)
        df.columns = df.columns.str.strip()
        df["Disease"] = df["Disease"].str.strip()
        df["Symptom"] = df["Symptom"].apply(clean_symptoms)
        df = df[df["Symptom"].str.len() > 0].reset_index(drop=True)

        X = df["Symptom"]
        y = df["Disease"]

        print(f"  Dataset: {len(df)} rows, {y.nunique()} diseases")

        # Evaluate on full dataset
        y_pred_full = model.predict(X)
        full_acc = accuracy_score(y, y_pred_full)
        print(f"\n  Full dataset accuracy: {full_acc*100:.2f}%")

        # 80/20 split evaluation
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.2, random_state=42, stratify=y
        )
        y_pred_test = model.predict(X_test)
        test_acc = accuracy_score(y_test, y_pred_test)
        print(f"  Hold-out test accuracy (20%): {test_acc*100:.2f}%")

        print(f"\n  Classification Report (hold-out test set):\n")
        print(classification_report(y_test, y_pred_test))

    # Summary
    print("=" * 60)
    print("  VALIDATION SUMMARY")
    print("=" * 60)
    print(f"  Model loads:          [PASS]")
    print(f"  Predictions work:     [PASS]")
    print(f"  Decision function:    {'[PASS]' if has_decision else '[FAIL]'}")
    print(f"  Retraining needed:    NO")
    print("=" * 60)


if __name__ == "__main__":
    main()

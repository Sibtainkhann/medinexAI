"""
MedinexAI — Disease Prediction Service

Loads the trained model and supplementary CSV datasets, then provides
prediction with confidence scores, severity assessment, descriptions,
precautions, and emergency flagging.
"""

import os
from typing import Any

import numpy as np
import pandas as pd
import joblib


# Diseases that should trigger an emergency warning
EMERGENCY_DISEASES = {
    "Heart attack",
    "Dengue",
    "Malaria",
    "Pneumonia",
    "Bronchial Asthma",
}


class PredictionService:
    """Disease prediction engine using the trained TfidfVectorizer + LinearSVC pipeline."""

    def __init__(self, base_dir: str | None = None):
        """
        Initialize the service by loading model and all reference datasets.

        Args:
            base_dir: Path to the backend/ root directory.
        """
        if base_dir is None:
            base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

        model_path = os.path.join(base_dir, "model", "disease_prediction_model.joblib")
        data_dir = os.path.join(base_dir, "data")

        # Load trained pipeline
        self.model = joblib.load(model_path)
        self.classes = list(self.model.classes_)

        # Load supplementary datasets
        self._load_descriptions(data_dir)
        self._load_precautions(data_dir)
        self._load_severity(data_dir)

    # ─────────────────────────────────────────────────────────────────────
    def _load_descriptions(self, data_dir: str) -> None:
        """Load disease descriptions from symptom_Description.csv."""
        df = pd.read_csv(os.path.join(data_dir, "symptom_Description.csv"))
        df.columns = df.columns.str.strip()
        df["Disease"] = df["Disease"].str.strip()
        self.descriptions: dict[str, str] = {}
        for _, row in df.iterrows():
            self.descriptions[row["Disease"]] = str(row["Description"]).strip()

    def _load_precautions(self, data_dir: str) -> None:
        """Load precautions from symptom_precaution.csv."""
        df = pd.read_csv(os.path.join(data_dir, "symptom_precaution.csv"))
        df.columns = df.columns.str.strip()
        df["Disease"] = df["Disease"].str.strip()
        self.precautions: dict[str, list[str]] = {}
        for _, row in df.iterrows():
            precs = []
            for col in ["Precaution_1", "Precaution_2", "Precaution_3", "Precaution_4"]:
                val = row.get(col, "")
                if pd.notna(val) and str(val).strip():
                    precs.append(str(val).strip())
            self.precautions[row["Disease"]] = precs

    def _load_severity(self, data_dir: str) -> None:
        """Load symptom severity weights from Symptom-severity.csv."""
        df = pd.read_csv(os.path.join(data_dir, "Symptom-severity.csv"))
        df.columns = df.columns.str.strip()
        df["Symptom"] = df["Symptom"].str.strip()
        self.severity_weights: dict[str, int] = {}
        for _, row in df.iterrows():
            self.severity_weights[row["Symptom"]] = int(row["weight"])

    # ─────────────────────────────────────────────────────────────────────
    @staticmethod
    def _softmax(scores: np.ndarray) -> np.ndarray:
        """Numerically stable softmax with temperature scaling for SVM calibration."""
        # Scale by 12.0 to expand the decision boundaries and produce realistic probabilities
        shifted = (scores - np.max(scores)) * 12.0
        exp_scores = np.exp(shifted)
        return exp_scores / exp_scores.sum()

    # ─────────────────────────────────────────────────────────────────────
    def _calculate_severity(self, symptoms: list[str]) -> dict[str, Any]:
        """
        Calculate overall severity from matched symptom weights.

        Returns:
            Dict with 'level', 'score', and 'maxPossible'.
        """
        if not symptoms:
            return {"level": "Low", "score": 0, "maxPossible": 7}

        weights = [
            self.severity_weights.get(s, 3)
            for s in symptoms
        ]
        avg_weight = sum(weights) / len(weights)

        if avg_weight <= 3:
            level = "Low"
        elif avg_weight <= 5:
            level = "Medium"
        else:
            level = "High"

        return {
            "level": level,
            "score": round(avg_weight, 2),
            "maxPossible": 7,
        }

    # ─────────────────────────────────────────────────────────────────────
    def predict(self, symptoms: list[str]) -> dict[str, Any]:
        """
        Run prediction on a list of extracted symptom tokens.

        Args:
            symptoms: List of symptom names in dataset format (with underscores).

        Returns:
            Structured dict with prediction, confidence, differentials,
            description, precautions, severity, and emergency flag.
        """
        if not symptoms:
            return {
                "success": False,
                "error": "No symptoms could be identified from your input. Please describe your symptoms more clearly.",
                "symptoms_detected": [],
            }

        # Build the input string: join symptoms, replace _ with space
        symptom_text = " ".join(symptoms).replace("_", " ")

        # Get decision function scores
        raw_scores = self.model.decision_function([symptom_text])[0]

        # Apply softmax to get confidence percentages
        probabilities = self._softmax(raw_scores)

        # Sort by confidence (descending)
        sorted_indices = np.argsort(probabilities)[::-1]

        # Top prediction
        top_idx = sorted_indices[0]
        predicted_disease = self.classes[top_idx]
        confidence = float(probabilities[top_idx]) * 100

        # Top 3 differential diagnoses (excluding the primary)
        differentials = []
        for idx in sorted_indices[1:4]:
            differentials.append({
                "disease": self.classes[idx],
                "confidence": round(float(probabilities[idx]) * 100, 2),
            })

        # Severity assessment
        severity = self._calculate_severity(symptoms)

        # Description and precautions
        description = self.descriptions.get(predicted_disease, "No description available.")
        precautions = self.precautions.get(predicted_disease, [])

        # Emergency check
        is_emergency = predicted_disease in EMERGENCY_DISEASES

        # Format symptom display names
        symptoms_display = [s.replace("_", " ").title() for s in symptoms]

        return {
            "success": True,
            "prediction": {
                "disease": predicted_disease,
                "confidence": round(confidence, 2),
                "description": description,
            },
            "symptoms_detected": symptoms_display,
            "symptoms_raw": symptoms,
            "differentialDiagnoses": differentials,
            "severity": severity,
            "precautions": precautions,
            "isEmergency": is_emergency,
            "emergencyMessage": (
                "⚠️ This condition may require immediate medical attention. "
                "Please seek emergency care or call emergency services right away."
                if is_emergency
                else None
            ),
            "disclaimer": (
                "This is an AI-powered preliminary assessment and should NOT replace "
                "professional medical advice. Please consult a qualified healthcare "
                "provider for proper diagnosis and treatment."
            ),
        }

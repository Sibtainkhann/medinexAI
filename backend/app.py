"""
MedinexAI — FastAPI Application

Endpoints:
  POST /predict       — Accept natural language, extract symptoms, predict disease
  GET  /health        — Health check
  GET  /model-status  — Model metadata
"""

import os
import time
import traceback

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from nlp.symptom_extractor import SymptomExtractor
from services.prediction_service import PredictionService


# ── Pydantic Schemas ─────────────────────────────────────────────────────────

class PredictRequest(BaseModel):
    text: str = Field(..., min_length=2, max_length=2000, description="Natural language symptom description")


class SymptomDetail(BaseModel):
    name: str
    weight: int


class MatchedDisease(BaseModel):
    name: str
    confidence: float


class PredictResponse(BaseModel):
    predicted_disease: str
    detected_symptoms: list[SymptomDetail]
    confidence: float
    severity: str
    severity_color: str
    severity_bg: str
    severity_border: str
    description: str
    precautions: list[str]
    matched_diseases: list[MatchedDisease]
    is_emergency: bool
    emergency_message: str | None = None


class ErrorResponse(BaseModel):
    error: str
    detected_symptoms: list[str] = []


class HealthResponse(BaseModel):
    status: str
    uptime_seconds: float


class ModelStatusResponse(BaseModel):
    status: str
    model_type: str
    disease_count: int
    symptom_count: int


# ── Severity Color Mapping ───────────────────────────────────────────────────

SEVERITY_STYLES = {
    "Low": {
        "color": "#10B981",
        "bg": "rgba(16,185,129,0.1)",
        "border": "rgba(16,185,129,0.25)",
    },
    "Medium": {
        "color": "#F59E0B",
        "bg": "rgba(245,158,11,0.1)",
        "border": "rgba(245,158,11,0.25)",
    },
    "High": {
        "color": "#EF4444",
        "bg": "rgba(239,68,68,0.1)",
        "border": "rgba(239,68,68,0.25)",
    },
}


# ── Application Setup ────────────────────────────────────────────────────────

app = FastAPI(
    title="MedinexAI",
    description="AI-powered disease prediction from natural language symptom descriptions",
    version="1.0.0",
)

# CORS — allow frontend origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "https://medinex-ai.vercel.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global state
_start_time = time.time()
_extractor: SymptomExtractor | None = None
_predictor: PredictionService | None = None


@app.on_event("startup")
async def startup():
    global _extractor, _predictor
    base_dir = os.path.dirname(os.path.abspath(__file__))
    print("Loading NLP pipeline (spaCy + synonym map + fuzzy matcher) ...")
    _extractor = SymptomExtractor(data_dir=os.path.join(base_dir, "data"))
    print(f"  Loaded {len(_extractor.symptom_list)} symptoms")
    print("Loading ML model + disease intelligence datasets ...")
    _predictor = PredictionService(base_dir=base_dir)
    print(f"  Loaded model with {len(_predictor.classes)} disease classes")
    print("MedinexAI ready.")


# ── Routes ───────────────────────────────────────────────────────────────────

@app.post("/predict", response_model=PredictResponse | ErrorResponse)
async def predict(req: PredictRequest):
    """
    Accept a natural language symptom description, extract symptoms via NLP,
    predict disease via ML, and return enriched results.
    """
    if _extractor is None or _predictor is None:
        raise HTTPException(status_code=503, detail="Model not loaded yet")

    try:
        # Step 1: NLP extraction
        symptoms = _extractor.extract(req.text)

        print("\nUSER INPUT:", req.text)
        print("EXTRACTED SYMPTOMS:", symptoms)

        if not symptoms:
            return ErrorResponse(
                error="No symptoms could be identified from your input. "
                      "Please describe your symptoms more clearly, for example: "
                      "'I have a headache and feel nauseous'",
                detected_symptoms=[],
            )

        # Step 2: ML prediction
        result = _predictor.predict(symptoms)

        if not result.get("success", False):
            return ErrorResponse(
                error=result.get("error", "Prediction failed"),
                detected_symptoms=result.get("symptoms_detected", []),
            )

        # Step 3: Format response for frontend
        disease = result["prediction"]["disease"]
        confidence = result["prediction"]["confidence"]
        severity_level = result["severity"]["level"]
        styles = SEVERITY_STYLES.get(severity_level, SEVERITY_STYLES["Medium"])

        # Build symptom details with weights
        symptom_details = []
        for s in result["symptoms_raw"]:
            weight = _predictor.severity_weights.get(s, 3)
            # Scale weight (1-7) to a display percentage (40-100)
            display_weight = min(100, max(40, int(weight / 7 * 100)))
            symptom_details.append(SymptomDetail(
                name=s.replace("_", " "),
                weight=display_weight,
            ))

        # Sort by weight descending
        symptom_details.sort(key=lambda x: x.weight, reverse=True)

        # Build matched diseases list (top prediction + differentials)
        matched_diseases = [
            MatchedDisease(name=disease, confidence=round(confidence, 1))
        ]
        for diff in result.get("differentialDiagnoses", []):
            matched_diseases.append(
                MatchedDisease(
                    name=diff["disease"],
                    confidence=round(diff["confidence"], 1),
                )
            )

        return PredictResponse(
            predicted_disease=disease,
            detected_symptoms=symptom_details,
            confidence=round(confidence, 1),
            severity=severity_level,
            severity_color=styles["color"],
            severity_bg=styles["bg"],
            severity_border=styles["border"],
            description=result["prediction"]["description"],
            precautions=result.get("precautions", []),
            matched_diseases=matched_diseases,
            is_emergency=result.get("isEmergency", False),
            emergency_message=result.get("emergencyMessage"),
        )

    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Internal error: {str(e)}")


@app.get("/health", response_model=HealthResponse)
async def health():
    """Basic health check."""
    return HealthResponse(
        status="ok",
        uptime_seconds=round(time.time() - _start_time, 2),
    )


@app.get("/model-status", response_model=ModelStatusResponse)
async def model_status():
    """Return model metadata."""
    if _predictor is None or _extractor is None:
        raise HTTPException(status_code=503, detail="Model not loaded yet")

    return ModelStatusResponse(
        status="loaded",
        model_type="TfidfVectorizer + LinearSVC",
        disease_count=len(_predictor.classes),
        symptom_count=len(_extractor.symptom_list),
    )

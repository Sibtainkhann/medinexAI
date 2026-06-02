"""Integration tests for the FastAPI endpoints."""

import pytest
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from fastapi.testclient import TestClient
from app import app


@pytest.fixture(scope="module")
def client():
    with TestClient(app) as c:
        yield c


class TestHealthEndpoint:
    def test_health_returns_ok(self, client):
        res = client.get("/health")
        assert res.status_code == 200
        data = res.json()
        assert data["status"] == "ok"
        assert "uptime_seconds" in data


class TestModelStatusEndpoint:
    def test_model_status(self, client):
        res = client.get("/model-status")
        assert res.status_code == 200
        data = res.json()
        assert data["status"] == "loaded"
        assert data["disease_count"] == 41
        assert data["symptom_count"] >= 100
        assert data["model_type"] == "TfidfVectorizer + LinearSVC"


class TestPredictEndpoint:
    def test_predict_valid_input(self, client):
        res = client.post("/predict", json={"text": "I have a bad headache and feel nauseous"})
        assert res.status_code == 200
        data = res.json()
        assert "predicted_disease" in data
        assert "confidence" in data
        assert "detected_symptoms" in data
        assert "severity" in data
        assert "precautions" in data
        assert "matched_diseases" in data

    def test_predict_returns_severity_colors(self, client):
        res = client.post("/predict", json={"text": "itching skin rash"})
        assert res.status_code == 200
        data = res.json()
        assert "severity_color" in data
        assert "severity_bg" in data
        assert "severity_border" in data

    def test_predict_empty_text(self, client):
        res = client.post("/predict", json={"text": ""})
        assert res.status_code == 422  # Validation error (min_length=2)

    def test_predict_gibberish(self, client):
        res = client.post("/predict", json={"text": "xyz abc random words nonsense"})
        assert res.status_code == 200
        data = res.json()
        # Should return an error response since no symptoms detected
        assert "error" in data or "predicted_disease" in data

    def test_predict_multiple_symptoms(self, client):
        res = client.post(
            "/predict",
            json={"text": "I have high fever, body pain, sweating and chills"},
        )
        assert res.status_code == 200
        data = res.json()
        assert "predicted_disease" in data
        assert len(data.get("detected_symptoms", [])) >= 2

    def test_predict_emergency_detection(self, client):
        res = client.post(
            "/predict",
            json={"text": "severe chest pain, breathlessness, sweating"},
        )
        assert res.status_code == 200
        data = res.json()
        assert "is_emergency" in data
        assert isinstance(data["is_emergency"], bool)

    def test_predict_confidence_range(self, client):
        res = client.post("/predict", json={"text": "itching and skin rash with bumps"})
        assert res.status_code == 200
        data = res.json()
        if "confidence" in data:
            assert 0 < data["confidence"] <= 100

    def test_predict_matched_diseases_list(self, client):
        res = client.post("/predict", json={"text": "headache vomiting nausea"})
        assert res.status_code == 200
        data = res.json()
        if "matched_diseases" in data:
            assert len(data["matched_diseases"]) >= 1
            assert "name" in data["matched_diseases"][0]
            assert "confidence" in data["matched_diseases"][0]

    def test_cors_headers(self, client):
        res = client.options(
            "/predict",
            headers={
                "Origin": "http://localhost:5173",
                "Access-Control-Request-Method": "POST",
            },
        )
        # Should not return 405
        assert res.status_code in [200, 204, 307]

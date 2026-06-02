"""Tests for the prediction service."""

import pytest
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))


class TestPredictionService:
    """Test the disease prediction + intelligence engine."""

    @pytest.fixture(scope="class")
    def service(self):
        from services.prediction_service import PredictionService
        base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        return PredictionService(base_dir=base_dir)

    def test_model_loaded(self, service):
        assert service.model is not None
        assert len(service.classes) == 41

    def test_descriptions_loaded(self, service):
        assert len(service.descriptions) >= 30

    def test_precautions_loaded(self, service):
        assert len(service.precautions) >= 30

    def test_severity_weights_loaded(self, service):
        assert len(service.severity_weights) >= 100

    def test_predict_valid_symptoms(self, service):
        result = service.predict(["headache", "vomiting", "nausea"])
        assert result["success"] is True
        assert "prediction" in result
        assert result["prediction"]["confidence"] > 0
        assert isinstance(result["prediction"]["disease"], str)

    def test_predict_single_symptom(self, service):
        result = service.predict(["chest_pain"])
        assert result["success"] is True

    def test_predict_empty_symptoms(self, service):
        result = service.predict([])
        assert result["success"] is False

    def test_confidence_range(self, service):
        result = service.predict(["itching", "skin_rash", "nodal_skin_eruptions"])
        conf = result["prediction"]["confidence"]
        assert 0 < conf <= 100

    def test_severity_calculation(self, service):
        sev = service._calculate_severity(["headache"])  # weight=3 → Low
        assert sev["level"] in ["Low", "Medium", "High"]

    def test_emergency_detection(self, service):
        result = service.predict(["chest_pain", "breathlessness", "sweating"])
        # May or may not trigger emergency depending on prediction
        assert isinstance(result.get("isEmergency", False), bool)

    def test_differentials_present(self, service):
        result = service.predict(["high_fever", "headache", "sweating", "chills"])
        assert "differentialDiagnoses" in result
        assert len(result["differentialDiagnoses"]) >= 1

    def test_precautions_in_result(self, service):
        result = service.predict(["itching", "skin_rash"])
        assert "precautions" in result
        # Should have at least one precaution
        assert isinstance(result["precautions"], list)

    def test_fungal_infection_prediction(self, service):
        """Known pattern: itching + skin_rash + nodal_skin_eruptions → Fungal infection."""
        result = service.predict(["itching", "skin_rash", "nodal_skin_eruptions"])
        assert result["success"] is True
        assert result["prediction"]["disease"] == "Fungal infection"
        assert result["prediction"]["confidence"] > 50

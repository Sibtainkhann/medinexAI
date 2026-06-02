"""
MedinexAI - End-to-End API Testing
Tests 10+ realistic symptom inputs through the full pipeline:
  Frontend text -> POST /predict -> NLP extraction -> ML prediction -> enriched response
"""

import sys
import json
import time

try:
    import httpx
except ImportError:
    print("[ERROR] httpx not installed. Run: pip install httpx")
    sys.exit(1)

API_BASE = "http://localhost:8000"

# ---- 12 Realistic Test Cases ----
TEST_CASES = [
    {
        "id": 1,
        "category": "Natural Language / Informal",
        "input": "I've been throwing up all morning and my head is killing me",
        "expect_symptoms": ["vomiting", "headache"],
        "expect_disease": None,  # Any valid prediction is ok
        "expect_emergency": False,
    },
    {
        "id": 2,
        "category": "Direct Symptoms",
        "input": "itching skin rash nodal skin eruptions",
        "expect_symptoms": ["itching", "skin_rash"],
        "expect_disease": "Fungal infection",
        "expect_emergency": False,
    },
    {
        "id": 3,
        "category": "Colloquial Language",
        "input": "I have a really bad tummy ache and I keep feeling like I need to puke",
        "expect_symptoms": ["stomach_pain", "vomiting"],
        "expect_disease": None,
        "expect_emergency": False,
    },
    {
        "id": 4,
        "category": "Emergency Detection",
        "input": "severe chest pain with shortness of breath and heavy sweating",
        "expect_symptoms": ["chest_pain", "breathlessness", "sweating"],
        "expect_disease": "Heart attack",
        "expect_emergency": True,
    },
    {
        "id": 5,
        "category": "Multiple Symptoms",
        "input": "high fever body aches chills and extreme fatigue for three days",
        "expect_symptoms": ["high_fever", "chills", "fatigue"],
        "expect_disease": None,
        "expect_emergency": False,
    },
    {
        "id": 6,
        "category": "Typo Handling",
        "input": "I have a hedache and nausia and diarhea",
        "expect_symptoms": ["headache", "nausea", "diarrhoea"],
        "expect_disease": None,
        "expect_emergency": False,
    },
    {
        "id": 7,
        "category": "Skin Condition",
        "input": "pus filled pimples and blackheads with skin peeling",
        "expect_symptoms": ["pus_filled_pimples", "blackheads", "skin_peeling"],
        "expect_disease": "Acne",
        "expect_emergency": False,
    },
    {
        "id": 8,
        "category": "Respiratory",
        "input": "I can't stop sneezing and my nose is always running with watery eyes",
        "expect_symptoms": ["continuous_sneezing"],
        "expect_disease": None,
        "expect_emergency": False,
    },
    {
        "id": 9,
        "category": "Digestive / GERD",
        "input": "burning in my stomach with acid reflux and constant indigestion",
        "expect_symptoms": ["acidity", "indigestion"],
        "expect_disease": None,
        "expect_emergency": False,
    },
    {
        "id": 10,
        "category": "Joint Pain",
        "input": "my knees hurt badly and I have stiff joints with difficulty walking",
        "expect_symptoms": ["knee_pain"],
        "expect_disease": None,
        "expect_emergency": False,
    },
    {
        "id": 11,
        "category": "Liver Symptoms",
        "input": "dark urine yellowish skin and loss of appetite with nausea",
        "expect_symptoms": ["dark_urine", "yellowish_skin", "loss_of_appetite", "nausea"],
        "expect_disease": None,
        "expect_emergency": False,
    },
    {
        "id": 12,
        "category": "Dengue-like Emergency",
        "input": "very high fever with red spots on body and muscle pain and vomiting",
        "expect_symptoms": ["high_fever", "red_spots_over_body", "muscle_pain", "vomiting"],
        "expect_disease": "Dengue",
        "expect_emergency": True,
    },
]


def test_health():
    """Test GET /health"""
    print("\n[TEST] GET /health")
    try:
        r = httpx.get(f"{API_BASE}/health", timeout=10)
        data = r.json()
        assert r.status_code == 200, f"Status {r.status_code}"
        assert data["status"] == "ok"
        print(f"  [PASS] Status: {data['status']}, Uptime: {data['uptime_seconds']:.1f}s")
        return True
    except Exception as e:
        print(f"  [FAIL] {e}")
        return False


def test_model_status():
    """Test GET /model-status"""
    print("\n[TEST] GET /model-status")
    try:
        r = httpx.get(f"{API_BASE}/model-status", timeout=10)
        data = r.json()
        assert r.status_code == 200
        assert data["disease_count"] == 41
        assert data["symptom_count"] >= 100
        print(f"  [PASS] Model: {data['model_type']}")
        print(f"  [PASS] Diseases: {data['disease_count']}, Symptoms: {data['symptom_count']}")
        return True
    except Exception as e:
        print(f"  [FAIL] {e}")
        return False


def test_predict(tc):
    """Test POST /predict with a single test case."""
    try:
        r = httpx.post(
            f"{API_BASE}/predict",
            json={"text": tc["input"]},
            timeout=30,
        )
        data = r.json()

        # Check for error response (no symptoms found)
        if "error" in data:
            return {
                "id": tc["id"],
                "category": tc["category"],
                "input": tc["input"],
                "status": "FAIL",
                "reason": f"No symptoms extracted: {data['error'][:80]}",
                "symptoms": [],
                "disease": "N/A",
                "confidence": 0,
                "severity": "N/A",
                "emergency": False,
            }

        assert r.status_code == 200, f"HTTP {r.status_code}"

        # Extract results
        disease = data.get("predicted_disease", "N/A")
        confidence = data.get("confidence", 0)
        severity = data.get("severity", "N/A")
        is_emergency = data.get("is_emergency", False)
        symptoms = [s["name"] for s in data.get("detected_symptoms", [])]
        matched = data.get("matched_diseases", [])
        precautions = data.get("precautions", [])
        description = data.get("description", "")

        # Validate expected symptoms found
        symptoms_lower = [s.lower().replace(" ", "_") for s in symptoms]
        expected_found = []
        expected_missing = []
        for exp in tc.get("expect_symptoms", []):
            if any(exp.lower() in s for s in symptoms_lower):
                expected_found.append(exp)
            else:
                expected_missing.append(exp)

        # Validate disease prediction
        disease_match = True
        if tc["expect_disease"]:
            disease_match = disease == tc["expect_disease"]

        # Validate emergency
        emergency_match = is_emergency == tc.get("expect_emergency", False)

        # Determine overall status
        status = "PASS"
        reasons = []
        if expected_missing and len(expected_missing) > len(tc.get("expect_symptoms", [])) // 2:
            status = "WARN"
            reasons.append(f"Missing symptoms: {expected_missing}")
        if tc["expect_disease"] and not disease_match:
            status = "WARN"
            reasons.append(f"Expected {tc['expect_disease']}, got {disease}")
        if not emergency_match:
            status = "WARN"
            reasons.append(f"Emergency: expected {tc['expect_emergency']}, got {is_emergency}")
        if not symptoms:
            status = "FAIL"
            reasons.append("No symptoms extracted")

        # Validate response structure completeness
        has_severity_color = "severity_color" in data
        has_description = len(description) > 10
        has_precautions = len(precautions) > 0
        has_differentials = len(matched) >= 2

        return {
            "id": tc["id"],
            "category": tc["category"],
            "input": tc["input"],
            "status": status,
            "reason": "; ".join(reasons) if reasons else "All checks passed",
            "symptoms": symptoms,
            "disease": disease,
            "confidence": confidence,
            "severity": severity,
            "severity_color": has_severity_color,
            "emergency": is_emergency,
            "emergency_match": emergency_match,
            "has_description": has_description,
            "has_precautions": has_precautions,
            "has_differentials": has_differentials,
            "differentials": [f"{d['name']} ({d['confidence']}%)" for d in matched[:3]],
        }

    except Exception as e:
        return {
            "id": tc["id"],
            "category": tc["category"],
            "input": tc["input"],
            "status": "FAIL",
            "reason": str(e),
            "symptoms": [],
            "disease": "N/A",
            "confidence": 0,
            "severity": "N/A",
            "emergency": False,
        }


def test_edge_cases():
    """Test edge cases."""
    print("\n" + "=" * 60)
    print("  EDGE CASE TESTS")
    print("=" * 60)

    # Empty-ish input
    print("\n[EDGE] Very short input")
    r = httpx.post(f"{API_BASE}/predict", json={"text": "ab"}, timeout=10)
    print(f"  Status: {r.status_code}, Response has 'error': {'error' in r.json()}")

    # Gibberish
    print("\n[EDGE] Gibberish input")
    r = httpx.post(f"{API_BASE}/predict", json={"text": "asdfghjkl qwertyuiop zxcvbnm"}, timeout=10)
    data = r.json()
    print(f"  Status: {r.status_code}, Has error: {'error' in data}")

    # Very long input
    print("\n[EDGE] Long input")
    long_text = "I have headache and fever and " * 20
    r = httpx.post(f"{API_BASE}/predict", json={"text": long_text}, timeout=15)
    print(f"  Status: {r.status_code}, Disease: {r.json().get('predicted_disease', r.json().get('error', 'N/A')[:40])}")

    # Empty body
    print("\n[EDGE] Empty text field")
    r = httpx.post(f"{API_BASE}/predict", json={"text": ""}, timeout=10)
    print(f"  Status: {r.status_code} (expect 422)")


def main():
    print("=" * 60)
    print("  MedinexAI - End-to-End Testing Report")
    print("=" * 60)

    # Infrastructure tests
    h = test_health()
    m = test_model_status()

    if not h or not m:
        print("\n[ABORT] Server not healthy. Cannot proceed with tests.")
        sys.exit(1)

    # Prediction tests
    print("\n" + "=" * 60)
    print("  PREDICTION TESTS (12 Cases)")
    print("=" * 60)

    results = []
    for tc in TEST_CASES:
        result = test_predict(tc)
        results.append(result)

        status_marker = {"PASS": "[PASS]", "WARN": "[WARN]", "FAIL": "[FAIL]"}[result["status"]]

        print(f"\n  Test #{result['id']} ({result['category']}) {status_marker}")
        print(f"  Input:    \"{result['input'][:65]}{'...' if len(result['input']) > 65 else ''}\"")
        print(f"  Symptoms: {result['symptoms']}")
        print(f"  Disease:  {result['disease']} ({result['confidence']}%)")
        print(f"  Severity: {result['severity']}")
        if result.get("differentials"):
            print(f"  Differentials: {result['differentials']}")
        if result["emergency"]:
            print(f"  EMERGENCY: {result['emergency']}")
        if result["status"] != "PASS":
            print(f"  Note: {result['reason']}")

    # Edge cases
    test_edge_cases()

    # Summary
    passed = sum(1 for r in results if r["status"] == "PASS")
    warned = sum(1 for r in results if r["status"] == "WARN")
    failed = sum(1 for r in results if r["status"] == "FAIL")

    print("\n" + "=" * 60)
    print("  TESTING SUMMARY")
    print("=" * 60)
    print(f"  Total Tests:   {len(results)}")
    print(f"  Passed:        {passed}")
    print(f"  Warnings:      {warned}")
    print(f"  Failed:        {failed}")
    print(f"  Pass Rate:     {passed/len(results)*100:.0f}%")
    print()

    # Feature validation
    all_have_desc = all(r.get("has_description", False) for r in results if r["status"] != "FAIL")
    all_have_prec = all(r.get("has_precautions", False) for r in results if r["status"] != "FAIL")
    all_have_diff = all(r.get("has_differentials", False) for r in results if r["status"] != "FAIL")
    all_have_color = all(r.get("severity_color", False) for r in results if r["status"] != "FAIL")
    emergency_correct = all(r.get("emergency_match", True) for r in results)

    print("  Feature Validation:")
    print(f"    NLP Extraction:       {'[PASS]' if passed + warned > 0 else '[FAIL]'}")
    print(f"    ML Prediction:        {'[PASS]' if passed + warned > 0 else '[FAIL]'}")
    print(f"    Confidence Scoring:   {'[PASS]' if all(r['confidence'] > 0 for r in results if r['status'] != 'FAIL') else '[FAIL]'}")
    print(f"    Severity Scoring:     {'[PASS]' if all_have_color else '[FAIL]'}")
    print(f"    Disease Description:  {'[PASS]' if all_have_desc else '[FAIL]'}")
    print(f"    Precautions:          {'[PASS]' if all_have_prec else '[FAIL]'}")
    print(f"    Differential Diag:    {'[PASS]' if all_have_diff else '[FAIL]'}")
    print(f"    Emergency Detection:  {'[PASS]' if emergency_correct else '[WARN]'}")
    print("=" * 60)


if __name__ == "__main__":
    main()

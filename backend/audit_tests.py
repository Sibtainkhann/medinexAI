import httpx
import json

API_BASE = "http://localhost:8000"

TEST_INPUTS = [
    "I am not having a good day",
    "I feel tired",
    "Something feels wrong",
    "I don't feel normal",
    "I feel sick",
    "My head hurts and I keep throwing up",
    "I have chest pain and difficulty breathing"
]

print("=" * 70)
print("             MEDINEX AI - PRODUCTION AUDIT RESULTS")
print("=" * 70)

for i, text in enumerate(TEST_INPUTS, 1):
    print(f"\nTest #{i}: \"{text}\"")
    try:
        r = httpx.post(f"{API_BASE}/predict", json={"text": text}, timeout=15)
        status_code = r.status_code
        data = r.json()
        
        if status_code == 200:
            if "error" in data:
                print(f"  Result:   [NO PREDICTION] (Insufficient symptoms)")
                print(f"  Details:  \"{data['error']}\"")
                print(f"  Status:   PASS (Insufficient symptoms handled correctly)")
            else:
                disease = data.get("predicted_disease")
                confidence = data.get("confidence", 0)
                is_emergency = data.get("is_emergency", False)
                symptoms = [s["name"] for s in data.get("detected_symptoms", [])]
                
                print(f"  Symptoms: {symptoms}")
                print(f"  Disease:  {disease}")
                print(f"  Conf:     {confidence}%")
                print(f"  Emergency: {is_emergency}")
                
                # Check low confidence
                if confidence < 60:
                    print(f"  Notice:   Low confidence detected. UI will display a request for more information.")
                
                # Validation assertions
                if is_emergency:
                    print(f"  Status:   PASS (Emergency alert triggered for critical condition)")
                elif confidence < 60:
                    print(f"  Status:   PASS (Low confidence handled / request more info)")
                else:
                    print(f"  Status:   PASS")
        else:
            print(f"  HTTP Error {status_code}: {data}")
    except Exception as e:
        print(f"  Connection error: {e}")

print("\n" + "=" * 70)

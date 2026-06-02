import os
import numpy as np
import joblib

base_dir = os.path.dirname(os.path.abspath(__file__))
model_path = os.path.join(base_dir, "model", "disease_prediction_model.joblib")
model = joblib.load(model_path)
classes = list(model.classes_)

def get_conf(symptoms, scale=1.0):
    symptom_text = " ".join(symptoms).replace("_", " ")
    scores = model.decision_function([symptom_text])[0]
    # Apply scaled softmax
    shifted = (scores - np.max(scores)) * scale
    exp_scores = np.exp(shifted)
    probs = exp_scores / exp_scores.sum()
    top_idx = np.argmax(probs)
    return classes[top_idx], probs[top_idx] * 100

test_cases = [
    ["itching", "skin_rash", "nodal_skin_eruptions"],
    ["chest_pain", "breathlessness", "sweating"],
    ["headache", "vomiting"],
    ["fatigue"]  # Single symptom (weak match)
]

for s in [1.0, 5.0, 10.0, 15.0, 20.0]:
    print(f"\n--- Scale: {s} ---")
    for tc in test_cases:
        disease, conf = get_conf(tc, scale=s)
        print(f"Symptoms: {tc} -> {disease}: {conf:.1f}%")

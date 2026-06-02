# 🏥 MedinexAI — AI-Powered Disease Prediction System

An intelligent healthcare assistant that predicts diseases from natural language symptom descriptions using NLP and Machine Learning.

> **Note:** This is an AI-generated analysis for informational purposes only. It does not constitute a medical diagnosis. Always consult a qualified healthcare professional.

---

## ✨ Features

- **Conversational Symptom Input** — Describe symptoms in plain English, no medical jargon required
- **NLP Symptom Extraction** — spaCy + RapidFuzz pipeline handles synonyms, typos, and informal language
- **ML Disease Prediction** — TF-IDF + LinearSVC model trained on 4,920 clinical cases across 41 diseases
- **Confidence Scoring** — Calibrated confidence percentages for each prediction
- **Severity Triage** — Automatic severity assessment (Low / Medium / High / Critical)
- **Disease Intelligence** — Descriptions, precautions, and differential diagnoses
- **Emergency Detection** — Automatic alerts for critical conditions (heart attack, dengue, etc.)
- **Premium UI** — Dark-themed, animated React interface with real-time analysis visualization

## 🏗️ Architecture

```
Frontend (React + Vite)          Backend (FastAPI)
┌─────────────────────┐         ┌─────────────────────────┐
│  HomePage            │         │  POST /predict           │
│  CheckerPage ────────┼────────→│    ↓ NLP Pipeline        │
│  ResultPage   ←──────┼────────┤    ↓ spaCy tokenize      │
│                      │         │    ↓ Synonym lookup       │
│  Deployed: Vercel    │         │    ↓ RapidFuzz match      │
└─────────────────────┘         │    ↓ ML Prediction        │
                                │    ↓ Disease Intelligence  │
                                │  GET /health              │
                                │  GET /model-status        │
                                │                           │
                                │  Deployed: Render         │
                                └─────────────────────────┘
```

## 🚀 Quick Start

### Prerequisites
- Python 3.10+
- Node.js 18+

### Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Download spaCy language model
python -m spacy download en_core_web_sm

# Train the ML model (generates model/disease_prediction_model.joblib)
python train_model.py

# Start the API server
uvicorn app:app --reload --port 8000
```

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Start development server
npm run dev
```

The frontend will be available at `http://localhost:5173` and will connect to the backend at `http://localhost:8000`.

## 📡 API Endpoints

### `POST /predict`
Predict disease from natural language symptom description.

**Request:**
```json
{
  "text": "I have a severe headache and keep vomiting"
}
```

**Response:**
```json
{
  "predicted_disease": "Migraine",
  "detected_symptoms": [
    { "name": "headache", "weight": 92 },
    { "name": "vomiting", "weight": 85 }
  ],
  "confidence": 87,
  "severity": "Medium",
  "severity_color": "#F59E0B",
  "severity_bg": "rgba(245,158,11,0.1)",
  "severity_border": "rgba(245,158,11,0.25)",
  "description": "A neurological condition characterized by...",
  "precautions": [
    "meditation",
    "reduce stress",
    "use poloroid glasses in sun",
    "consult doctor"
  ],
  "matched_diseases": [
    { "name": "Migraine", "confidence": 87 },
    { "name": "Cervical spondylosis", "confidence": 42 },
    { "name": "Hypertension", "confidence": 28 }
  ],
  "is_emergency": false
}
```

### `GET /health`
Health check endpoint.

### `GET /model-status`
Returns model metadata including disease count and symptom count.

## 🧠 NLP Pipeline

The natural language processing pipeline converts informal symptom descriptions into structured clinical terms:

1. **Text Normalization** — Lowercase, expand contractions, remove noise
2. **spaCy Tokenization** — Tokenize and lemmatize using `en_core_web_sm`
3. **Synonym Resolution** — 100+ colloquial → clinical mappings (e.g., "tummy ache" → "stomach_pain")
4. **Fuzzy Matching** — RapidFuzz with 75% threshold catches typos ("hedache" → "headache")
5. **Deduplication** — Remove duplicate symptom matches

## 🧪 Testing

```bash
cd backend
pytest tests/ -v --cov --cov-report=term-missing
```

## 🚢 Deployment

### Backend → Render
The `render.yaml` is pre-configured. Connect the GitHub repo to Render and it will auto-deploy.

### Frontend → Vercel
The `vercel.json` is pre-configured. Connect the GitHub repo to Vercel and set:
- `VITE_API_URL` = your Render backend URL

## 📊 Datasets

| Dataset | Records | Purpose |
|---------|---------|---------|
| `dataset.csv` | 4,920 | Disease ↔ symptom training data |
| `Symptom-severity.csv` | 133 | Symptom severity weights (1-7) |
| `symptom_Description.csv` | 41 | Disease descriptions |
| `symptom_precaution.csv` | 41 | Disease-specific precautions |

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, CSS3 |
| Backend | FastAPI, Uvicorn |
| ML Model | scikit-learn (TF-IDF + LinearSVC) |
| NLP | spaCy, RapidFuzz |
| Deployment | Vercel (frontend), Render (backend) |

## 📄 License

This project is for educational and portfolio purposes.

---

Built by [Sibtain Khan](https://github.com/Sibtainkhann) · Powered by AI 🧬

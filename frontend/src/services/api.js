const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export async function predictSymptoms(text) {
  const res = await fetch(`${API_BASE}/predict`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text }),
  });
  if (!res.ok) throw new Error(`Prediction failed: ${res.status}`);
  return res.json();
}

export async function checkHealth() {
  const res = await fetch(`${API_BASE}/health`);
  return res.json();
}

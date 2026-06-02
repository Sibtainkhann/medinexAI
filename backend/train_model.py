"""
MedinexAI — Model Training Script
Trains a TfidfVectorizer + LinearSVC pipeline on the symptom-disease dataset.
"""

import os
import re
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.svm import LinearSVC
from sklearn.pipeline import Pipeline
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report
import joblib


def clean_symptoms(text: str) -> str:
    """
    Normalize symptom text:
    - Replace underscores with spaces
    - Collapse multiple whitespace characters into one
    - Lowercase and strip
    """
    if not isinstance(text, str):
        return ""
    text = text.replace("_", " ")
    text = re.sub(r"\s+", " ", text)
    return text.lower().strip()


def main():
    # ----- Paths -----
    base_dir = os.path.dirname(os.path.abspath(__file__))
    data_path = os.path.join(base_dir, "data", "dataset.csv")
    model_dir = os.path.join(base_dir, "model")
    model_path = os.path.join(model_dir, "disease_prediction_model.joblib")

    # ----- Load dataset -----
    print(f"Loading dataset from {data_path} ...")
    df = pd.read_csv(data_path)
    print(f"  Rows loaded: {len(df)}")
    print(f"  Columns: {list(df.columns)}")

    # Strip column names and disease names
    df.columns = df.columns.str.strip()
    df["Disease"] = df["Disease"].str.strip()
    df["Symptom"] = df["Symptom"].apply(clean_symptoms)

    # Drop any empty rows
    df = df[df["Symptom"].str.len() > 0].reset_index(drop=True)

    print(f"  Unique diseases: {df['Disease'].nunique()}")
    print(f"  Sample cleaned symptoms: {df['Symptom'].iloc[0]}")

    # ----- Split -----
    X = df["Symptom"]
    y = df["Disease"]

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )
    print(f"\n  Train size: {len(X_train)}, Test size: {len(X_test)}")

    # ----- Build pipeline -----
    pipeline = Pipeline([
        ("tfidf", TfidfVectorizer()),
        ("clf", LinearSVC()),
    ])

    print("\nTraining TfidfVectorizer + LinearSVC pipeline ...")
    pipeline.fit(X_train, y_train)

    # ----- Evaluate -----
    y_pred = pipeline.predict(X_test)
    print("\n========== Classification Report ==========\n")
    print(classification_report(y_test, y_pred))

    accuracy = (y_pred == y_test).mean()
    print(f"Overall accuracy: {accuracy:.4f}")

    # ----- Save -----
    os.makedirs(model_dir, exist_ok=True)
    joblib.dump(pipeline, model_path)
    print(f"\nModel saved to {model_path}")
    print(f"Model file size: {os.path.getsize(model_path) / 1024:.1f} KB")


if __name__ == "__main__":
    main()

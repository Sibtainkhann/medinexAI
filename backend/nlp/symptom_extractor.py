"""
MedinexAI — Symptom Extractor (NLP Pipeline)

Pipeline:
  raw_text → lowercase → expand contractions → spaCy tokenize/lemmatize
  → synonym lookup → fuzzy match against known symptoms → deduplicated list
"""

import os
import re
from typing import List

import pandas as pd
import spacy
from rapidfuzz import fuzz, process

from nlp.synonym_map import SYNONYM_MAP


# ── Contractions ─────────────────────────────────────────────────────────────
CONTRACTIONS = {
    "can't": "cannot",
    "cant": "cannot",
    "won't": "will not",
    "wont": "will not",
    "don't": "do not",
    "dont": "do not",
    "doesn't": "does not",
    "doesn't": "does not",
    "didn't": "did not",
    "isn't": "is not",
    "aren't": "are not",
    "wasn't": "was not",
    "weren't": "were not",
    "haven't": "have not",
    "hasn't": "has not",
    "hadn't": "had not",
    "couldn't": "could not",
    "wouldn't": "would not",
    "shouldn't": "should not",
    "i'm": "i am",
    "i've": "i have",
    "i'll": "i will",
    "i'd": "i would",
    "it's": "it is",
    "that's": "that is",
    "there's": "there is",
    "he's": "he is",
    "she's": "she is",
    "we're": "we are",
    "they're": "they are",
    "you're": "you are",
    "you've": "you have",
    "you'll": "you will",
    "we've": "we have",
    "we'll": "we will",
    "they've": "they have",
    "they'll": "they will",
    "let's": "let us",
}


class SymptomExtractor:
    """Extracts symptom tokens from free-text user input."""

    FUZZY_THRESHOLD = 75  # Minimum score for fuzzy matching

    def __init__(self, data_dir: str | None = None):
        """
        Initialize the extractor.

        Args:
            data_dir: Path to the data/ folder containing dataset.csv.
                      Defaults to <backend>/data/.
        """
        if data_dir is None:
            data_dir = os.path.join(
                os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
                "data",
            )

        # Load spaCy model
        self.nlp = spacy.load("en_core_web_sm", disable=["ner", "parser"])

        # Build the canonical symptom list from dataset.csv
        self.symptom_list = self._load_symptoms(data_dir)

        # Human-readable versions (underscores → spaces) for fuzzy matching
        self.symptom_display = {
            s.replace("_", " "): s for s in self.symptom_list
        }

        # Pre-build a list of display names for rapidfuzz
        self.display_names = list(self.symptom_display.keys())

    # ─────────────────────────────────────────────────────────────────────
    @staticmethod
    def _load_symptoms(data_dir: str) -> List[str]:
        """Extract all unique symptom tokens from dataset.csv."""
        df = pd.read_csv(os.path.join(data_dir, "dataset.csv"))
        df.columns = df.columns.str.strip()

        all_symptoms: set[str] = set()
        for raw in df["Symptom"].dropna():
            # Normalize: collapse whitespace, then split
            cleaned = re.sub(r"\s+", " ", raw.strip())
            tokens = cleaned.split()
            # Rejoin tokens that are parts of an underscore-separated name
            # The dataset uses space-separated symptom tokens where each
            # symptom may itself contain underscores (e.g. "skin_rash")
            for token in tokens:
                token = token.strip().lower()
                if token:
                    all_symptoms.add(token)

        # Post-process: handle known data artefact "dischromic _patches"
        # The dataset has "dischromic" and "_patches" as separate tokens
        # but the real symptom is "dischromic_patches"
        if "_patches" in all_symptoms:
            all_symptoms.discard("_patches")
        if "dischromic" in all_symptoms:
            all_symptoms.discard("dischromic")
        all_symptoms.add("dischromic_patches")

        # Also handle "spotting_" + "urination" → "spotting_urination"
        if "spotting_" in all_symptoms:
            all_symptoms.discard("spotting_")
        if "urination" in all_symptoms:
            all_symptoms.discard("urination")
        all_symptoms.add("spotting_urination")

        # Handle "foul_smell_of" + "urine" → "foul_smell_of_urine"
        # but keep "foul_smell_of_urine" and remove fragments
        if "foul_smell_of" in all_symptoms:
            all_symptoms.discard("foul_smell_of")
        if "urine" in all_symptoms:
            all_symptoms.discard("urine")
        all_symptoms.add("foul_smell_of_urine")

        return sorted(all_symptoms)

    # ─────────────────────────────────────────────────────────────────────
    @staticmethod
    def _expand_contractions(text: str) -> str:
        """Replace common English contractions."""
        for contraction, expansion in CONTRACTIONS.items():
            text = re.sub(
                r"\b" + re.escape(contraction) + r"\b",
                expansion,
                text,
                flags=re.IGNORECASE,
            )
        return text

    # ─────────────────────────────────────────────────────────────────────
    def _synonym_lookup(self, text: str) -> List[str]:
        """
        Try to match the full text or substrings against the synonym map.
        Returns list of matched symptom tokens.
        """
        found: list[str] = []

        # First, try matching the entire text
        if text in SYNONYM_MAP:
            found.append(SYNONYM_MAP[text])
            return found

        # Try progressively smaller n-grams (5-grams down to bigrams)
        words = text.split()
        used_indices: set[int] = set()

        for n in range(min(5, len(words)), 1, -1):
            for i in range(len(words) - n + 1):
                if any(idx in used_indices for idx in range(i, i + n)):
                    continue
                phrase = " ".join(words[i: i + n])
                if phrase in SYNONYM_MAP:
                    found.append(SYNONYM_MAP[phrase])
                    used_indices.update(range(i, i + n))

        # Try single words against synonym map
        for i, word in enumerate(words):
            if i not in used_indices and word in SYNONYM_MAP:
                found.append(SYNONYM_MAP[word])
                used_indices.add(i)

        return found

    # ─────────────────────────────────────────────────────────────────────
    def _fuzzy_match(self, text: str) -> List[str]:
        """
        Fuzzy-match text tokens & n-grams against the known symptom list.
        Returns matched symptom tokens (underscore format).
        """
        found: list[str] = []
        words = text.split()

        # Try n-grams from 4-grams down to unigrams
        used_indices: set[int] = set()

        for n in range(min(4, len(words)), 0, -1):
            for i in range(len(words) - n + 1):
                if any(idx in used_indices for idx in range(i, i + n)):
                    continue
                phrase = " ".join(words[i: i + n])

                # Exact match against display names first
                if phrase in self.symptom_display:
                    found.append(self.symptom_display[phrase])
                    used_indices.update(range(i, i + n))
                    continue

                # Fuzzy match
                result = process.extractOne(
                    phrase,
                    self.display_names,
                    scorer=fuzz.token_sort_ratio,
                    score_cutoff=self.FUZZY_THRESHOLD,
                )
                if result:
                    match_name, score, _ = result
                    # For single words, require a higher threshold to reduce noise
                    if n == 1 and score < 85:
                        continue
                    found.append(self.symptom_display[match_name])
                    used_indices.update(range(i, i + n))

        return found

    # ─────────────────────────────────────────────────────────────────────
    def extract(self, raw_text: str) -> List[str]:
        """
        Full NLP pipeline:
        raw_text → lowercase → expand contractions → spaCy tokenize
        → synonym lookup → fuzzy match → deduplicated symptom list

        Returns:
            Sorted, deduplicated list of symptom tokens (underscore format).
        """
        if not raw_text or not raw_text.strip():
            return []

        # Step 1: Lowercase
        text = raw_text.lower().strip()

        # Step 2: Expand contractions
        text = self._expand_contractions(text)

        # Step 3: Clean punctuation but keep meaningful chars
        text = re.sub(r"[^\w\s']", " ", text)
        text = re.sub(r"\s+", " ", text).strip()

        # Step 4: Synonym lookup (works on raw phrases)
        symptoms: set[str] = set()
        synonym_matches = self._synonym_lookup(text)
        symptoms.update(synonym_matches)

        # Step 5: spaCy tokenization & lemmatization
        doc = self.nlp(text)
        lemmatized = " ".join(
            token.lemma_.lower() for token in doc
            if not token.is_stop and not token.is_punct and len(token.text) > 1
        )

        # Step 6: Synonym lookup on lemmatized text
        lemma_matches = self._synonym_lookup(lemmatized)
        symptoms.update(lemma_matches)

        # Step 7: Fuzzy matching on original text
        fuzzy_matches = self._fuzzy_match(text)
        symptoms.update(fuzzy_matches)

        # Step 8: Fuzzy matching on lemmatized text
        fuzzy_lemma_matches = self._fuzzy_match(lemmatized)
        symptoms.update(fuzzy_lemma_matches)

        return sorted(symptoms)

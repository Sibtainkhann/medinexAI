"""Tests for the NLP symptom extraction pipeline."""

import pytest
import sys
import os

# Add backend to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))


class TestSynonymMap:
    """Test the synonym mapping dictionary."""

    def test_synonym_map_exists(self):
        from nlp.synonym_map import SYNONYM_MAP
        assert isinstance(SYNONYM_MAP, dict)
        assert len(SYNONYM_MAP) >= 50

    def test_common_synonyms(self):
        from nlp.synonym_map import SYNONYM_MAP
        # Head pain → headache
        assert SYNONYM_MAP.get("head pain") == "headache"
        # Throwing up → vomiting
        assert SYNONYM_MAP.get("throwing up") == "vomiting"
        # High temperature → high_fever
        assert SYNONYM_MAP.get("high temperature") == "high_fever"
        # Stomach ache → stomach_pain
        assert SYNONYM_MAP.get("stomach ache") == "stomach_pain"

    def test_typo_synonyms(self):
        from nlp.synonym_map import SYNONYM_MAP
        assert SYNONYM_MAP.get("headace") == "headache"
        assert SYNONYM_MAP.get("nausia") == "nausea"
        assert SYNONYM_MAP.get("diarhea") == "diarrhoea"


class TestSymptomExtractor:
    """Test the full NLP extraction pipeline."""

    @pytest.fixture(scope="class")
    def extractor(self):
        from nlp.symptom_extractor import SymptomExtractor
        data_dir = os.path.join(
            os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
            "data",
        )
        return SymptomExtractor(data_dir=data_dir)

    def test_symptom_list_loaded(self, extractor):
        assert len(extractor.symptom_list) >= 100

    def test_exact_symptom_extraction(self, extractor):
        result = extractor.extract("headache and vomiting")
        assert "headache" in result
        assert "vomiting" in result

    def test_natural_language_extraction(self, extractor):
        result = extractor.extract("I have been throwing up and my head hurts badly")
        assert "vomiting" in result or "headache" in result

    def test_typo_handling(self, extractor):
        result = extractor.extract("I have a bad hedache")
        assert "headache" in result

    def test_synonym_resolution(self, extractor):
        result = extractor.extract("high temperature and stomach ache")
        assert "high_fever" in result or "stomach_pain" in result

    def test_empty_input(self, extractor):
        assert extractor.extract("") == []
        assert extractor.extract("   ") == []

    def test_nonsense_input(self, extractor):
        result = extractor.extract("xyz abc random gibberish")
        # Should return empty or very few results
        assert len(result) <= 2

    def test_multiple_symptoms(self, extractor):
        result = extractor.extract("fever with body pain and nausea and dizziness")
        assert len(result) >= 2

    def test_contraction_expansion(self, extractor):
        result = extractor.extract("I can't sleep and I'm feeling very tired")
        # Should detect fatigue or lethargy or insomnia-related symptoms
        assert len(result) >= 1

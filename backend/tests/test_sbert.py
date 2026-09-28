"""
Tests for GramSeva Task 1 SBERT Land-Use Semantic Matching Service.

Covers:
1. Exact matching (case-insensitive)
2. Normalized matching (abbreviation expansion, punctuation, hyphen handling)
3. SBERT semantic matching (threshold 0.40)
4. Human review fallback
5. Single-load verification (model & vocabulary cached once)
6. Engine integration (compare_land_use inside compute_attribute_evidence)
7. FastAPI REST endpoints (/api/ml/match-land-use, /batch, /land-use-info)
"""

import sys
import unittest
from pathlib import Path

# Add backend directory to sys.path
backend_dir = Path(__file__).resolve().parent.parent
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))

from app.ml.sbert_service import (
    _load_model,
    get_load_count,
    is_loaded,
    match_land_use,
    match_land_use_batch,
    model_info,
    compare_land_use,
)
from app.matching.engine import SpatialEntityMatcher
from fastapi.testclient import TestClient
from app.main import app


class TestSbertService(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        """Ensure model and vocabulary are loaded once for all tests."""
        _load_model()

    def test_startup_loading_and_singleton(self):
        """Verify that the model is loaded once and not reloaded on repeated calls."""
        self.assertTrue(is_loaded(), "Model should be marked as loaded.")
        initial_load_count = get_load_count()
        self.assertEqual(initial_load_count, 1, "Load count should be 1 after startup.")

        # Call match_land_use multiple times
        match_land_use("Residential Land")
        match_land_use("Farm Land")
        match_land_use("Commercial")

        # Verify load count is STILL 1 (never reloaded)
        self.assertEqual(
            get_load_count(),
            initial_load_count,
            "Model or vocabulary must NOT be reloaded on repeated requests.",
        )

    def test_model_info(self):
        """Verify model_info returns correct metadata."""
        info = model_info()
        self.assertEqual(info["model_name"], "sentence-transformers/all-MiniLM-L6-v2")
        self.assertEqual(info["embedding_dimension"], 384)
        self.assertEqual(info["production_threshold"], 0.40)
        self.assertEqual(info["vocabulary_count"], 272)
        self.assertTrue(info["is_loaded"])
        self.assertEqual(info["load_count"], 1)

    def test_required_exact_matches(self):
        """Verify the specified EXACT match test cases."""
        # 1. Residential Land -> Residential
        res = match_land_use("Residential Land")
        self.assertEqual(res["source_value"], "Residential Land")
        self.assertEqual(res["canonical_land_use"], "Residential")
        self.assertEqual(res["match_status"], "MATCH")
        self.assertEqual(res["matching_method"], "EXACT")
        self.assertEqual(res["semantic_similarity"], 1.0)

        # 2. Farm Land -> Agricultural
        res = match_land_use("Farm Land")
        self.assertEqual(res["source_value"], "Farm Land")
        self.assertEqual(res["canonical_land_use"], "Agricultural")
        self.assertEqual(res["match_status"], "MATCH")
        self.assertEqual(res["matching_method"], "EXACT")

        # 3. Production unit land -> Industrial
        res = match_land_use("Production unit land")
        self.assertEqual(res["source_value"], "Production unit land")
        self.assertEqual(res["canonical_land_use"], "Industrial")
        self.assertEqual(res["match_status"], "MATCH")
        self.assertEqual(res["matching_method"], "EXACT")

        # 4. Teaching institution property -> Educational
        res = match_land_use("Teaching institution property")
        self.assertEqual(res["source_value"], "Teaching institution property")
        self.assertEqual(res["canonical_land_use"], "Educational")
        self.assertEqual(res["match_status"], "MATCH")
        self.assertEqual(res["matching_method"], "EXACT")

        # 5. Transport and road land -> Transport & Communication
        res = match_land_use("Transport and road land")
        self.assertEqual(res["source_value"], "Transport and road land")
        self.assertEqual(res["canonical_land_use"], "Transport & Communication")
        self.assertEqual(res["match_status"], "MATCH")
        self.assertEqual(res["matching_method"], "EXACT")

    def test_required_normalized_match(self):
        """Verify the specified NORMALIZED match test case: Res. Property -> Residential."""
        res = match_land_use("Res. Property")
        self.assertEqual(res["source_value"], "Res. Property")
        self.assertEqual(res["canonical_land_use"], "Residential")
        self.assertEqual(res["match_status"], "MATCH")
        self.assertEqual(res["matching_method"], "NORMALIZED")
        self.assertEqual(res["semantic_similarity"], 1.0)

    def test_required_sbert_semantic_match(self):
        """Verify the specified SBERT match test case: Circulation area -> Transportation."""
        res = match_land_use("Circulation area")
        self.assertEqual(res["source_value"], "Circulation area")
        self.assertEqual(res["canonical_land_use"], "Transportation")
        self.assertEqual(res["match_status"], "MATCH")
        self.assertEqual(res["matching_method"], "SBERT")
        self.assertGreaterEqual(res["semantic_similarity"], 0.40)

    def test_unknown_land_type_behavior(self):
        """Verify behavior for 'Unknown land type'."""
        res = match_land_use("Unknown land type")
        self.assertEqual(res["source_value"], "Unknown land type")
        self.assertIn(res["match_status"], ["MATCH", "HUMAN_REVIEW"])
        self.assertIn("semantic_similarity", res)
        self.assertIn("matching_method", res)
        # If below 0.40, must be HUMAN_REVIEW and canonical_land_use must be None
        if res["semantic_similarity"] < 0.40:
            self.assertEqual(res["match_status"], "HUMAN_REVIEW")
            self.assertIsNone(res["canonical_land_use"])

    def test_raw_value_preservation(self):
        """Ensure original source value is never modified or overwritten."""
        raw_val = "   Comm.  "
        res = match_land_use(raw_val)
        self.assertEqual(res["source_value"], raw_val.strip())
        self.assertEqual(res["canonical_land_use"], "Commercial")

    def test_batch_matching(self):
        """Test batch land-use matching."""
        queries = ["Farm Land", "Res. Property", "Circulation area"]
        results = match_land_use_batch(queries)
        self.assertEqual(len(results), 3)
        self.assertEqual(results[0]["canonical_land_use"], "Agricultural")
        self.assertEqual(results[1]["canonical_land_use"], "Residential")
        self.assertEqual(results[2]["canonical_land_use"], "Transportation")

    def test_engine_land_use_comparison(self):
        """Verify matching engine uses SBERT to harmonize differently-formatted values."""
        matcher = SpatialEntityMatcher()

        # Compare "Res. Property" and "Residential Land"
        attrs_a = {"land_use": "Res. Property"}
        attrs_b = {"land_use": "Residential Land"}
        score, reasons = matcher.compute_attribute_evidence(attrs_a, attrs_b)

        # Both harmonize to "Residential", so score should be 100.0
        self.assertAlmostEqual(score, 100.0, places=1)
        self.assertTrue(any("Harmonized land use" in r or "Consistent" in r for r in reasons))

        # Test true mismatch
        attrs_c = {"land_use": "Farm Land"}  # Agricultural
        score_mismatch, reasons_mismatch = matcher.compute_attribute_evidence(attrs_a, attrs_c)
        self.assertLess(score_mismatch, 50.0)
        self.assertTrue(any("mismatch" in r.lower() for r in reasons_mismatch))


class TestSbertApi(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.client = TestClient(app)

    def test_get_land_use_info_endpoint(self):
        """Test GET /api/ml/land-use-info."""
        resp = self.client.get("/api/ml/land-use-info")
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertEqual(data["model_name"], "sentence-transformers/all-MiniLM-L6-v2")
        self.assertEqual(data["vocabulary_count"], 272)
        self.assertEqual(data["embedding_dimension"], 384)
        self.assertEqual(data["production_threshold"], 0.40)

    def test_post_match_land_use_endpoint(self):
        """Test POST /api/ml/match-land-use."""
        payload = {"land_use": "Res. Property"}
        resp = self.client.post("/api/ml/match-land-use", json=payload)
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertEqual(data["source_value"], "Res. Property")
        self.assertEqual(data["canonical_land_use"], "Residential")
        self.assertEqual(data["match_status"], "MATCH")
        self.assertEqual(data["matching_method"], "NORMALIZED")
        self.assertEqual(data["semantic_similarity"], 1.0)

    def test_post_match_land_use_batch_endpoint(self):
        """Test POST /api/ml/match-land-use/batch."""
        payload = {
            "land_uses": [
                "Residential Land",
                "Farm Land",
                "Circulation area",
            ]
        }
        resp = self.client.post("/api/ml/match-land-use/batch", json=payload)
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertEqual(data["total"], 3)
        self.assertEqual(data["matched_count"], 3)
        self.assertEqual(data["results"][0]["canonical_land_use"], "Residential")
        self.assertEqual(data["results"][1]["canonical_land_use"], "Agricultural")
        self.assertEqual(data["results"][2]["canonical_land_use"], "Transportation")


if __name__ == "__main__":
    unittest.main()

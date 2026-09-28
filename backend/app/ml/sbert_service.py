"""
GramSeva — SBERT Land-Use Semantic Matching Service (Task 1)
============================================================
Loads sentence-transformers/all-MiniLM-L6-v2 ONCE at application startup
and exposes land-use semantic matching against the project vocabulary
(272 variants mapped to canonical land-use labels).

Pipeline:
    Raw land-use value
            ↓
    1. Exact match (case-insensitive)
            ↓
    2. Normalized match (punctuation, abbreviation, whitespace)
            ↓
    3. SBERT semantic similarity (cosine similarity with cached embeddings)
            ↓
    4. Human review (threshold: 0.40 or ambiguous)

Vocabulary:
    - 272 variants across canonical land-use classes
    - Embeddings precomputed once at startup (272 x 384 matrix)
    - Zero re-encoding of the vocabulary during API requests
"""

import csv
import logging
import os
import re
import threading
from pathlib import Path
from typing import Any, Dict, List, Optional, Set, Tuple

import numpy as np

try:
    import pandas as pd
except ImportError:
    pd = None

logger = logging.getLogger(__name__)

# ── Model & Vocabulary Path Resolution ─────────────────────────────────────
# backend/app/ml/sbert_service.py  →  parents: [ml, app, backend, GramSeva]
_HERE = Path(__file__).resolve().parent
_REPO_ROOT = _HERE.parents[2]

_DEFAULT_SBERT_DIR = _REPO_ROOT / "SBERT_model"
SBERT_DIR = Path(os.getenv("SBERT_MODEL_DIR", str(_DEFAULT_SBERT_DIR)))
MODEL_PATH = SBERT_DIR / "all-MiniLM-L6-v2"
VOCAB_PATH = SBERT_DIR / "land_use_vocabulary_final.csv"

PRODUCTION_THRESHOLD = 0.40

# ── Lazy-loaded Singletons ─────────────────────────────────────────────────
_lock = threading.Lock()
_model: Optional[Any] = None
_vocab_df: Optional[Any] = None
_vocab_rows: List[Dict[str, Any]] = []
_variant_embeddings: Optional[np.ndarray] = None
_raw_map: Dict[str, Set[str]] = {}
_normalized_map: Dict[str, Set[str]] = {}
_loaded: bool = False
_load_count: int = 0


# ── Text Normalization ─────────────────────────────────────────────────────

def normalize_text(text: str) -> str:
    """
    Standard text normalization for land-use terms:
    - Lowercases and strips whitespace
    - Replaces hyphens with spaces (e.g., 'water-supply' -> 'water supply')
    - Removes punctuation while preserving '&' and '/'
    - Handles common abbreviations (e.g. 'resi' -> 'residential', 'comm' -> 'commercial')
    - Collapses multiple whitespace tokens
    """
    if not text:
        return ""
    
    cleaned = str(text).lower().strip()
    # Replace hyphens with spaces
    cleaned = cleaned.replace("-", " ")
    # Replace other punctuation except & and / with spaces
    cleaned = re.sub(r'[^a-z0-9\s&/]', ' ', cleaned)
    
    tokens = cleaned.split()
    expanded_tokens: List[str] = []
    
    for t in tokens:
        if t in ("resi",):
            expanded_tokens.append("residential")
        else:
            expanded_tokens.append(t)
            
    return " ".join(expanded_tokens)


# ── Model & Vocabulary Loader ──────────────────────────────────────────────

def _load_model() -> None:
    """
    Load the SBERT model, project vocabulary, and precompute vocabulary embeddings.
    Thread-safe and guaranteed to execute only once.

    Raises:
        ImportError: If sentence-transformers or torch are not installed.
        FileNotFoundError: If the model directory or vocabulary CSV does not exist.
    """
    global _model, _vocab_df, _variant_embeddings, _raw_map, _normalized_map, _loaded, _load_count

    if _loaded:
        return

    with _lock:
        if _loaded:
            return

        if not SBERT_DIR.exists():
            raise FileNotFoundError(
                f"SBERT directory not found at: {SBERT_DIR}\n"
                "Please ensure SBERT_model exists or set the SBERT_MODEL_DIR environment variable."
            )

        if not MODEL_PATH.exists():
            raise FileNotFoundError(
                f"SBERT model weights directory not found at: {MODEL_PATH}"
            )

        if not VOCAB_PATH.exists():
            raise FileNotFoundError(
                f"Land-use vocabulary CSV not found at: {VOCAB_PATH}"
            )

        try:
            from sentence_transformers import SentenceTransformer
        except ImportError as exc:
            raise ImportError(
                "sentence-transformers dependency is not installed. "
                "Run: pip install sentence-transformers"
            ) from exc

        logger.info("Loading SBERT model from %s ...", MODEL_PATH)
        _model = SentenceTransformer(str(MODEL_PATH))

        logger.info("Loading land-use vocabulary from %s ...", VOCAB_PATH)
        if pd is not None:
            _vocab_df = pd.read_csv(VOCAB_PATH)
            _vocab_rows = _vocab_df.to_dict("records")
        else:
            with open(VOCAB_PATH, "r", encoding="utf-8") as f:
                _vocab_rows = list(csv.DictReader(f))
            _vocab_df = _vocab_rows

        # Build fast lookup maps
        raw_map: Dict[str, Set[str]] = {}
        normalized_map: Dict[str, Set[str]] = {}

        for row in _vocab_rows:
            canonical = str(row["canonical_label"]).strip()
            variant_raw = str(row["variant"]).strip().lower()
            variant_norm = str(row["variant_normalized"]).strip().lower()

            raw_map.setdefault(variant_raw, set()).add(canonical)
            normalized_map.setdefault(variant_norm, set()).add(canonical)

        _raw_map = raw_map
        _normalized_map = normalized_map

        # Precompute vocabulary embeddings ONCE
        logger.info(
            "Precomputing vocabulary embeddings for %d variants ...",
            len(_vocab_rows)
        )
        variants = [str(r["variant"]) for r in _vocab_rows]
        _variant_embeddings = _model.encode(
            variants,
            normalize_embeddings=True,
            show_progress_bar=False,
        )

        _load_count += 1
        _loaded = True
        logger.info(
            "SBERT land-use matcher ready. Loaded %d vocabulary entries with %d-dim embeddings.",
            len(_vocab_rows),
            _variant_embeddings.shape[1],
        )


def is_loaded() -> bool:
    """Return True if the SBERT model and vocabulary are currently loaded in memory."""
    return _loaded


def get_load_count() -> int:
    """Return the number of times the model was loaded (should be 1)."""
    return _load_count


def model_info() -> Dict[str, Any]:
    """Return metadata about the SBERT land-use matching service."""
    return {
        "model_name": "sentence-transformers/all-MiniLM-L6-v2",
        "embedding_dimension": 384,
        "production_threshold": PRODUCTION_THRESHOLD,
        "vocabulary_count": len(_vocab_rows) if _vocab_rows else 272,
        "is_loaded": _loaded,
        "load_count": _load_count,
        "model_path": str(MODEL_PATH),
        "vocab_path": str(VOCAB_PATH),
    }


# ── Core Land-Use Matcher ──────────────────────────────────────────────────

def match_land_use(query: str, threshold: float = PRODUCTION_THRESHOLD) -> Dict[str, Any]:
    """
    Match a raw land-use string against canonical categories using the 4-stage pipeline.

    Stages:
        1. EXACT MATCH (case-insensitive)
        2. NORMALIZED MATCH (punctuation, abbreviation, whitespace)
        3. SBERT SEMANTIC MATCH (cosine similarity against cached embeddings)
        4. HUMAN REVIEW (ambiguous match or similarity < threshold)

    Returns:
        Dict conforming to both the required API contract and legacy keys:
        {
            "source_value": original input,
            "canonical_land_use": canonical label or None,
            "semantic_similarity": float,
            "match_status": "MATCH" | "HUMAN_REVIEW",
            "matching_method": "EXACT" | "NORMALIZED" | "SBERT" | "EXACT_AMBIGUOUS" | "NORMALIZED_AMBIGUOUS",
            "matched_variant": str,
            "candidate_labels": list (if ambiguous)
        }
    """
    _load_model()

    query_str = str(query).strip() if query is not None else ""
    if not query_str:
        return {
            "source_value": query_str,
            "canonical_land_use": None,
            "semantic_similarity": 0.0,
            "match_status": "HUMAN_REVIEW",
            "matching_method": "EMPTY_QUERY",
            "query": query_str,
            "canonical_label": None,
            "matched_variant": "",
            "similarity": 0.0,
            "status": "HUMAN_REVIEW",
            "method": "EMPTY_QUERY",
        }

    query_lower = query_str.lower()
    query_normalized = normalize_text(query_str)

    # 1. EXACT MATCH
    exact_labels = _raw_map.get(query_lower, set())

    if len(exact_labels) == 1:
        canonical = next(iter(exact_labels))
        return {
            "source_value": query_str,
            "canonical_land_use": canonical,
            "semantic_similarity": 1.0,
            "match_status": "MATCH",
            "matching_method": "EXACT",
            "matched_variant": query_str,
            "query": query_str,
            "canonical_label": canonical,
            "similarity": 1.0,
            "status": "MATCH",
            "method": "EXACT",
        }

    if len(exact_labels) > 1:
        candidate_labels = sorted(list(exact_labels))
        return {
            "source_value": query_str,
            "canonical_land_use": None,
            "semantic_similarity": 1.0,
            "match_status": "HUMAN_REVIEW",
            "matching_method": "EXACT_AMBIGUOUS",
            "matched_variant": query_str,
            "candidate_labels": candidate_labels,
            "query": query_str,
            "canonical_label": None,
            "similarity": 1.0,
            "status": "HUMAN_REVIEW",
            "method": "EXACT_AMBIGUOUS",
        }

    # 2. NORMALIZED MATCH
    normalized_labels = _normalized_map.get(query_normalized, set())

    if len(normalized_labels) == 1:
        canonical = next(iter(normalized_labels))
        return {
            "source_value": query_str,
            "canonical_land_use": canonical,
            "semantic_similarity": 1.0,
            "match_status": "MATCH",
            "matching_method": "NORMALIZED",
            "matched_variant": query_normalized,
            "query": query_str,
            "canonical_label": canonical,
            "similarity": 1.0,
            "status": "MATCH",
            "method": "NORMALIZED",
        }

    if len(normalized_labels) > 1:
        candidate_labels = sorted(list(normalized_labels))
        return {
            "source_value": query_str,
            "canonical_land_use": None,
            "semantic_similarity": 1.0,
            "match_status": "HUMAN_REVIEW",
            "matching_method": "NORMALIZED_AMBIGUOUS",
            "matched_variant": query_normalized,
            "candidate_labels": candidate_labels,
            "query": query_str,
            "canonical_label": None,
            "similarity": 1.0,
            "status": "HUMAN_REVIEW",
            "method": "NORMALIZED_AMBIGUOUS",
        }

    # 3. SBERT SEMANTIC MATCH
    query_embedding = _model.encode(
        [query_str],
        normalize_embeddings=True,
        show_progress_bar=False,
    )[0]

    # Cosine similarity via dot product (both vectors are unit-normalized)
    scores = np.dot(_variant_embeddings, query_embedding)

    best_idx = int(np.argmax(scores))
    best_score = float(scores[best_idx])

    best_variant = str(_vocab_rows[best_idx]["variant"])
    best_canonical = str(_vocab_rows[best_idx]["canonical_label"])

    # 4. HUMAN REVIEW (threshold check)
    if best_score >= threshold:
        return {
            "source_value": query_str,
            "canonical_land_use": best_canonical,
            "semantic_similarity": round(best_score, 6),
            "match_status": "MATCH",
            "matching_method": "SBERT",
            "matched_variant": best_variant,
            "query": query_str,
            "canonical_label": best_canonical,
            "similarity": round(best_score, 6),
            "status": "MATCH",
            "method": "SBERT",
        }

    return {
        "source_value": query_str,
        "canonical_land_use": None,
        "semantic_similarity": round(best_score, 6),
        "match_status": "HUMAN_REVIEW",
        "matching_method": "SBERT",
        "matched_variant": best_variant,
        "query": query_str,
        "canonical_label": None,
        "similarity": round(best_score, 6),
        "status": "HUMAN_REVIEW",
        "method": "SBERT",
    }


def match_land_use_batch(
    queries: List[str],
    threshold: float = PRODUCTION_THRESHOLD,
) -> List[Dict[str, Any]]:
    """Match a batch of raw land-use queries."""
    return [match_land_use(q, threshold=threshold) for q in queries]


def compare_land_use(
    land_use_a: Optional[str],
    land_use_b: Optional[str],
    threshold: float = PRODUCTION_THRESHOLD,
) -> Tuple[bool, float, str]:
    """
    Compare two land-use values for the SpatialEntityMatcher in engine.py.

    Returns:
        (is_match: bool, score: float [0.0 - 1.0], reason: str)
    """
    if not land_use_a or not land_use_b:
        return False, 0.0, "Missing land-use value"

    # Fast path: exact lowercase equality
    if land_use_a.strip().lower() == land_use_b.strip().lower():
        return True, 1.0, f"Identical land use: '{land_use_a}'"

    # Match both values to canonical labels
    res_a = match_land_use(land_use_a, threshold=threshold)
    res_b = match_land_use(land_use_b, threshold=threshold)

    canon_a = res_a.get("canonical_land_use")
    canon_b = res_b.get("canonical_land_use")

    # If both resolved to the same canonical label
    if canon_a and canon_b and canon_a == canon_b:
        min_sim = min(res_a.get("semantic_similarity", 1.0), res_b.get("semantic_similarity", 1.0))
        return True, min_sim, f"Harmonized land use: '{canon_a}' (from '{land_use_a}' and '{land_use_b}')"

    # Fallback: compute direct SBERT similarity between the two strings
    try:
        _load_model()
        emb_a = _model.encode([land_use_a], normalize_embeddings=True, show_progress_bar=False)[0]
        emb_b = _model.encode([land_use_b], normalize_embeddings=True, show_progress_bar=False)[0]
        direct_sim = float(np.dot(emb_a, emb_b))

        if direct_sim >= 0.70:
            return True, direct_sim, f"Semantically compatible land use ({direct_sim:.2f}): '{land_use_a}' ~ '{land_use_b}'"
    except Exception as exc:
        logger.debug("Direct embedding comparison failed: %s", exc)

    return False, 0.0, f"Land use mismatch: '{land_use_a}' vs '{land_use_b}'"

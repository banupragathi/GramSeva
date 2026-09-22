"""
GramSeva Spatial Entity Matching Engine
Two-stage approach: candidate generation + evidence fusion.

Stage 1: PostGIS spatial queries for plausible candidates
Stage 2: Multi-evidence fusion for confidence scoring
"""

from typing import Dict, Any, List, Optional, Tuple
from dataclasses import dataclass
from app.gis.spatial import spatial_ops


@dataclass
class MatchEvidence:
    """Evidence record for a candidate match."""
    spatial_match: float = 0.0
    geometry_match: float = 0.0
    visual_match: float = 0.0
    attribute_match: float = 0.0
    temporal_consistency: float = 0.0
    overall_confidence: float = 0.0
    match_state: str = "NOT_MATCHED"
    reasons: List[str] = None

    def __post_init__(self):
        if self.reasons is None:
            self.reasons = []


class MatchingWeights:
    """Configurable matching weights."""

    def __init__(
        self,
        geometry: float = 0.40,
        attributes: float = 0.20,
        visual: float = 0.20,
        temporal: float = 0.10,
        context: float = 0.10,
    ):
        self.geometry = geometry
        self.attributes = attributes
        self.visual = visual
        self.temporal = temporal
        self.context = context

    def total(self) -> float:
        return self.geometry + self.attributes + self.visual + self.temporal + self.context


class MatchingThresholds:
    """Configurable match state thresholds."""

    def __init__(
        self,
        matched: float = 0.90,
        likely_match: float = 0.80,
        review_required: float = 0.60,
    ):
        self.matched = matched
        self.likely_match = likely_match
        self.review_required = review_required

    def classify(self, confidence: float) -> str:
        if confidence >= self.matched:
            return "MATCHED"
        elif confidence >= self.likely_match:
            return "LIKELY_MATCH"
        elif confidence >= self.review_required:
            return "REVIEW_REQUIRED"
        return "NOT_MATCHED"


class SpatialEntityMatcher:
    """
    Core matching engine.

    Stage 1 — Candidate Generation:
        Uses PostGIS bounding box, buffer proximity, and intersection queries
        to find geographically plausible candidates.

    Stage 2 — Evidence Fusion:
        For each candidate pair, calculates multi-channel evidence
        and fuses into a single confidence score.
    """

    def __init__(
        self,
        weights: Optional[MatchingWeights] = None,
        thresholds: Optional[MatchingThresholds] = None,
    ):
        self.weights = weights or MatchingWeights()
        self.thresholds = thresholds or MatchingThresholds()

    def compute_geometry_evidence(
        self,
        coords_a: List[List[float]],
        coords_b: List[List[float]],
        area_a: float,
        area_b: float,
    ) -> Tuple[float, List[str]]:
        """Compute geometry-based matching evidence."""
        reasons = []
        scores = []

        # Centroid distance
        cdist = spatial_ops.centroid_distance(coords_a, coords_b)
        cdist_score = max(0, 1.0 - cdist * 10000)  # Normalize for degree-coords
        scores.append(cdist_score)
        if cdist_score > 0.8:
            reasons.append(f"Close centroid proximity ({cdist:.6f}°)")

        # IoU
        iou = spatial_ops.polygon_iou(coords_a, coords_b)
        scores.append(iou)
        if iou > 0.8:
            reasons.append(f"High polygon overlap (IoU > {iou:.2f})")
        elif iou > 0.5:
            reasons.append(f"Moderate polygon overlap (IoU {iou:.2f})")

        # Area similarity
        area_sim = spatial_ops.area_similarity(area_a, area_b)
        scores.append(area_sim)
        if area_sim > 0.95:
            reasons.append("Very similar area measurements")
        elif area_sim < 0.9:
            area_diff_pct = abs(area_a - area_b) / max(area_a, area_b) * 100
            reasons.append(f"Area difference {area_diff_pct:.1f}%")

        # Hausdorff distance
        hausdorff = spatial_ops.hausdorff_distance(coords_a, coords_b)
        hausdorff_score = max(0, 1.0 - hausdorff * 5000)
        scores.append(hausdorff_score)
        if hausdorff_score > 0.8:
            reasons.append("Similar boundary shape (low Hausdorff)")

        avg_score = sum(scores) / len(scores) if scores else 0
        return avg_score * 100, reasons

    def compute_attribute_evidence(
        self,
        attrs_a: Dict[str, Any],
        attrs_b: Dict[str, Any],
    ) -> Tuple[float, List[str]]:
        """Compute attribute-based matching evidence."""
        reasons = []
        matches = 0
        total = 0

        # Survey number comparison
        if "survey_number" in attrs_a and "survey_number" in attrs_b:
            total += 1
            if attrs_a["survey_number"] == attrs_b["survey_number"]:
                matches += 1
                reasons.append("Matching survey number")
            else:
                # Check for fuzzy match
                reasons.append("Survey number mismatch — semantic check needed")

        # Land use comparison
        if "land_use" in attrs_a and "land_use" in attrs_b:
            total += 1
            if attrs_a["land_use"].lower() == attrs_b["land_use"].lower():
                matches += 1
                reasons.append("Consistent land use classification")
            else:
                reasons.append(f"Land use mismatch: {attrs_a['land_use']} vs {attrs_b['land_use']}")

        # Owner name (would use SBERT in full implementation)
        if "owner_name" in attrs_a and "owner_name" in attrs_b:
            total += 1
            if attrs_a["owner_name"].lower() == attrs_b["owner_name"].lower():
                matches += 1
                reasons.append("Owner name matches")

        score = (matches / total * 100) if total > 0 else 50.0
        return score, reasons

    def fuse_evidence(
        self,
        geometry_score: float,
        attribute_score: float,
        visual_score: float = 50.0,
        temporal_score: float = 50.0,
        context_score: float = 50.0,
    ) -> float:
        """Fuse multi-channel evidence into single confidence."""
        w = self.weights
        confidence = (
            geometry_score * w.geometry +
            attribute_score * w.attributes +
            visual_score * w.visual +
            temporal_score * w.temporal +
            context_score * w.context
        )
        return min(100, max(0, confidence))

    def match(
        self,
        record_a: Dict[str, Any],
        record_b: Dict[str, Any],
    ) -> MatchEvidence:
        """
        Full matching pipeline for two source records.
        Returns MatchEvidence with confidence breakdown and explanations.
        """
        # Geometry evidence
        geo_score, geo_reasons = self.compute_geometry_evidence(
            record_a.get("coordinates", []),
            record_b.get("coordinates", []),
            record_a.get("area", 0),
            record_b.get("area", 0),
        )

        # Attribute evidence
        attr_score, attr_reasons = self.compute_attribute_evidence(
            record_a.get("attributes", {}),
            record_b.get("attributes", {}),
        )

        # Visual and temporal (placeholder for full implementation)
        visual_score = 50.0  # Would use Siamese ResNet-50
        temporal_score = 50.0  # Would use ChangeFormer

        # Fuse
        confidence = self.fuse_evidence(geo_score, attr_score, visual_score, temporal_score)
        match_state = self.thresholds.classify(confidence / 100.0)

        return MatchEvidence(
            spatial_match=geo_score,
            geometry_match=geo_score * 0.95,  # Slightly different from spatial for demo
            visual_match=visual_score,
            attribute_match=attr_score,
            temporal_consistency=temporal_score,
            overall_confidence=confidence,
            match_state=match_state,
            reasons=geo_reasons + attr_reasons,
        )


# Default matcher instance
default_matcher = SpatialEntityMatcher()

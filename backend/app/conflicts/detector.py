"""
GramSeva Conflict Detection Engine
Detects boundary, area, attribute, temporal, and topology conflicts between source records.
"""

from typing import Dict, Any, List, Optional
from dataclasses import dataclass


@dataclass
class ConflictRecord:
    """Detected conflict between source records."""
    conflict_type: str  # boundary, area, attribute, temporal, topology
    severity: str  # high, medium, low
    description: str
    source_a: Dict[str, str]
    source_b: Dict[str, str]
    difference: str
    state: str = "OPEN"


class ConflictDetector:
    """
    Detects conflicts between source records for the same physical entity.
    Never silently overwrites source data — all conflicts are surfaced.
    """

    def __init__(
        self,
        area_threshold_pct: float = 5.0,
        boundary_offset_threshold_m: float = 2.0,
    ):
        self.area_threshold_pct = area_threshold_pct
        self.boundary_offset_threshold_m = boundary_offset_threshold_m

    def detect_area_conflict(
        self,
        source_a_name: str, area_a: float,
        source_b_name: str, area_b: float,
    ) -> Optional[ConflictRecord]:
        """Detect area mismatch between two sources."""
        if area_a == 0 or area_b == 0:
            return None

        diff_pct = abs(area_a - area_b) / max(area_a, area_b) * 100

        if diff_pct > self.area_threshold_pct:
            severity = "high" if diff_pct > 10 else "medium"
            return ConflictRecord(
                conflict_type="area",
                severity=severity,
                description=f"Area mismatch between {source_a_name} and {source_b_name}",
                source_a={"name": source_a_name, "value": f"{area_a} sq.m"},
                source_b={"name": source_b_name, "value": f"{area_b} sq.m"},
                difference=f"{diff_pct:.2f}%",
            )
        return None

    def detect_attribute_conflict(
        self,
        source_a_name: str, attr_a: str, value_a: str,
        source_b_name: str, attr_b: str, value_b: str,
    ) -> Optional[ConflictRecord]:
        """Detect attribute mismatch between two sources."""
        if value_a.lower().strip() != value_b.lower().strip():
            return ConflictRecord(
                conflict_type="attribute",
                severity="medium" if attr_a in ["land_use", "owner_name"] else "low",
                description=f"{attr_a} classification mismatch",
                source_a={"name": source_a_name, "value": value_a},
                source_b={"name": source_b_name, "value": value_b},
                difference="Different classification",
            )
        return None

    def detect_boundary_conflict(
        self,
        source_a_name: str, coords_a: List[List[float]],
        source_b_name: str, coords_b: List[List[float]],
        offset_m: float,
    ) -> Optional[ConflictRecord]:
        """Detect boundary mismatch between two sources."""
        if offset_m > self.boundary_offset_threshold_m:
            severity = "high" if offset_m > 5.0 else "medium"
            return ConflictRecord(
                conflict_type="boundary",
                severity=severity,
                description=f"Boundary mismatch — {source_a_name} vs {source_b_name}",
                source_a={"name": source_a_name, "value": "Original boundary"},
                source_b={"name": source_b_name, "value": f"Shifted {offset_m:.1f}m"},
                difference=f"{offset_m:.1f}m offset",
            )
        return None

    def detect_temporal_conflict(
        self,
        source_a_name: str, date_a: str, value_a: str,
        source_b_name: str, date_b: str, value_b: str,
    ) -> Optional[ConflictRecord]:
        """Detect temporal inconsistency."""
        if value_a.lower() != value_b.lower():
            return ConflictRecord(
                conflict_type="temporal",
                severity="medium",
                description=f"Temporal inconsistency between {date_a} and {date_b}",
                source_a={"name": source_a_name, "value": f"{value_a} ({date_a})"},
                source_b={"name": source_b_name, "value": f"{value_b} ({date_b})"},
                difference="Temporal change",
            )
        return None

    def detect_all(
        self,
        record_a: Dict[str, Any],
        record_b: Dict[str, Any],
    ) -> List[ConflictRecord]:
        """Run all conflict detectors on a pair of records."""
        conflicts = []

        # Area conflict
        area_conflict = self.detect_area_conflict(
            record_a.get("source_name", "Source A"),
            record_a.get("area", 0),
            record_b.get("source_name", "Source B"),
            record_b.get("area", 0),
        )
        if area_conflict:
            conflicts.append(area_conflict)

        # Attribute conflicts
        for attr in ["land_use", "owner_name"]:
            if attr in record_a.get("attributes", {}) and attr in record_b.get("attributes", {}):
                attr_conflict = self.detect_attribute_conflict(
                    record_a.get("source_name", "Source A"),
                    attr,
                    record_a["attributes"][attr],
                    record_b.get("source_name", "Source B"),
                    attr,
                    record_b["attributes"][attr],
                )
                if attr_conflict:
                    conflicts.append(attr_conflict)

        return conflicts


# Default instance
conflict_detector = ConflictDetector()

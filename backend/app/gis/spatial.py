"""
GramSeva GIS Service — CRS transformation, geometry validation, and spatial operations.
Uses PyProj, Shapely, and GeoPandas for deterministic spatial processing.
"""

from typing import Optional, Dict, Any, List, Tuple
import json
import math


class CRSService:
    """CRS detection and transformation using PyProj."""

    COMMON_CRS = {
        "EPSG:4326": "WGS 84 — Geographic",
        "EPSG:32643": "WGS 84 / UTM zone 43N",
        "EPSG:32644": "WGS 84 / UTM zone 44N",
        "EPSG:32645": "WGS 84 / UTM zone 45N",
        "EPSG:32646": "WGS 84 / UTM zone 46N",
        "EPSG:3857": "Web Mercator",
    }

    TARGET_CRS = "EPSG:4326"

    def detect_crs(self, metadata: Dict[str, Any]) -> Optional[str]:
        """Detect CRS from dataset metadata."""
        if "crs" in metadata:
            return metadata["crs"]
        if "epsg" in metadata:
            return f"EPSG:{metadata['epsg']}"
        return None

    def transform_coordinates(
        self,
        coords: List[Tuple[float, float]],
        source_crs: str,
        target_crs: str = "EPSG:4326"
    ) -> List[Tuple[float, float]]:
        """
        Transform coordinates from source CRS to target CRS.
        In production, this uses pyproj.Transformer.
        """
        try:
            from pyproj import Transformer
            transformer = Transformer.from_crs(source_crs, target_crs, always_xy=True)
            return [transformer.transform(x, y) for x, y in coords]
        except ImportError:
            # Fallback: return as-is if pyproj not available
            return coords

    def get_transformation_info(self, source_crs: str, target_crs: str) -> Dict[str, Any]:
        return {
            "source_crs": source_crs,
            "target_crs": target_crs,
            "source_description": self.COMMON_CRS.get(source_crs, "Unknown"),
            "target_description": self.COMMON_CRS.get(target_crs, "WGS 84"),
        }


class GeometryValidator:
    """Geometry validation using Shapely."""

    def validate_polygon(self, coords: List[List[float]]) -> Dict[str, Any]:
        """Validate a polygon geometry."""
        issues = []
        is_valid = True

        # Basic checks
        if len(coords) < 4:
            issues.append("Polygon has fewer than 4 coordinates (not closed)")
            is_valid = False

        if coords and coords[0] != coords[-1]:
            issues.append("Polygon is not closed")

        # Check for self-intersection using Shapely if available
        try:
            from shapely.geometry import Polygon
            from shapely.validation import explain_validity

            poly = Polygon(coords)
            if not poly.is_valid:
                reason = explain_validity(poly)
                issues.append(f"Invalid geometry: {reason}")
                is_valid = False

            if poly.is_empty:
                issues.append("Empty geometry")
                is_valid = False

            area = poly.area
        except ImportError:
            area = self._simple_area(coords)

        return {
            "is_valid": is_valid,
            "issues": issues,
            "area": area,
            "can_repair": len(issues) <= 1,
        }

    def repair_polygon(self, coords: List[List[float]]) -> List[List[float]]:
        """Attempt to repair a polygon geometry."""
        try:
            from shapely.geometry import Polygon
            from shapely.validation import make_valid

            poly = Polygon(coords)
            if not poly.is_valid:
                repaired = make_valid(poly)
                if repaired.geom_type == "Polygon":
                    return list(repaired.exterior.coords)
            return coords
        except ImportError:
            return coords

    def _simple_area(self, coords: List[List[float]]) -> float:
        """Shoelace formula for area calculation."""
        n = len(coords)
        if n < 3:
            return 0.0
        area = 0.0
        for i in range(n):
            j = (i + 1) % n
            area += coords[i][0] * coords[j][1]
            area -= coords[j][0] * coords[i][1]
        return abs(area) / 2.0


class SpatialOperations:
    """Spatial operations for entity matching."""

    def centroid_distance(self, coords_a: List[List[float]], coords_b: List[List[float]]) -> float:
        """Calculate distance between centroids of two polygons."""
        ca = self._centroid(coords_a)
        cb = self._centroid(coords_b)
        return math.sqrt((ca[0] - cb[0])**2 + (ca[1] - cb[1])**2)

    def polygon_iou(self, coords_a: List[List[float]], coords_b: List[List[float]]) -> float:
        """Calculate Intersection over Union for two polygons."""
        try:
            from shapely.geometry import Polygon
            pa = Polygon(coords_a)
            pb = Polygon(coords_b)
            if not pa.is_valid or not pb.is_valid:
                return 0.0
            intersection = pa.intersection(pb).area
            union = pa.union(pb).area
            return intersection / union if union > 0 else 0.0
        except ImportError:
            return 0.0

    def area_similarity(self, area_a: float, area_b: float) -> float:
        """Calculate area similarity (0-1)."""
        if area_a == 0 and area_b == 0:
            return 1.0
        max_area = max(area_a, area_b)
        if max_area == 0:
            return 0.0
        return 1.0 - abs(area_a - area_b) / max_area

    def hausdorff_distance(self, coords_a: List[List[float]], coords_b: List[List[float]]) -> float:
        """Calculate Hausdorff distance between two polygons."""
        try:
            from shapely.geometry import Polygon
            pa = Polygon(coords_a)
            pb = Polygon(coords_b)
            return pa.hausdorff_distance(pb)
        except ImportError:
            return self.centroid_distance(coords_a, coords_b) * 2

    def _centroid(self, coords: List[List[float]]) -> Tuple[float, float]:
        """Calculate simple centroid."""
        n = len(coords)
        if n == 0:
            return (0.0, 0.0)
        cx = sum(c[0] for c in coords) / n
        cy = sum(c[1] for c in coords) / n
        return (cx, cy)


# Singleton instances
crs_service = CRSService()
geometry_validator = GeometryValidator()
spatial_ops = SpatialOperations()

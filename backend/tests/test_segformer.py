"""
Tests for GramSeva SegFormer-B2 building segmentation service.

Run with:
    cd backend
    pytest tests/test_segformer.py -v

Test classes
------------
TestSegformerUnit
    Pure-unit tests using mocks.  No GPU, no model files required.
    Always run in CI.

TestSegformerIntegration
    End-to-end tests against the real model checkpoint.
    Skipped automatically when:
      - torch / transformers are not installed, OR
      - the model directory is missing.
"""

import json
import os
import tempfile
import unittest
from pathlib import Path
from typing import Any, Dict
from unittest.mock import MagicMock, patch

import numpy as np

try:
    import pytest
except ImportError:
    pytest = None


def _skip(reason: str):
    if pytest is not None:
        pytest.skip(reason)
    else:
        raise unittest.SkipTest(reason)


# ── helpers ───────────────────────────────────────────────────────────────


def _make_synthetic_geotiff(tmp_path: Path, has_buildings: bool = True) -> str:
    """
    Write a tiny synthetic GeoTIFF (64×64 px, RGB, EPSG:4326) to tmp_path.
    If has_buildings=True, a bright rectangle is drawn that the mock model
    can 'detect' as a building.
    """
    try:
        import rasterio
        from rasterio.transform import from_bounds
    except ImportError:
        _skip("rasterio not installed")

    width, height = 64, 64
    data = np.zeros((3, height, width), dtype=np.uint8)

    if has_buildings:
        # Draw a bright 16×16 rectangle in the centre (simulates a rooftop)
        r0, r1 = 24, 40
        c0, c1 = 24, 40
        data[:, r0:r1, c0:c1] = 200

    transform = from_bounds(
        west=2.26, south=49.008, east=2.27, north=49.010,
        width=width, height=height,
    )

    tiff_path = str(tmp_path / "synthetic_test.tif")
    with rasterio.open(
        tiff_path,
        "w",
        driver="GTiff",
        height=height,
        width=width,
        count=3,
        dtype=np.uint8,
        crs="EPSG:4326",
        transform=transform,
    ) as dst:
        dst.write(data)

    return tiff_path


def _make_mock_model_outputs(h: int, w: int):
    """Return a torch tensor that mimics SegFormer logits with a building patch."""
    try:
        import torch
    except ImportError:
        _skip("torch not installed")

    # Shape: (1, 2, H/4, W/4)
    logits = torch.zeros(1, 2, h // 4, w // 4)
    # Make class-1 (building) win in the centre quarter
    q0, q1 = h // 16, 3 * h // 16
    logits[0, 1, q0:q1, q0:q1] = 10.0   # strong building signal
    logits[0, 0] = 1.0                   # weak background everywhere
    return MagicMock(logits=logits)


# ═══════════════════════════════════════════════════════════════════════════
# Unit tests (no model / no GPU required)
# ═══════════════════════════════════════════════════════════════════════════


class TestSegformerUnit(unittest.TestCase):
    """Unit tests that mock all heavy dependencies."""

    # ── model_info ─────────────────────────────────────────────────────────

    def test_model_info_structure(self):
        """model_info() returns the expected keys whether loaded or not."""
        from app.ml.segformer_service import model_info

        info = model_info()
        assert isinstance(info, dict)
        for key in ("architecture", "model_path", "classes", "validation_metrics", "loaded"):
            assert key in info, f"Missing key: {key}"
        assert info["architecture"] == "SegFormer-B2"
        assert info["classes"]["1"] == "building"
        assert info["output_crs"] == "EPSG:4326"

    def test_model_info_metrics_in_range(self):
        """Validation metrics are within plausible [0, 1] range."""
        from app.ml.segformer_service import model_info

        metrics = model_info()["validation_metrics"]
        for metric_name, value in metrics.items():
            assert 0.0 <= value <= 1.0, f"{metric_name} = {value} out of range"

    def test_is_loaded_before_load(self):
        """is_loaded() should return False before _load_model() is called."""
        from app.ml import segformer_service

        # Reset to unloaded state for test isolation
        segformer_service._loaded = False
        segformer_service._model = None
        segformer_service._processor = None

        assert segformer_service.is_loaded() is False

    # ── _normalise_to_uint8 ────────────────────────────────────────────────

    def test_normalise_uint8_passthrough(self):
        """uint8 data should come through unchanged after normalisation."""
        from app.ml.segformer_service import _normalise_to_uint8

        data = np.array([[[0, 128, 255]]], dtype=np.uint8)  # (1, 1, 3)
        result = _normalise_to_uint8(data)
        assert result.dtype == np.uint8
        assert result[0, 0, 2] == 255

    def test_normalise_uint16(self):
        """uint16 data should be scaled to 0–255 uint8."""
        from app.ml.segformer_service import _normalise_to_uint8

        data = np.array([[[0, 32768, 65535]]], dtype=np.uint16)
        result = _normalise_to_uint8(data)
        assert result.dtype == np.uint8
        assert result[0, 0, 0] == 0
        assert result[0, 0, 2] == 255

    def test_normalise_constant_band(self):
        """A completely uniform band should not cause divide-by-zero."""
        from app.ml.segformer_service import _normalise_to_uint8

        data = np.full((1, 4, 4), 5000, dtype=np.uint16)
        result = _normalise_to_uint8(data)
        assert result.dtype == np.uint8

    # ── _ensure_rgb ────────────────────────────────────────────────────────

    def test_ensure_rgb_from_single_band(self):
        """Single-band (grayscale) input should become 3-band."""
        from app.ml.segformer_service import _ensure_rgb

        data = np.zeros((1, 10, 10), dtype=np.uint8)
        result = _ensure_rgb(data)
        assert result.shape[0] == 3

    def test_ensure_rgb_from_two_bands(self):
        """Two-band input should become 3-band."""
        from app.ml.segformer_service import _ensure_rgb

        data = np.zeros((2, 10, 10), dtype=np.uint8)
        result = _ensure_rgb(data)
        assert result.shape[0] == 3

    def test_ensure_rgb_from_four_bands(self):
        """RGBA (4-band) should be trimmed to 3 bands."""
        from app.ml.segformer_service import _ensure_rgb

        data = np.zeros((4, 10, 10), dtype=np.uint8)
        result = _ensure_rgb(data)
        assert result.shape[0] == 3

    # ── segment_geotiff (mocked) ───────────────────────────────────────────

    def test_segment_geotiff_returns_geojson_structure(self, tmp_path=None):
        """
        Mocked inference: segment_geotiff() on a synthetic GeoTIFF should
        return a valid GeoJSON FeatureCollection with the required properties.
        """
        if tmp_path is None:
            tmp_path = Path(tempfile.mkdtemp())

        try:
            import torch
        except ImportError:
            _skip("torch not installed")

        tiff_path = _make_synthetic_geotiff(tmp_path, has_buildings=True)

        with patch("app.ml.segformer_service._load_model"), \
             patch("app.ml.segformer_service._loaded", True), \
             patch("app.ml.segformer_service._model") as mock_model, \
             patch("app.ml.segformer_service._processor") as mock_proc, \
             patch("app.ml.segformer_service._device", torch.device("cpu")):

            # The processor returns a dict with 'pixel_values'
            mock_proc.return_value = {
                "pixel_values": torch.zeros(1, 3, 64, 64)
            }
            # The model returns logits that predict a building patch
            mock_model.return_value = _make_mock_model_outputs(64, 64)

            from app.ml.segformer_service import segment_geotiff
            result = segment_geotiff(
                file_path=tiff_path,
                source_image_name="test_img",
                min_building_area_m2=0.0,   # keep everything for the test
            )

        # ── structural checks ──────────────────────────────────────────────
        assert result["type"] == "FeatureCollection"
        assert "features" in result
        assert isinstance(result["features"], list)

        # ── CRS check ─────────────────────────────────────────────────────
        crs_name = result.get("crs", {}).get("properties", {}).get("name", "")
        assert "CRS84" in crs_name or "4326" in crs_name

    def test_segment_geotiff_feature_properties(self, tmp_path=None):
        """Each GeoJSON feature must have the four required properties."""
        if tmp_path is None:
            tmp_path = Path(tempfile.mkdtemp())

        try:
            import torch
        except ImportError:
            _skip("torch not installed")

        tiff_path = _make_synthetic_geotiff(tmp_path, has_buildings=True)

        with patch("app.ml.segformer_service._load_model"), \
             patch("app.ml.segformer_service._loaded", True), \
             patch("app.ml.segformer_service._model") as mock_model, \
             patch("app.ml.segformer_service._processor") as mock_proc, \
             patch("app.ml.segformer_service._device", torch.device("cpu")):

            mock_proc.return_value = {"pixel_values": torch.zeros(1, 3, 64, 64)}
            mock_model.return_value = _make_mock_model_outputs(64, 64)

            from app.ml.segformer_service import segment_geotiff
            result = segment_geotiff(
                file_path=tiff_path,
                source_image_name="feat_check",
                min_building_area_m2=0.0,
            )

        required_props = {"source_image", "model", "task", "area_m2"}
        for feature in result["features"]:
            assert feature["type"] == "Feature"
            missing = required_props - set(feature["properties"].keys())
            assert not missing, f"Feature missing properties: {missing}"
            assert feature["properties"]["model"] == "SegFormer-B2"
            assert feature["properties"]["task"] == "building_segmentation"
            assert feature["properties"]["area_m2"] >= 0.0
            assert "geometry" in feature
            assert feature["geometry"]["type"] in ("Polygon", "MultiPolygon")

    def test_segment_geotiff_empty_result_on_no_buildings(self, tmp_path=None):
        """
        When the model predicts all-background, features list should be empty.
        """
        if tmp_path is None:
            tmp_path = Path(tempfile.mkdtemp())

        try:
            import torch
        except ImportError:
            _skip("torch not installed")

        tiff_path = _make_synthetic_geotiff(tmp_path, has_buildings=False)

        # All-background logits: class 0 wins everywhere
        all_background_logits = MagicMock(
            logits=torch.zeros(1, 2, 16, 16)   # class 0 = 0, class 1 = 0 → argmax=0
        )
        # Force class-0 to win
        bg = all_background_logits.logits
        bg[0, 0] = 10.0   # background dominates

        with patch("app.ml.segformer_service._load_model"), \
             patch("app.ml.segformer_service._loaded", True), \
             patch("app.ml.segformer_service._model") as mock_model, \
             patch("app.ml.segformer_service._processor") as mock_proc, \
             patch("app.ml.segformer_service._device", torch.device("cpu")):

            mock_proc.return_value = {"pixel_values": torch.zeros(1, 3, 64, 64)}
            mock_model.return_value = all_background_logits

            from app.ml.segformer_service import segment_geotiff
            result = segment_geotiff(
                file_path=tiff_path,
                source_image_name="empty",
                min_building_area_m2=0.0,
            )

        assert result["type"] == "FeatureCollection"
        assert result["features"] == []

    def test_min_area_filter_removes_small_polygons(self, tmp_path=None):
        """
        With a high min_building_area_m2, small predicted polygons are dropped.
        """
        if tmp_path is None:
            tmp_path = Path(tempfile.mkdtemp())

        try:
            import torch
        except ImportError:
            _skip("torch not installed")

        tiff_path = _make_synthetic_geotiff(tmp_path, has_buildings=True)

        with patch("app.ml.segformer_service._load_model"), \
             patch("app.ml.segformer_service._loaded", True), \
             patch("app.ml.segformer_service._model") as mock_model, \
             patch("app.ml.segformer_service._processor") as mock_proc, \
             patch("app.ml.segformer_service._device", torch.device("cpu")):

            mock_proc.return_value = {"pixel_values": torch.zeros(1, 3, 64, 64)}
            mock_model.return_value = _make_mock_model_outputs(64, 64)

            from app.ml.segformer_service import segment_geotiff

            # No filter — might have features
            result_no_filter = segment_geotiff(
                file_path=tiff_path, source_image_name="x", min_building_area_m2=0.0
            )
            # Extreme filter — all features removed
            result_filtered = segment_geotiff(
                file_path=tiff_path, source_image_name="x", min_building_area_m2=1e12
            )

        assert result_filtered["features"] == []
        # No-filter should have >= filtered count
        assert len(result_no_filter["features"]) >= len(result_filtered["features"])

    # ── _build_geojson ─────────────────────────────────────────────────────

    def test_build_geojson_wraps_features(self):
        """_build_geojson wraps the feature list into a FeatureCollection."""
        from app.ml.segformer_service import _build_geojson

        features = [
            {
                "type": "Feature",
                "properties": {"source_image": "x", "model": "SegFormer-B2",
                                "task": "building_segmentation", "area_m2": 50.0},
                "geometry": {"type": "Polygon", "coordinates": [[]]},
            }
        ]
        result = _build_geojson(features, name="test", min_building_area_m2=0.0)
        assert result["type"] == "FeatureCollection"
        assert len(result["features"]) == 1
        assert "predicted_buildings" in result["name"]

    def test_build_geojson_area_filter(self):
        """_build_geojson discards features below min_building_area_m2."""
        from app.ml.segformer_service import _build_geojson

        def _feat(area):
            return {
                "type": "Feature",
                "properties": {"source_image": "x", "model": "SegFormer-B2",
                                "task": "building_segmentation", "area_m2": area},
                "geometry": {"type": "Polygon", "coordinates": [[]]},
            }

        features = [_feat(3.0), _feat(10.0), _feat(200.0)]
        result = _build_geojson(features, name="t", min_building_area_m2=5.0)
        assert len(result["features"]) == 2
        for f in result["features"]:
            assert f["properties"]["area_m2"] >= 5.0


# ═══════════════════════════════════════════════════════════════════════════
# Integration tests (real model, skipped if unavailable)
# ═══════════════════════════════════════════════════════════════════════════

# Detect whether torch + transformers are installed
_torch_available = False
try:
    import torch           # noqa: F401
    import transformers    # noqa: F401
    _torch_available = True
except ImportError:
    pass

# Detect whether the model checkpoint exists
_HERE = Path(__file__).resolve().parent.parent   # → backend/
_MODEL_PATH = (
    _HERE.parent
    / "SIH26013_Task2_SegFormer"
    / "SIH26013_Task2_SegFormer"
    / "segformer_b2_building_final"
)
_model_available = _torch_available and _MODEL_PATH.exists()

_skip_reason = (
    "Integration test skipped: "
    + (
        "model checkpoint not found at "
        + str(_MODEL_PATH)
        if _torch_available
        else "torch / transformers not installed"
    )
)


@unittest.skipIf(not _model_available, _skip_reason)
class TestSegformerIntegration(unittest.TestCase):
    """End-to-end tests that load the real SegFormer-B2 checkpoint."""

    def test_model_loads_without_error(self):
        """_load_model() should not raise and is_loaded() should return True."""
        from app.ml.segformer_service import _load_model, is_loaded
        _load_model()
        assert is_loaded() is True

    def test_real_geotiff_inference(self, tmp_path=None):
        """
        Run real inference on a synthetic GeoTIFF and verify the output is a
        valid GeoJSON FeatureCollection in EPSG:4326.
        """
        if tmp_path is None:
            tmp_path = Path(tempfile.mkdtemp())

        tiff_path = _make_synthetic_geotiff(tmp_path, has_buildings=True)

        from app.ml.segformer_service import segment_geotiff
        result = segment_geotiff(
            file_path=tiff_path,
            source_image_name="integration_test",
            min_building_area_m2=0.0,
        )

        assert result["type"] == "FeatureCollection"
        crs_name = result.get("crs", {}).get("properties", {}).get("name", "")
        assert "CRS84" in crs_name or "4326" in crs_name

        for feature in result["features"]:
            props = feature["properties"]
            assert props["source_image"] == "integration_test"
            assert props["model"] == "SegFormer-B2"
            assert props["task"] == "building_segmentation"
            assert props["area_m2"] >= 0.0
            assert feature["geometry"]["type"] in ("Polygon", "MultiPolygon")

    def test_model_info_shows_loaded(self):
        """model_info() should report loaded=True after _load_model()."""
        from app.ml.segformer_service import _load_model, model_info
        _load_model()
        info = model_info()
        assert info["loaded"] is True
        assert info["device"] in ("cpu", "cuda", "cuda:0", "mps")

    def test_sample_validation_geojson_is_valid(self):
        """
        Spot-check one of the 122 validation GeoJSON outputs shipped with the
        model to confirm they parse correctly and have the required properties.
        """
        geojson_dir = (
            _HERE.parent
            / "SIH26013_Task2_SegFormer"
            / "SIH26013_Task2_SegFormer"
            / "validation_geojson"
        )
        if not geojson_dir.exists():
            _skip("validation_geojson directory not found")

        sample = sorted(geojson_dir.glob("*.geojson"))[0]
        with open(sample) as f:
            data = json.load(f)

        assert data["type"] == "FeatureCollection"
        assert len(data["features"]) > 0

        feature = data["features"][0]
        props = feature["properties"]
        for key in ("source_image", "model", "task", "area_m2"):
            assert key in props, f"Missing property: {key}"
        assert props["model"] == "SegFormer-B2"
        assert props["task"] == "building_segmentation"
        assert isinstance(props["area_m2"], (int, float))


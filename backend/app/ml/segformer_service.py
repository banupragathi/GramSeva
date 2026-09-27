"""
GramSeva — SegFormer-B2 Building Segmentation Inference Service
================================================================
Loads the pre-trained SegFormer-B2 model ONCE (at startup or on first call)
and exposes two public functions:

    segment_geotiff(file_path, ...)  →  GeoJSON FeatureCollection dict
    segment_pil_image(pil_img, ...)  →  GeoJSON FeatureCollection dict

Both functions return building polygons with:
    source_image, model, task, area_m2, geometry (EPSG:4326)

Model path is resolved from the SEGFORMER_MODEL_PATH env variable; the
default points to the existing repo artifact:
    ../../SIH26013_Task2_SegFormer/SIH26013_Task2_SegFormer/segformer_b2_building_final/

This file does NOT touch any existing GIS or API code.
"""

import logging
import os
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple

import numpy as np

logger = logging.getLogger(__name__)

# ── Model path resolution ──────────────────────────────────────────────────
# backend/app/ml/segformer_service.py  →  parents: [ml, app, backend, GramSeva]
_HERE = Path(__file__).resolve().parent          # .../backend/app/ml
_REPO_ROOT = _HERE.parents[2]                    # .../GramSeva/

_DEFAULT_MODEL_PATH = (
    _REPO_ROOT
    / "SIH26013_Task2_SegFormer"
    / "SIH26013_Task2_SegFormer"
    / "segformer_b2_building_final"
)

MODEL_PATH = Path(
    os.getenv("SEGFORMER_MODEL_PATH", str(_DEFAULT_MODEL_PATH))
)

# ── Lazy-loaded singletons ─────────────────────────────────────────────────
_processor = None
_model = None
_device = None
_loaded = False


# ── Model loading ──────────────────────────────────────────────────────────

def _load_model() -> None:
    """
    Load the SegFormer model and image processor into module-level singletons.
    Safe to call multiple times — only loads once.

    Raises:
        ImportError  – if torch / transformers are not installed.
        FileNotFoundError – if the model directory does not exist.
    """
    global _processor, _model, _device, _loaded

    if _loaded:
        return

    try:
        import torch
        from transformers import (
            SegformerForSemanticSegmentation,
            SegformerImageProcessor,
        )
    except ImportError as exc:
        raise ImportError(
            "ML dependencies are not installed. "
            "Run: pip install torch transformers"
        ) from exc

    if not MODEL_PATH.exists():
        raise FileNotFoundError(
            f"SegFormer model directory not found: {MODEL_PATH}\n"
            "Set the SEGFORMER_MODEL_PATH environment variable to the correct path."
        )

    logger.info("Loading SegFormer-B2 from %s …", MODEL_PATH)

    _processor = SegformerImageProcessor.from_pretrained(str(MODEL_PATH))

    _model = SegformerForSemanticSegmentation.from_pretrained(str(MODEL_PATH))
    _device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    _model = _model.to(_device)
    _model.eval()

    _loaded = True
    logger.info("SegFormer-B2 ready on device=%s", _device)


def is_loaded() -> bool:
    """Return True if the model is currently loaded in memory."""
    return _loaded


# ── Internal helpers ───────────────────────────────────────────────────────

def _normalise_to_uint8(data: np.ndarray) -> np.ndarray:
    """
    Normalise a raster array (C, H, W) to uint8 [0, 255].
    Handles uint16 / float GeoTIFFs gracefully.
    """
    out = np.zeros_like(data, dtype=np.uint8)
    for c in range(data.shape[0]):
        ch = data[c].astype(np.float32)
        lo, hi = float(ch.min()), float(ch.max())
        if hi > lo:
            ch = (ch - lo) / (hi - lo) * 255.0
        out[c] = ch.clip(0, 255).astype(np.uint8)
    return out


def _ensure_rgb(data: np.ndarray) -> np.ndarray:
    """
    Ensure the array has exactly 3 bands (C, H, W) for the SegFormer input.
    Duplicates channels when fewer than 3 are present.
    """
    c = data.shape[0]
    if c == 1:
        return np.repeat(data, 3, axis=0)
    if c == 2:
        return np.concatenate([data, data[:1]], axis=0)
    return data[:3]           # drop extra bands (e.g. RGBA → RGB)


def _run_inference(pil_image) -> np.ndarray:
    """
    Run SegFormer forward pass on a PIL RGB image.

    Returns:
        mask (np.ndarray, uint8, H×W) — 1 = building, 0 = background
        at the same resolution as the input image.
    """
    import torch

    orig_h, orig_w = pil_image.height, pil_image.width

    inputs = _processor(images=pil_image, return_tensors="pt")
    inputs = {k: v.to(_device) for k, v in inputs.items()}

    with torch.no_grad():
        outputs = _model(**inputs)

    # logits: (1, num_classes, H/4, W/4)
    logits = outputs.logits
    upsampled = torch.nn.functional.interpolate(
        logits,
        size=(orig_h, orig_w),
        mode="bilinear",
        align_corners=False,
    )
    # class 1 = building
    mask = upsampled.argmax(dim=1).squeeze(0).cpu().numpy().astype(np.uint8)
    return mask                  # values: {0, 1}


def _vectorise_mask(
    mask: np.ndarray,
    affine_transform,
    src_crs,
    source_image_name: str,
    min_area_px: int = 4,
) -> List[Dict[str, Any]]:
    """
    Convert a binary mask (H×W uint8, 1=building) into GeoJSON features.

    Steps:
      1. rasterio.features.shapes → raw polygon geometries in source CRS
      2. Reproject to EPSG:4326 using pyproj if needed
      3. Compute geodetic area (m²) with pyproj.Geod

    Args:
        mask:               Binary mask array.
        affine_transform:   rasterio Affine transform for the mask.
        src_crs:            rasterio CRS of the source raster (or None).
        source_image_name:  Tag embedded in each feature's properties.
        min_area_px:        Minimum polygon area in pixels — noise filter.

    Returns:
        List of GeoJSON feature dicts.
    """
    import rasterio.features
    import rasterio.crs
    import rasterio.warp
    from shapely.geometry import mapping, shape
    from shapely.validation import make_valid
    import pyproj

    target_crs = rasterio.crs.CRS.from_epsg(4326)
    need_reproject = (src_crs is not None) and (src_crs != target_crs)

    geod = pyproj.Geod(ellps="WGS84")

    # Pixel area threshold (affine_transform.a = pixel width in source units)
    px_area_threshold = min_area_px * abs(affine_transform.a * affine_transform.e)

    features: List[Dict[str, Any]] = []

    for geom_dict, val in rasterio.features.shapes(
        mask,
        mask=mask,          # only yield shapes where mask == 1
        transform=affine_transform,
    ):
        if val != 1:
            continue

        # Build shapely geometry
        geom = shape(geom_dict)
        if not geom.is_valid:
            geom = make_valid(geom)
        if geom.is_empty or geom.area < px_area_threshold:
            continue

        # Reproject if the source CRS is not already EPSG:4326
        if need_reproject:
            raw_reprojected = rasterio.warp.transform_geom(
                src_crs, target_crs, geom_dict
            )
            geom = shape(raw_reprojected)
            if not geom.is_valid:
                geom = make_valid(geom)
            if geom.is_empty:
                continue

        # Geodetic area in m²
        try:
            area_m2 = abs(geod.geometry_area_perimeter(geom)[0])
        except Exception:
            area_m2 = 0.0

        features.append({
            "type": "Feature",
            "properties": {
                "source_image": source_image_name,
                "model": "SegFormer-B2",
                "task": "building_segmentation",
                "area_m2": round(area_m2, 4),
            },
            "geometry": mapping(geom),
        })

    return features


def _build_geojson(
    features: List[Dict[str, Any]],
    name: str,
    min_building_area_m2: float,
) -> Dict[str, Any]:
    """Wrap features in a GeoJSON FeatureCollection, applying area filter."""
    filtered = [
        f for f in features
        if f["properties"]["area_m2"] >= min_building_area_m2
    ]
    return {
        "type": "FeatureCollection",
        "name": f"{name}_predicted_buildings",
        "crs": {
            "type": "name",
            "properties": {"name": "urn:ogc:def:crs:OGC:1.3:CRS84"},
        },
        "features": filtered,
    }


# ── Public API ─────────────────────────────────────────────────────────────

def segment_geotiff(
    file_path: str,
    source_image_name: Optional[str] = None,
    confidence_threshold: float = 0.5,
    min_building_area_m2: float = 5.0,
) -> Dict[str, Any]:
    """
    Run building segmentation on a GeoTIFF file.

    The input raster may be in any CRS; it will be automatically reprojected
    to EPSG:4326 during vectorisation.  If the file has more than 3 bands,
    only the first 3 are used.

    Args:
        file_path:             Absolute or relative path to a GeoTIFF.
        source_image_name:     Label stored in each feature's properties.
                               Defaults to the file stem.
        confidence_threshold:  Unused (kept for API compatibility — the model
                               uses argmax which implicitly applies >50%).
        min_building_area_m2:  Discard polygons smaller than this value (m²).

    Returns:
        GeoJSON FeatureCollection dict with all predicted building polygons.
    """
    import rasterio
    from PIL import Image as PILImage

    _load_model()

    name = source_image_name or Path(file_path).stem

    with rasterio.open(file_path) as src:
        band_count = min(src.count, 3)
        data = src.read(list(range(1, band_count + 1)))   # (C, H, W)
        affine_transform = src.transform
        src_crs = src.crs
        orig_h, orig_w = src.height, src.width

    if data.dtype != np.uint8:
        data = _normalise_to_uint8(data)

    data = _ensure_rgb(data)

    pil_img = PILImage.fromarray(data.transpose(1, 2, 0), mode="RGB")

    mask = _run_inference(pil_img)

    features = _vectorise_mask(
        mask,
        affine_transform=affine_transform,
        src_crs=src_crs,
        source_image_name=name,
    )
    return _build_geojson(features, name, min_building_area_m2)


def segment_pil_image(
    pil_image,
    affine_transform=None,
    src_crs_epsg: int = 4326,
    source_image_name: str = "image",
    confidence_threshold: float = 0.5,
    min_building_area_m2: float = 5.0,
) -> Dict[str, Any]:
    """
    Run building segmentation on an already-loaded PIL Image.

    Useful when the caller has already opened the raster or when running
    inference on non-GeoTIFF sources (e.g. JPEG, PNG).

    Args:
        pil_image:            A PIL.Image.Image (will be converted to RGB).
        affine_transform:     rasterio Affine transform.  If None, a dummy
                              pixel-space transform is used (for testing).
        src_crs_epsg:         EPSG code of the source CRS (default 4326).
        source_image_name:    Label embedded in each feature's properties.
        confidence_threshold: Kept for API consistency.
        min_building_area_m2: Minimum polygon area filter (m²).

    Returns:
        GeoJSON FeatureCollection dict.
    """
    import rasterio.crs
    from rasterio.transform import from_bounds

    _load_model()

    if pil_image.mode != "RGB":
        pil_image = pil_image.convert("RGB")

    orig_w, orig_h = pil_image.size

    if affine_transform is None:
        # Dummy pixel-space transform — useful in unit tests
        affine_transform = from_bounds(0, 0, orig_w, orig_h, orig_w, orig_h)
        src_crs = None
    else:
        src_crs = rasterio.crs.CRS.from_epsg(src_crs_epsg)

    mask = _run_inference(pil_image)

    features = _vectorise_mask(
        mask,
        affine_transform=affine_transform,
        src_crs=src_crs,
        source_image_name=source_image_name,
    )
    return _build_geojson(features, source_image_name, min_building_area_m2)


def model_info() -> Dict[str, Any]:
    """
    Return metadata about the SegFormer-B2 model.
    Safe to call before the model is loaded.
    """
    return {
        "architecture": "SegFormer-B2",
        "pretrained_base": "nvidia/segformer-b2-finetuned-ade-512-512",
        "model_path": str(MODEL_PATH),
        "model_path_exists": MODEL_PATH.exists(),
        "classes": {"0": "background", "1": "building"},
        "input_size_px": 512,
        "output_crs": "EPSG:4326",
        "training_dataset": "SpaceNet 2 — AOI_3_Paris",
        "best_epoch": 9,
        "validation_metrics": {
            "IoU": 0.7364,
            "Dice": 0.8482,
            "Precision": 0.8307,
            "Recall": 0.8665,
            "F1": 0.8482,
        },
        "loaded": _loaded,
        "device": str(_device) if _device is not None else None,
    }

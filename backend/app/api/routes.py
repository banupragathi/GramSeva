"""
GramSeva API Routes — Complete REST API for geospatial land record harmonization.

All demo endpoints return realistic structured data.
When connected to PostGIS, these will query real spatial data.
"""

import os
<<<<<<< HEAD
import nh3
from fastapi import APIRouter, UploadFile, File, HTTPException, Query, Response, Request
from typing import List, Optional
=======
import shutil
import tempfile
from pathlib import Path
from fastapi import APIRouter, UploadFile, File, HTTPException, Query
from typing import Any, Dict, List, Optional
>>>>>>> fb0ea31aec6de800441deefd97ae3ccb2fee954a
from datetime import datetime
from app.schemas.schemas import (
    LoginRequest, TokenResponse,
    ProjectCreate, ProjectResponse,
    DatasetResponse, DatasetValidateResponse, DatasetNormalizeResponse,
    ParcelResponse, ParcelProvenanceResponse,
    MatchResponse, ConflictResponse, ConflictResolveRequest,
    ChangeResponse,
    ReviewRequest, ReviewResponse,
    AnalyticsResponse,
    SearchRequest, SearchResponse,
    HarmonizationRunRequest, HarmonizationRunResponse,
)

router = APIRouter()

def sanitize_text(text: Optional[str]) -> Optional[str]:
    """Helper to strip any HTML tags from free-text fields using nh3."""
    if not text:
        return text
    return nh3.clean(text, tags=set())

# ──────────────────────────────────────────────────────────
# AUTH & USER ME
# ──────────────────────────────────────────────────────────
@router.post("/auth/login", response_model=TokenResponse)
async def login(request: LoginRequest, response: Response):
    """Authenticate user and set HttpOnly SameSite=Strict cookie."""
    token = "demo-token-gramseva-2024"
    
    # Set HttpOnly SameSite=Strict cookie
    response.set_cookie(
        key="jwt",
        value=token,
        httponly=True,
        samesite="strict",
        secure=os.getenv("NODE_ENV") == "production",
        max_age=3600,
    )
    
    return TokenResponse(
        access_token=token,
        token_type="bearer",
        role=request.role,
        user_id="demo-user"
    )

@router.post("/auth/logout")
async def logout(response: Response):
    """Clear session cookie on logout."""
    response.delete_cookie("jwt")
    return {"success": True, "message": "Logged out successfully"}

@router.get("/auth/me")
async def get_me(request: Request):
    """Fetch active user info from cookie or Bearer header."""
    token = request.cookies.get("jwt") or request.headers.get("Authorization")
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    return {
        "success": True,
        "user": {
            "user_id": "demo-user",
            "email": "admin@gramseva.in",
            "role": "admin"
        }
    }



# ──────────────────────────────────────────────────────────
# PROJECTS
# ──────────────────────────────────────────────────────────
@router.post("/projects", response_model=ProjectResponse)
async def create_project(project: ProjectCreate):
    return ProjectResponse(
        id="proj-demo-001",
        name=project.name,
        description=project.description,
        created_at=datetime.utcnow()
    )


@router.get("/projects", response_model=List[ProjectResponse])
async def list_projects():
    return [ProjectResponse(
        id="proj-demo-001",
        name="Tamil Nadu Urban Land Records",
        description="Multi-source harmonization for TN peri-urban area",
        created_at=datetime.utcnow()
    )]


# ──────────────────────────────────────────────────────────
# DATASETS
# ──────────────────────────────────────────────────────────
@router.post("/datasets/upload")
async def upload_dataset(file: UploadFile = File(...)):
    """Upload a geospatial dataset for processing."""
    return {
        "id": "DS-new",
        "name": file.filename,
        "status": "uploaded",
        "message": "Dataset received. Processing pipeline started.",
    }


@router.get("/datasets", response_model=List[DatasetResponse])
async def list_datasets():
    return DEMO_DATASETS


@router.get("/datasets/{dataset_id}", response_model=DatasetResponse)
async def get_dataset(dataset_id: str):
    for ds in DEMO_DATASETS:
        if ds["id"] == dataset_id:
            return ds
    raise HTTPException(status_code=404, detail="Dataset not found")


@router.post("/datasets/{dataset_id}/validate", response_model=DatasetValidateResponse)
async def validate_dataset(dataset_id: str):
    return DatasetValidateResponse(
        dataset_id=dataset_id,
        is_valid=True,
        issues=[],
        geometry_type="Polygon",
        record_count=487,
        crs_detected="EPSG:32644"
    )


@router.post("/datasets/{dataset_id}/normalize", response_model=DatasetNormalizeResponse)
async def normalize_dataset(dataset_id: str):
    return DatasetNormalizeResponse(
        dataset_id=dataset_id,
        original_crs="EPSG:32644",
        normalized_crs="EPSG:4326",
        records_transformed=487
    )


# ──────────────────────────────────────────────────────────
# HARMONIZATION
# ──────────────────────────────────────────────────────────
@router.post("/harmonization/run", response_model=HarmonizationRunResponse)
async def run_harmonization(request: HarmonizationRunRequest):
    return HarmonizationRunResponse(
        id="harm-run-001",
        status="completed",
        parcels_matched=1089,
        conflicts_detected=43,
        changes_detected=28
    )


@router.get("/harmonization/{run_id}", response_model=HarmonizationRunResponse)
async def get_harmonization(run_id: str):
    return HarmonizationRunResponse(
        id=run_id,
        status="completed",
        parcels_matched=1089,
        conflicts_detected=43,
        changes_detected=28
    )


# ──────────────────────────────────────────────────────────
# PARCELS
# ──────────────────────────────────────────────────────────
@router.get("/parcels", response_model=List[ParcelResponse])
async def list_parcels(limit: int = Query(50, le=500), offset: int = 0):
    return DEMO_PARCELS


@router.get("/parcels/{parcel_id}", response_model=ParcelResponse)
async def get_parcel(parcel_id: str):
    for p in DEMO_PARCELS:
        if p["parcel_id"] == parcel_id:
            return p
    raise HTTPException(status_code=404, detail="Parcel not found")


@router.get("/parcels/{parcel_id}/provenance", response_model=ParcelProvenanceResponse)
async def get_parcel_provenance(parcel_id: str):
    return ParcelProvenanceResponse(
        parcel_id=parcel_id,
        sources=[
            {"name": "Cadastral", "record_id": "CAD-1042", "crs": "EPSG:32644", "uploaded": "2024-08-15"},
            {"name": "Municipal", "record_id": "MUN-4521", "crs": "EPSG:4326", "uploaded": "2024-08-12"},
            {"name": "Drone", "record_id": "DRN-A042", "crs": "EPSG:32644", "uploaded": "2024-08-10"},
            {"name": "Revenue", "record_id": "REV-1042", "crs": "N/A", "uploaded": "2024-08-08"},
        ],
        transformation_history=[
            {"step": "CRS Normalization", "from": "EPSG:32644", "to": "EPSG:4326", "timestamp": "2024-08-15T09:44:00Z"},
            {"step": "Geometry Validation", "result": "valid", "timestamp": "2024-08-15T09:45:00Z"},
            {"step": "Schema Normalization", "fields_mapped": 8, "timestamp": "2024-08-15T09:46:00Z"},
        ],
        processing_version="v1.0.0-demo",
        model_version="evidence-fusion-v1",
        review_history=[]
    )


# ──────────────────────────────────────────────────────────
# MATCHES
# ──────────────────────────────────────────────────────────
@router.get("/matches", response_model=List[MatchResponse])
async def list_matches():
    return [MatchResponse(
        id="M-001",
        parcel_id="TN-1042",
        overall_confidence=94.0,
        spatial_match=97.0,
        geometry_match=95.0,
        visual_match=92.0,
        attribute_match=96.0,
        temporal_consistency=91.0,
        match_state="MATCHED",
        evidence={"iou": 0.92, "hausdorff": 2.1, "centroid_dist": 0.8},
        reasons=["High polygon overlap", "Strong attribute similarity", "Temporal consistency"]
    )]


# ──────────────────────────────────────────────────────────
# CONFLICTS
# ──────────────────────────────────────────────────────────
@router.get("/conflicts", response_model=List[ConflictResponse])
async def list_conflicts():
    return DEMO_CONFLICTS


@router.post("/conflicts/{conflict_id}/resolve")
async def resolve_conflict(conflict_id: str, request: ConflictResolveRequest):
    return {
        "id": conflict_id,
        "state": "RESOLVED",
        "resolution": request.resolution,
        "notes": request.notes,
        "resolved_at": datetime.utcnow().isoformat()
    }


# ──────────────────────────────────────────────────────────
# CHANGES
# ──────────────────────────────────────────────────────────
@router.get("/changes", response_model=List[ChangeResponse])
async def list_changes():
    return DEMO_CHANGES


# ──────────────────────────────────────────────────────────
# REVIEWS
# ──────────────────────────────────────────────────────────
@router.get("/reviews", response_model=List[ReviewResponse])
async def list_reviews():
    return [ReviewResponse(
        id="RV-001",
        parcel_id="TN-1022",
        issue="Multi-source boundary disagreement",
        review_type="boundary",
        decision=None,
        notes=None,
        created_at=datetime.utcnow()
    )]


@router.post("/reviews/{review_id}")
async def submit_review(review_id: str, request: ReviewRequest):
    return {
        "id": review_id,
        "decision": request.decision,
        "notes": request.notes,
        "reviewed_at": datetime.utcnow().isoformat()
    }


# ──────────────────────────────────────────────────────────
# ANALYTICS
# ──────────────────────────────────────────────────────────
@router.get("/analytics", response_model=AnalyticsResponse)
async def get_analytics():
    return AnalyticsResponse(
        parcels_processed=1247,
        sources_integrated=6,
        entities_matched=1089,
        conflicts_detected=43,
        conflicts_resolved=28,
        cases_reviewed=15,
        processing_time_seconds=754.0,
        confidence_distribution={"90-100": 504, "80-90": 320, "70-80": 180, "60-70": 48, "50-60": 25, "<50": 12},
        conflict_type_distribution={"boundary": 15, "area": 12, "attribute": 9, "temporal": 4, "topology": 3}
    )


# ──────────────────────────────────────────────────────────
# EVALUATION
# ──────────────────────────────────────────────────────────
@router.get("/evaluation")
async def get_evaluation():
    return {
        "status": "pending",
        "message": "Evaluation pending — run evaluation pipeline on benchmark data to generate metrics.",
        "metrics": {}
    }


# ──────────────────────────────────────────────────────────
# MAP LAYERS
# ──────────────────────────────────────────────────────────
@router.get("/map/layers")
async def get_map_layers():
    return {
        "layers": [
            {"id": "parcels", "name": "Parcels", "type": "vector", "visible": True},
            {"id": "buildings", "name": "Buildings", "type": "vector", "visible": True},
            {"id": "roads", "name": "Roads", "type": "vector", "visible": True},
            {"id": "conflicts", "name": "Conflicts", "type": "vector", "visible": True},
            {"id": "confidence", "name": "Confidence", "type": "heatmap", "visible": False},
            {"id": "satellite", "name": "Satellite", "type": "raster", "visible": False},
        ]
    }


# ──────────────────────────────────────────────────────────
# SEARCH (Natural Language GIS)
# ──────────────────────────────────────────────────────────
@router.post("/search", response_model=SearchResponse)
async def search(request: SearchRequest):
    """
    Natural-language GIS search.
    Uses a controlled query planner — never executes arbitrary SQL.
    """
    query = request.query.lower()

    # Supported intents
    if "conflict" in query or "disagree" in query:
        return SearchResponse(
            interpreted_query=f"Find parcels with conflicts matching: {request.query}",
            intent="CONFLICT_SEARCH",
            results=[{"parcel_id": "TN-1042", "type": "area", "confidence": 94}, {"parcel_id": "TN-1011", "type": "boundary", "confidence": 78}],
            count=2
        )
    elif "low" in query and "confidence" in query:
        return SearchResponse(
            interpreted_query="Find low-confidence matches (<80%)",
            intent="LOW_CONFIDENCE_SEARCH",
            results=[{"parcel_id": "TN-1022", "confidence": 72}, {"parcel_id": "TN-1011", "confidence": 78}],
            count=2
        )
    elif "building" in query and "outside" in query:
        return SearchResponse(
            interpreted_query="Find buildings outside registered parcel boundaries",
            intent="SPATIAL_ANOMALY_SEARCH",
            results=[],
            count=0
        )
    elif "change" in query or "construction" in query:
        return SearchResponse(
            interpreted_query="Find parcels with detected temporal changes",
            intent="CHANGE_SEARCH",
            results=[{"parcel_id": "TN-1020", "type": "new_building"}, {"parcel_id": "TN-1042", "type": "building_expanded"}],
            count=2
        )
    else:
        return SearchResponse(
            interpreted_query=f"General search: {request.query}",
            intent="GENERAL_SEARCH",
            results=[],
            count=0
        )


# ──────────────────────────────────────────────────────────
# EXPORT
# ──────────────────────────────────────────────────────────
@router.get("/export")
async def export_data(format: str = Query("geojson", enum=["geojson", "csv", "json"])):
    """Export harmonized data with provenance."""
    return {
        "format": format,
        "status": "ready",
        "download_url": f"/api/export/download?format={format}",
        "records": 1247,
        "includes_provenance": True
    }


# ──────────────────────────────────────────────────────────
# ML — BUILDING SEGMENTATION  (SegFormer-B2)
# ──────────────────────────────────────────────────────────

@router.get("/ml/info")
async def ml_model_info():
    """
    Return metadata about the loaded SegFormer-B2 building segmentation model.
    Safe to call whether or not torch is installed.
    """
    try:
        from app.ml.segformer_service import model_info
        return model_info()
    except ImportError:
        return {
            "architecture": "SegFormer-B2",
            "status": "unavailable",
            "reason": "ML dependencies not installed (torch, transformers).",
            "install": "pip install torch transformers",
        }


@router.post("/ml/segment")
async def segment_buildings(
    file: UploadFile = File(..., description="GeoTIFF or raster image for building segmentation"),
    min_area_m2: float = Query(5.0, ge=0.0, description="Minimum building area to keep (m²)"),
    source_name: Optional[str] = Query(None, description="Label for source_image property in output GeoJSON"),
):
    """
    Run SegFormer-B2 building segmentation on an uploaded GeoTIFF.

    **Returns**: GeoJSON FeatureCollection with one Polygon feature per
    detected building.  Each feature includes:
    - `source_image`  – name tag
    - `model`         – "SegFormer-B2"
    - `task`          – "building_segmentation"
    - `area_m2`       – geodetic area of the polygon
    - `geometry`      – Polygon coordinates in EPSG:4326

    **Requirements**: `torch` and `transformers` must be installed and the
    model must be present at `SEGFORMER_MODEL_PATH`.
    """
    # Import guard — returns 503 if torch/transformers are missing
    try:
        from app.ml.segformer_service import segment_geotiff
    except ImportError as exc:
        raise HTTPException(
            status_code=503,
            detail=f"ML dependencies not installed: {exc}. Run: pip install torch transformers",
        )

    # Write the uploaded file to a temporary path so rasterio can open it
    suffix = Path(file.filename).suffix if file.filename else ".tif"
    tmp = tempfile.NamedTemporaryFile(delete=False, suffix=suffix)
    try:
        shutil.copyfileobj(file.file, tmp)
        tmp.flush()
        tmp.close()

        name = source_name or (Path(file.filename).stem if file.filename else "upload")

        try:
            geojson = segment_geotiff(
                file_path=tmp.name,
                source_image_name=name,
                min_building_area_m2=min_area_m2,
            )
        except FileNotFoundError as exc:
            raise HTTPException(status_code=500, detail=str(exc))
        except Exception as exc:
            raise HTTPException(
                status_code=500,
                detail=f"Segmentation failed: {exc}",
            )
    finally:
        os.unlink(tmp.name)

    building_count = len(geojson.get("features", []))
    total_area = sum(
        f["properties"].get("area_m2", 0) for f in geojson.get("features", [])
    )

    return {
        "status": "success",
        "building_count": building_count,
        "total_area_m2": round(total_area, 2),
        "model": "SegFormer-B2",
        "output_crs": "EPSG:4326",
        "geojson": geojson,
    }


@router.post("/datasets/{dataset_id}/segment")
async def segment_dataset_buildings(
    dataset_id: str,
    parcel_id: Optional[str] = Query(None, description="Associate extracted buildings with this parcel ID"),
    min_area_m2: float = Query(5.0, ge=0.0),
):
    """
    Trigger building segmentation for a dataset that has already been uploaded.

    In demo mode (no PostGIS) the endpoint validates that the dataset ID is
    known and returns a structured response describing what would be saved to
    the `buildings` table.

    When PostGIS is connected, the extracted building polygons are persisted
    as `Building` rows linked to the given `parcel_id`.
    """
    # Verify dataset exists in demo data
    known_ids = {ds["id"] for ds in DEMO_DATASETS}
    if dataset_id not in known_ids:
        raise HTTPException(status_code=404, detail=f"Dataset {dataset_id!r} not found")

    # Find the dataset record
    dataset = next((ds for ds in DEMO_DATASETS if ds["id"] == dataset_id), None)

    # Only raster datasets can be segmented
    if dataset and dataset.get("geometry_type") not in ("Raster", None):
        raise HTTPException(
            status_code=422,
            detail=(
                f"Dataset {dataset_id!r} has geometry_type "
                f"'{dataset.get('geometry_type')}'. "
                "Building segmentation requires a raster (GeoTIFF) dataset."
            ),
        )

    # Check ML availability
    ml_available = False
    try:
        from app.ml.segformer_service import is_loaded, model_info
        ml_available = True
        loaded = is_loaded()
        info = model_info()
    except ImportError:
        loaded = False
        info = {}

    return {
        "dataset_id": dataset_id,
        "parcel_id": parcel_id,
        "ml_available": ml_available,
        "model_loaded": loaded,
        "status": "ready" if ml_available else "unavailable",
        "message": (
            "POST a GeoTIFF to /api/ml/segment to run inference, "
            "then associate the returned building polygons with a parcel."
            if not ml_available
            else (
                "ML engine is ready. Upload the GeoTIFF via POST /api/ml/segment "
                "with source_name=" + dataset_id
            )
        ),
        "model": info.get("architecture"),
        "output_crs": "EPSG:4326",
        # Simulated result for demo mode
        "demo_result": {
            "buildings_would_be_saved": 28,
            "table": "buildings",
            "linked_parcel": parcel_id,
            "area_range_m2": {"min": 12.4, "max": 618.9},
        },
    }


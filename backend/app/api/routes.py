"""
GramSeva API Routes — Complete REST API for geospatial land record harmonization.

All demo endpoints return realistic structured data.
When connected to PostGIS, these will query real spatial data.
"""

from fastapi import APIRouter, UploadFile, File, HTTPException, Query
from typing import List, Optional
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

# ──────────────────────────────────────────────────────────
# DEMO DATA (used when PostGIS is not connected)
# ──────────────────────────────────────────────────────────
DEMO_DATASETS = [
    {"id": "DS-001", "name": "cadastral_tn_2024.geojson", "source_type": "Cadastral", "file_format": "GeoJSON", "record_count": 487, "geometry_type": "Polygon", "original_crs": "EPSG:32644", "normalized_crs": "EPSG:4326", "status": "ready", "validity_pct": 98.2, "missing_attributes": 3, "duplicate_records": 0, "uploaded_at": "2024-08-15T09:42:00Z", "file_size": 4200000},
    {"id": "DS-002", "name": "municipal_gis_export.shp", "source_type": "Municipal GIS", "file_format": "Shapefile", "record_count": 523, "geometry_type": "Polygon", "original_crs": "EPSG:4326", "normalized_crs": "EPSG:4326", "status": "ready", "validity_pct": 95.7, "missing_attributes": 12, "duplicate_records": 2, "uploaded_at": "2024-08-12T14:20:00Z", "file_size": 6800000},
    {"id": "DS-003", "name": "drone_survey_aug24.geotiff", "source_type": "Drone Imagery", "file_format": "GeoTIFF", "record_count": 1, "geometry_type": "Raster", "original_crs": "EPSG:32644", "normalized_crs": "EPSG:4326", "status": "ready", "validity_pct": 100.0, "missing_attributes": 0, "duplicate_records": 0, "uploaded_at": "2024-08-10T11:15:00Z", "file_size": 234000000},
]

DEMO_PARCELS = [
    {"id": "P-001", "parcel_id": "TN-1042", "survey_number": "SN-1042", "area_sqm": 1200.0, "land_use": "Residential", "building_count": 1, "building_area_sqm": 340.0, "road_access": True, "owner_name": "S. Kumar", "confidence": 94.0, "match_state": "MATCHED", "review_state": None, "sources": ["Cadastral", "Municipal", "Drone", "Revenue"], "created_at": "2024-08-22T00:00:00Z"},
    {"id": "P-002", "parcel_id": "TN-1001", "survey_number": "SN-1001", "area_sqm": 1200.0, "land_use": "Residential", "building_count": 2, "building_area_sqm": 420.0, "road_access": True, "owner_name": "Suresh Kumar", "confidence": 96.0, "match_state": "MATCHED", "review_state": None, "sources": ["Cadastral", "Municipal", "Drone"], "created_at": "2024-06-15T00:00:00Z"},
]

DEMO_CONFLICTS = [
    {"id": "C-001", "parcel_id": "TN-1042", "conflict_type": "area", "severity": "medium", "description": "Area mismatch between cadastral and municipal records", "source_a_name": "Cadastral", "source_a_value": "1200 sq.ft", "source_b_name": "Municipal", "source_b_value": "1267 sq.ft", "difference": "5.58%", "state": "HUMAN_REVIEW", "created_at": "2024-08-20T09:51:00Z"},
    {"id": "C-002", "parcel_id": "TN-1011", "conflict_type": "boundary", "severity": "high", "description": "Boundary mismatch — cadastral boundary overlaps adjacent parcel", "source_a_name": "Cadastral", "source_a_value": "Original boundary", "source_b_name": "Municipal", "source_b_value": "Shifted 2.3m east", "difference": "2.3m offset", "state": "OPEN", "created_at": "2024-08-18T14:22:00Z"},
]

DEMO_CHANGES = [
    {"id": "CH-001", "parcel_id": "TN-1020", "change_type": "new_building", "description": "New building detected in agricultural parcel", "before_date": "2022-03-15", "after_date": "2024-06-10", "before_value": "Vacant land", "after_value": "80 sq.m structure detected", "confidence": 91.0, "detected_by": "ChangeFormer"},
]


# ──────────────────────────────────────────────────────────
# AUTH
# ──────────────────────────────────────────────────────────
@router.post("/auth/login", response_model=TokenResponse)
async def login(request: LoginRequest):
    """Authenticate user. Demo mode bypasses authentication."""
    # Demo mode: accept any credentials
    return TokenResponse(
        access_token="demo-token-gramseva-2024",
        token_type="bearer",
        role=request.role,
        user_id="demo-user"
    )


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

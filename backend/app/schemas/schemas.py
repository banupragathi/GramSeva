"""
Pydantic schemas for GramSeva API request/response validation.
"""

from __future__ import annotations
from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field
from uuid import UUID


# ────────────────────────────────────────────
# AUTH
# ────────────────────────────────────────────
class LoginRequest(BaseModel):
    email: str
    password: str
    role: str = "survey_officer"


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    role: str
    user_id: str


# ────────────────────────────────────────────
# PROJECT
# ────────────────────────────────────────────
class ProjectCreate(BaseModel):
    name: str
    description: Optional[str] = None


class ProjectResponse(BaseModel):
    id: str
    name: str
    description: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True


# ────────────────────────────────────────────
# DATASET
# ────────────────────────────────────────────
class DatasetResponse(BaseModel):
    id: str
    name: str
    source_type: str
    file_format: Optional[str]
    record_count: int
    geometry_type: Optional[str]
    original_crs: Optional[str]
    normalized_crs: Optional[str]
    status: str
    validity_pct: float
    missing_attributes: int
    duplicate_records: int
    uploaded_at: datetime
    file_size: Optional[int]

    class Config:
        from_attributes = True


class DatasetValidateResponse(BaseModel):
    dataset_id: str
    is_valid: bool
    issues: List[str]
    geometry_type: Optional[str]
    record_count: int
    crs_detected: Optional[str]


class DatasetNormalizeResponse(BaseModel):
    dataset_id: str
    original_crs: str
    normalized_crs: str
    records_transformed: int


# ────────────────────────────────────────────
# PARCEL
# ────────────────────────────────────────────
class ParcelResponse(BaseModel):
    id: str
    parcel_id: str
    survey_number: Optional[str]
    area_sqm: Optional[float]
    land_use: Optional[str]
    building_count: int
    building_area_sqm: float
    road_access: bool
    owner_name: Optional[str]
    confidence: float
    match_state: str
    review_state: Optional[str]
    sources: List[str]
    created_at: datetime

    class Config:
        from_attributes = True


class ParcelProvenanceResponse(BaseModel):
    parcel_id: str
    sources: List[Dict[str, Any]]
    transformation_history: List[Dict[str, Any]]
    processing_version: Optional[str]
    model_version: Optional[str]
    review_history: List[Dict[str, Any]]


# ────────────────────────────────────────────
# MATCH
# ────────────────────────────────────────────
class MatchResponse(BaseModel):
    id: str
    parcel_id: Optional[str]
    overall_confidence: float
    spatial_match: float
    geometry_match: float
    visual_match: float
    attribute_match: float
    temporal_consistency: float
    match_state: str
    evidence: Dict[str, Any]
    reasons: List[str]

    class Config:
        from_attributes = True


# ────────────────────────────────────────────
# CONFLICT
# ────────────────────────────────────────────
class ConflictResponse(BaseModel):
    id: str
    parcel_id: str
    conflict_type: str
    severity: str
    description: Optional[str]
    source_a_name: str
    source_a_value: str
    source_b_name: str
    source_b_value: str
    difference: str
    state: str
    created_at: datetime

    class Config:
        from_attributes = True


class ConflictResolveRequest(BaseModel):
    resolution: str  # AUTO_RESOLVE, HUMAN_REVIEW, IRRECONCILABLE
    notes: Optional[str] = None
    chosen_value: Optional[str] = None


# ────────────────────────────────────────────
# CHANGE
# ────────────────────────────────────────────
class ChangeResponse(BaseModel):
    id: str
    parcel_id: str
    change_type: str
    description: Optional[str]
    before_date: str
    after_date: str
    before_value: str
    after_value: str
    confidence: float
    detected_by: str

    class Config:
        from_attributes = True


# ────────────────────────────────────────────
# REVIEW
# ────────────────────────────────────────────
class ReviewRequest(BaseModel):
    decision: str  # ACCEPT, REJECT, EDIT, KEEP_BOTH, ESCALATE
    notes: Optional[str] = None


class ReviewResponse(BaseModel):
    id: str
    parcel_id: str
    issue: Optional[str]
    review_type: str
    decision: Optional[str]
    notes: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True


# ────────────────────────────────────────────
# ANALYTICS
# ────────────────────────────────────────────
class AnalyticsResponse(BaseModel):
    parcels_processed: int
    sources_integrated: int
    entities_matched: int
    conflicts_detected: int
    conflicts_resolved: int
    cases_reviewed: int
    processing_time_seconds: float
    confidence_distribution: Dict[str, int]
    conflict_type_distribution: Dict[str, int]


# ────────────────────────────────────────────
# SEARCH
# ────────────────────────────────────────────
class SearchRequest(BaseModel):
    query: str


class SearchResponse(BaseModel):
    interpreted_query: str
    intent: str
    results: List[Dict[str, Any]]
    count: int


# ────────────────────────────────────────────
# HARMONIZATION
# ────────────────────────────────────────────
class HarmonizationRunRequest(BaseModel):
    dataset_ids: List[str]


class HarmonizationRunResponse(BaseModel):
    id: str
    status: str
    parcels_matched: int
    conflicts_detected: int
    changes_detected: int

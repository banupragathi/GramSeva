"""
GramSeva Database Models
SQLAlchemy + GeoAlchemy2 models for the geospatial land record platform.
"""

import uuid
from datetime import datetime
from sqlalchemy import (
    Column, String, Integer, Float, Boolean, DateTime, Text, JSON,
    ForeignKey, Enum as SAEnum, Index
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from geoalchemy2 import Geometry
from app.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String(255), unique=True, nullable=False, index=True)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(255))
    role = Column(String(50), nullable=False, default="survey_officer")  # admin, survey_officer, reviewer
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class Project(Base):
    __tablename__ = "projects"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(255), nullable=False)
    description = Column(Text)
    created_by = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    datasets = relationship("Dataset", back_populates="project")


class Dataset(Base):
    __tablename__ = "datasets"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    project_id = Column(UUID(as_uuid=True), ForeignKey("projects.id"))
    name = Column(String(255), nullable=False)
    source_type = Column(String(100), nullable=False)  # Cadastral, Drone, Municipal, Revenue, OSM, GNSS, etc.
    file_format = Column(String(50))  # GeoJSON, Shapefile, GeoPackage, GeoTIFF, CSV, JSON, KML
    file_path = Column(String(500))
    file_size = Column(Integer)  # bytes
    record_count = Column(Integer, default=0)
    geometry_type = Column(String(50))  # Polygon, Point, LineString, Raster, None
    original_crs = Column(String(50))
    normalized_crs = Column(String(50), default="EPSG:4326")
    bounding_box = Column(JSON)  # [minx, miny, maxx, maxy]
    status = Column(String(50), default="uploaded")  # uploaded, validating, processing, ready, error
    validity_pct = Column(Float, default=0.0)
    missing_attributes = Column(Integer, default=0)
    duplicate_records = Column(Integer, default=0)
    metadata_extra = Column(JSON, default=dict)
    uploaded_at = Column(DateTime, default=datetime.utcnow)
    processed_at = Column(DateTime)

    project = relationship("Project", back_populates="datasets")
    source_records = relationship("SourceRecord", back_populates="dataset")


class SourceRecord(Base):
    """Individual record from a data source, linked to a dataset."""
    __tablename__ = "source_records"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    dataset_id = Column(UUID(as_uuid=True), ForeignKey("datasets.id"), nullable=False)
    source_record_id = Column(String(255))  # Original record ID from the source
    geometry = Column(Geometry("GEOMETRY", srid=4326))  # Normalized geometry
    original_geometry = Column(Geometry("GEOMETRY", srid=0))  # Preserved original
    original_crs = Column(String(50))
    attributes = Column(JSON, default=dict)
    normalized_attributes = Column(JSON, default=dict)
    is_valid = Column(Boolean, default=True)
    validation_issues = Column(JSON, default=list)
    created_at = Column(DateTime, default=datetime.utcnow)

    dataset = relationship("Dataset", back_populates="source_records")

    __table_args__ = (
        Index("idx_source_records_geometry", "geometry", postgresql_using="gist"),
    )


class Parcel(Base):
    """Canonical harmonized parcel — the unified land record."""
    __tablename__ = "parcels"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    parcel_id = Column(String(50), unique=True, nullable=False, index=True)
    survey_number = Column(String(100), index=True)
    geometry = Column(Geometry("POLYGON", srid=4326))
    area_sqm = Column(Float)
    land_use = Column(String(100))
    building_count = Column(Integer, default=0)
    building_area_sqm = Column(Float, default=0.0)
    road_access = Column(Boolean, default=False)
    owner_name = Column(String(255))
    confidence = Column(Float, default=0.0)
    match_state = Column(String(50), default="NOT_MATCHED")  # MATCHED, LIKELY_MATCH, REVIEW_REQUIRED, NOT_MATCHED
    review_state = Column(String(50))  # PENDING, APPROVED, REJECTED, ESCALATED
    source_count = Column(Integer, default=0)
    sources = Column(JSON, default=list)
    processing_version = Column(String(50))
    model_version = Column(String(50))
    is_synthetic = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    buildings = relationship("Building", back_populates="parcel")
    matches = relationship("Match", back_populates="parcel")
    conflicts = relationship("Conflict", back_populates="parcel")
    changes = relationship("Change", back_populates="parcel")
    reviews = relationship("Review", back_populates="parcel")

    __table_args__ = (
        Index("idx_parcels_geometry", "geometry", postgresql_using="gist"),
    )


class Building(Base):
    __tablename__ = "buildings"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    parcel_id = Column(UUID(as_uuid=True), ForeignKey("parcels.id"), nullable=False)
    geometry = Column(Geometry("POLYGON", srid=4326))
    area_sqm = Column(Float)
    floors = Column(Integer)
    building_type = Column(String(100))
    year_built = Column(Integer)
    created_at = Column(DateTime, default=datetime.utcnow)

    parcel = relationship("Parcel", back_populates="buildings")

    __table_args__ = (
        Index("idx_buildings_geometry", "geometry", postgresql_using="gist"),
    )


class Match(Base):
    """Entity matching result between source records."""
    __tablename__ = "matches"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    parcel_id = Column(UUID(as_uuid=True), ForeignKey("parcels.id"))
    source_a_id = Column(UUID(as_uuid=True), ForeignKey("source_records.id"))
    source_b_id = Column(UUID(as_uuid=True), ForeignKey("source_records.id"))
    overall_confidence = Column(Float)
    spatial_match = Column(Float)
    geometry_match = Column(Float)
    visual_match = Column(Float)
    attribute_match = Column(Float)
    temporal_consistency = Column(Float)
    match_state = Column(String(50))  # MATCHED, LIKELY_MATCH, REVIEW_REQUIRED, NOT_MATCHED
    evidence = Column(JSON, default=dict)
    reasons = Column(JSON, default=list)
    model_version = Column(String(50))
    created_at = Column(DateTime, default=datetime.utcnow)

    parcel = relationship("Parcel", back_populates="matches")


class Conflict(Base):
    __tablename__ = "conflicts"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    parcel_id = Column(UUID(as_uuid=True), ForeignKey("parcels.id"), nullable=False)
    conflict_type = Column(String(50), nullable=False)  # boundary, area, attribute, temporal, topology
    severity = Column(String(20))  # high, medium, low
    description = Column(Text)
    source_a_name = Column(String(100))
    source_a_value = Column(String(500))
    source_b_name = Column(String(100))
    source_b_value = Column(String(500))
    difference = Column(String(255))
    state = Column(String(50), default="OPEN")  # OPEN, AUTO_RESOLVE, HUMAN_REVIEW, IRRECONCILABLE, RESOLVED
    resolution = Column(JSON)
    resolved_by = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    resolved_at = Column(DateTime)
    created_at = Column(DateTime, default=datetime.utcnow)

    parcel = relationship("Parcel", back_populates="conflicts")


class Change(Base):
    __tablename__ = "changes"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    parcel_id = Column(UUID(as_uuid=True), ForeignKey("parcels.id"), nullable=False)
    change_type = Column(String(50), nullable=False)  # new_building, building_expanded, building_demolished, land_use_change, boundary_change
    description = Column(Text)
    before_date = Column(String(20))
    after_date = Column(String(20))
    before_value = Column(String(500))
    after_value = Column(String(500))
    confidence = Column(Float)
    detected_by = Column(String(100))  # ChangeFormer, SegFormer-B2, etc.
    model_version = Column(String(50))
    created_at = Column(DateTime, default=datetime.utcnow)

    parcel = relationship("Parcel", back_populates="changes")


class Review(Base):
    __tablename__ = "reviews"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    parcel_id = Column(UUID(as_uuid=True), ForeignKey("parcels.id"), nullable=False)
    reviewer_id = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    issue = Column(Text)
    review_type = Column(String(50))  # low_confidence, boundary, attribute, area, temporal
    decision = Column(String(50))  # ACCEPT, REJECT, EDIT, KEEP_BOTH, ESCALATE
    notes = Column(Text)
    evidence_snapshot = Column(JSON, default=dict)
    created_at = Column(DateTime, default=datetime.utcnow)
    reviewed_at = Column(DateTime)

    parcel = relationship("Parcel", back_populates="reviews")


class ProcessingRun(Base):
    __tablename__ = "processing_runs"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    dataset_id = Column(UUID(as_uuid=True), ForeignKey("datasets.id"))
    stage = Column(String(100))  # upload, validation, crs_normalization, geometry_processing, matching, etc.
    status = Column(String(50))  # running, completed, failed
    started_at = Column(DateTime, default=datetime.utcnow)
    completed_at = Column(DateTime)
    records_processed = Column(Integer, default=0)
    errors = Column(JSON, default=list)
    metadata_extra = Column(JSON, default=dict)


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    action = Column(String(255), nullable=False)
    entity_type = Column(String(100))  # dataset, parcel, conflict, review
    entity_id = Column(String(255))
    details = Column(JSON, default=dict)
    timestamp = Column(DateTime, default=datetime.utcnow)

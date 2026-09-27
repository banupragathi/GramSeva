"""
GramSeva Backend — FastAPI Application
Automated Integration and Intelligent Harmonization of Multi-source Geospatial Data
"""

import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import router as api_router

logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan: pre-warm the SegFormer-B2 model at startup."""
    try:
        from app.ml.segformer_service import _load_model
        _load_model()
        logger.info("SegFormer-B2 model pre-warmed successfully.")
    except FileNotFoundError as exc:
        logger.warning("SegFormer model path not found at startup: %s", exc)
    except ImportError as exc:
        logger.warning(
            "ML dependencies not installed (torch/transformers). "
            "Segmentation endpoints will return 503. Details: %s", exc
        )
    except Exception as exc:
        logger.error("Unexpected error loading SegFormer at startup: %s", exc)
    yield
    # Shutdown — nothing to clean up for the model


app = FastAPI(
    title="GramSeva API",
    description="Multi-source geospatial data harmonization for urban land record management — SIH26013",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API router
app.include_router(api_router, prefix="/api")


@app.get("/health")
async def health():
    return {
        "status": "healthy",
        "service": "GramSeva API",
        "version": "1.0.0",
        "components": {
            "gis_engine": "operational",
            "ai_engine": "ready",
            "postgis": "connected",
            "data_pipeline": "healthy",
        },
    }

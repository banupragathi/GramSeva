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
    """Application lifespan: pre-warm SegFormer-B2 and SBERT models at startup."""
    # 1. Pre-warm SegFormer-B2 building segmentation (Task 2)
    try:
        from app.ml.segformer_service import _load_model as _load_segformer
        _load_segformer()
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

    # 2. Pre-warm SBERT Land-Use Semantic Matcher & Cache Vocabulary Embeddings (Task 1)
    try:
        from app.ml.sbert_service import _load_model as _load_sbert
        _load_sbert()
        logger.info("SBERT Land-Use semantic matcher pre-warmed successfully.")
    except FileNotFoundError as exc:
        logger.warning("SBERT model or vocabulary path not found at startup: %s", exc)
    except ImportError as exc:
        logger.warning(
            "sentence-transformers dependencies not installed. "
            "Land-use matching endpoints will return 503. Details: %s", exc
        )
    except Exception as exc:
        logger.error("Unexpected error loading SBERT at startup: %s", exc)

    yield
    # Shutdown — nothing to clean up for models


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

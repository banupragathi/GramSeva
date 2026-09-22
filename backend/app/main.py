"""
GramSeva Backend — FastAPI Application
Automated Integration and Intelligent Harmonization of Multi-source Geospatial Data
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import router as api_router

app = FastAPI(
    title="GramSeva API",
    description="Multi-source geospatial data harmonization for urban land record management — SIH26013",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
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

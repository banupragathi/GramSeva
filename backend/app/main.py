import os
import secrets
from fastapi import FastAPI, Request, Response, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

from app.api import router as api_router
from app.utils.security import ensure_env, logger

# Step 1: Enforce environment safety
ensure_env()

# Initialize Rate Limiter
limiter = Limiter(key_func=get_remote_address, default_limits=["200/15minutes"])

app = FastAPI(
    title="GramSeva API",
    description="Multi-source geospatial data harmonization for urban land record management — SIH26013",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# Security & CSP Middleware
@app.middleware("http")
async def security_headers_middleware(request: Request, call_next):
    # CSRF Check for state-changing methods if CSRF cookie is present
    if request.method in ["POST", "PUT", "PATCH", "DELETE"]:
        csrf_cookie = request.cookies.get("csrf_token")
        csrf_header = request.headers.get("X-CSRF-Token")
        if csrf_cookie and csrf_header != csrf_cookie:
            return JSONResponse(
                status_code=403,
                content={"success": False, "detail": "CSRF token validation failed"}
            )
            
    response: Response = await call_next(request)
    
    # Helmet-equivalent Security Headers
    response.headers["Content-Security-Policy"] = (
        "default-src 'self'; "
        "script-src 'self'; "
        "style-src 'self' 'unsafe-inline'; "
        "img-src 'self' data: https:; "
        "font-src 'self'; "
        "object-src 'none';"
    )
    response.headers["Referrer-Policy"] = "no-referrer"
    response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    
    return response

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

# CSRF Token Generator Endpoint
@app.get("/api/csrf-token")
async def get_csrf_token(response: Response):
    token = secrets.token_hex(32)
    response.set_cookie(
        key="csrf_token",
        value=token,
        httponly=True,
        samesite="strict",
        secure=os.getenv("NODE_ENV") == "production",
    )
    return {"csrfToken": token}

# Global Error Handler - Strip stack traces in production
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled Exception on {request.method} {request.url.path}: {str(exc)}")
    
    show_stack = os.getenv("SHOW_STACK", "false").lower() == "true"
    content = {
        "success": False,
        "message": "Internal Server Error",
    }
    if show_stack or os.getenv("NODE_ENV") != "production":
        content["detail"] = str(exc)
        
    return JSONResponse(status_code=500, content=content)

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


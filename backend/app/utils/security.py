import os
import re
import logging

logger = logging.getLogger("gramseva")

class RedactingFormatter(logging.Formatter):
    """Log formatter that redacts sensitive values like JWT secrets and DB passwords."""
    
    PATTERNS = [
        r'(JWT_SECRET|DATABASE_URL|MONGO_URI)=([^\s&]+)',
        r'(password|secret|token)=([^\s&]+)'
    ]

    def format(self, record: logging.LogRecord) -> str:
        formatted = super().format(record)
        for pattern in self.PATTERNS:
            formatted = re.sub(pattern, r'\1=***REDACTED***', formatted, flags=re.IGNORECASE)
        return formatted

def ensure_env():
    """Ensure required environment variables meet security standards."""
    jwt_secret = os.getenv("JWT_SECRET", "your-secret-key-change-in-production")
    
    # In production or strict mode, enforce minimum 32-character secret key
    if os.getenv("NODE_ENV") == "production" or os.getenv("STRICT_ENV_CHECK") == "true":
        if not jwt_secret or len(jwt_secret) < 32:
            raise ValueError(
                "❌ JWT_SECRET must be at least 32 characters (256-bit) long. "
                "Set a strong secret in .env."
            )
        if not os.getenv("DATABASE_URL"):
            raise ValueError("❌ DATABASE_URL is not defined.")

def setup_logging():
    """Configure security-aware logger."""
    handler = logging.StreamHandler()
    formatter = RedactingFormatter("[%(asctime)s] %(levelname)s in %(module)s: %(message)s")
    handler.setFormatter(formatter)
    
    logger.setLevel(logging.INFO)
    logger.addHandler(handler)
    return logger

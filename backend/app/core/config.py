# app/core/config.py
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    # --- Requeridos (sin default) primero ---
    SUPABASE_URL: str
    SUPABASE_KEY: str

    # --- Opcionales con default después ---
    SUPABASE_JWT_SECRET: str | None = None
    SUPABASE_JWKS_URL: str | None = None

    API_NAME: str = "Pocket Doctor API"
    API_VERSION: str = "0.1.0"
    STORAGE_BUCKET: str = "uploads"

    # OCR local (opcionales)
    TESSERACT_CMD: str | None = None
    OCR_LANG: str = "spa+eng"
    POPPLER_PATH: str | None = None

    # Lee automáticamente variables del archivo .env en el directorio del backend
    model_config = {
        "env_file": ".env",
        "extra": "ignore",
    }

settings = Settings()

# (Opcional de debug, quítalo luego)
if not settings.SUPABASE_URL or not settings.SUPABASE_URL.startswith("http"):
    print("[config] OJO: SUPABASE_URL vacío o sin https://")

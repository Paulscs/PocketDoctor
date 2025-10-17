# backend/app/core/config.py
import os
from dataclasses import dataclass
from pathlib import Path

# 1) Cargar .env por ruta absoluta: .../backend/.env
try:
    from dotenv import load_dotenv
    ENV_PATH = Path(__file__).resolve().parents[2] / ".env"  # <-- backend/.env
    load_dotenv(ENV_PATH)
except Exception:
    pass  # si no está instalado dotenv, simplemente no carga

@dataclass(frozen=True)
class Settings:
    SUPABASE_URL: str = os.getenv("SUPABASE_URL", "")
    SUPABASE_KEY: str = os.getenv("SUPABASE_KEY", "")
    SUPABASE_JWT_SECRET: str | None = os.getenv("SUPABASE_JWT_SECRET")
    SUPABASE_JWKS_URL: str | None = os.getenv("SUPABASE_JWKS_URL")
    API_NAME: str = os.getenv("API_NAME", "Pocket Doctor API")
    API_VERSION: str = os.getenv("API_VERSION", "0.1.0")
    STORAGE_BUCKET: str = os.getenv("STORAGE_BUCKET", "uploads")

settings = Settings()

# (Opcional de debug: borrar luego)
if not settings.SUPABASE_URL or not settings.SUPABASE_URL.startswith("http"):
    print("[config] OJO: SUPABASE_URL vacío o sin https://")

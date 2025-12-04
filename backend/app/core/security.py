# app/core/security.py
from fastapi import Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
import jwt  # PyJWT
from app.core.config import settings

bearer_scheme = HTTPBearer(auto_error=False)

class AuthUser(BaseModel):
    sub: str
    email: str | None = None
    token: str

def _decode_supabase_jwt(token: str) -> dict:
    """
    Valida el JWT de Supabase con HS256 y el SUPABASE_JWT_SECRET del .env.
    Desactiva verificación de audience para evitar falsos positivos.
    Lanza HTTPException 401 si es inválido/expirado.
    """
    try:
        return jwt.decode(
            token,
            settings.SUPABASE_JWT_SECRET,
            algorithms=["HS256"],
            options={"verify_aud": False},
            leeway=60,
        )
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expirado")
    except jwt.InvalidTokenError as e:
        raise HTTPException(status_code=401, detail=f"Token inválido: {e}")

async def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
) -> AuthUser:
    if not credentials or credentials.scheme.lower() != "bearer":
        raise HTTPException(status_code=401, detail="Falta Authorization: Bearer <token>")
    token = credentials.credentials

    claims = _decode_supabase_jwt(token)
    sub = claims.get("sub") or claims.get("user_id") or claims.get("uid")
    email = claims.get("email") or (claims.get("user_metadata") or {}).get("email")
    if not sub:
        raise HTTPException(status_code=401, detail="Token sin 'sub'")

    return AuthUser(sub=sub, email=email, token=token)

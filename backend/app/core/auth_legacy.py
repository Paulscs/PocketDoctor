from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import jwt, jwk
from jose.utils import base64url_decode
import httpx
from .config import settings

_bearer = HTTPBearer(auto_error=False)
_jwks_cache = None

async def _jwks():
    global _jwks_cache
    if _jwks_cache is None:
        async with httpx.AsyncClient(timeout=10) as c:
            _jwks_cache = (await c.get(settings.SUPABASE_JWKS_URL)).json()
    return _jwks_cache

async def get_current_user(creds: HTTPAuthorizationCredentials = Depends(_bearer)):
    if not creds:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Missing token")
    token = creds.credentials
    headers = jwt.get_unverified_header(token)
    kid = headers.get("kid")
    key = next((k for k in (await _jwks())["keys"] if k["kid"] == kid), None)
    if not key:
        raise HTTPException(401, "Invalid token key")

    pk = jwk.construct(key)
    msg, sig = token.rsplit(".", 1)
    if not pk.verify(msg.encode(), base64url_decode(sig.encode())):
        raise HTTPException(401, "Invalid signature")

    claims = jwt.get_unverified_claims(token)
    if "sub" not in claims:
        raise HTTPException(401, "Invalid token")
    return {"uid": claims["sub"], "email": claims.get("email"), "claims": claims}

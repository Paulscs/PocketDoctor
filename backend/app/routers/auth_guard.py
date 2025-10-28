from fastapi import APIRouter, Depends
from app.core.security import get_current_user, AuthUser

router = APIRouter(prefix="/auth", tags=["auth"])

@router.get("/ping")
def public_ping():
    return {"ok": True, "scope": "public"}

@router.get("/protected-ping")
def protected_ping(user: AuthUser = Depends(get_current_user)):
    return {"ok": True, "scope": "protected", "sub": user.sub, "email": user.email}

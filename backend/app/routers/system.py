from fastapi import APIRouter

router = APIRouter(prefix="", tags=["system"])

@router.get("/health")
def health():
    return {"status": "ok"}

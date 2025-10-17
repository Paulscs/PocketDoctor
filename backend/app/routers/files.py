# app/routers/files.py
import uuid
from pathlib import Path
from typing import Optional

import httpx
from fastapi import APIRouter, Depends, File, HTTPException, UploadFile

from ..core.config import settings
from ..core.security import get_current_user, AuthUser

router = APIRouter(prefix="/files", tags=["files"])

ALLOWED_CONTENT_TYPES = {
    "application/pdf",
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/heic",
    "image/heif",
}
MAX_SIZE_BYTES = 10 * 1024 * 1024  # 10MB

def _object_name(user_sub: str, filename: str) -> str:
    ext = Path(filename).suffix.lower()  # e.g. ".pdf"
    return f"{user_sub}/{uuid.uuid4().hex}{ext}"

@router.post("/upload")
async def upload_file(
    file: UploadFile = File(...),
    user: AuthUser = Depends(get_current_user),
):
    # 1) Validaciones básicas
    if file.content_type not in ALLOWED_CONTENT_TYPES:
        raise HTTPException(status_code=415, detail=f"Tipo no permitido: {file.content_type}")

    data = await file.read()
    if len(data) > MAX_SIZE_BYTES:
        raise HTTPException(status_code=413, detail=f"Archivo supera {MAX_SIZE_BYTES//(1024*1024)}MB")

    object_name = _object_name(user.sub, file.filename)
    bucket = getattr(settings, "STORAGE_BUCKET", "uploads")

    # 2) Subir a Supabase Storage con el JWT del usuario
    upload_url = f"{settings.SUPABASE_URL}/storage/v1/object/{bucket}/{object_name}"
    headers = {
        "Authorization": f"Bearer {user.token}",  # MUY importante para que quede owner=auth.uid()
        "apikey": settings.SUPABASE_KEY,
        "Content-Type": file.content_type,
    }

    async with httpx.AsyncClient(timeout=30) as client:
        r = await client.post(upload_url, headers=headers, content=data)
        if r.status_code >= 400:
            raise HTTPException(status_code=400, detail=f"Error subiendo: {r.text}")

    # 3) Devolver URL
    # Si el bucket es público, puedes construir la public URL directamente:
    public_url = f"{settings.SUPABASE_URL}/storage/v1/object/public/{bucket}/{object_name}"

    # Si el bucket es privado, genera un signed URL por 1 hora:
    sign_url = f"{settings.SUPABASE_URL}/storage/v1/object/sign/{bucket}/{object_name}"
    signed_url: Optional[str] = None
    async with httpx.AsyncClient(timeout=15) as client:
        rs = await client.post(sign_url, headers=headers, json={"expiresIn": 3600})
        if rs.status_code < 400:
            signed_url = rs.json().get("signedURL")

    return {
        "bucket": bucket,
        "path": object_name,
        "mime": file.content_type,
        "size": len(data),
        "public_url": public_url,     # funcionará si el bucket es Public
        "signed_url": signed_url,     # funcionará si es Private (o ambos)
    }

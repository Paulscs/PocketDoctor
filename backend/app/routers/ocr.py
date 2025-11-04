from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from app.core.config import settings
from app.core.security import get_current_user, AuthUser
import httpx

router = APIRouter(prefix="/ocr", tags=["ocr"])

OPENOCR_URL = settings.OPENOCR_URL.rstrip("/")

@router.post("/from-url")
def ocr_from_url(
    image_url: str = Form(...),
    lang: str = Form("spa+eng"),
    user: AuthUser = Depends(get_current_user),
):
    """
    Envía un JSON a OpenOCR con img_url y devuelve el texto crudo.
    Requiere que la URL sea accesible por el servidor de OpenOCR.
    """
    payload = {
        "img_url": image_url,
        "engine": "tesseract",
        # OpenOCR acepta flags de tesseract; lang se envía como 'tesseract_lang'
        "tesseract_lang": lang
    }

    try:
        r = httpx.post(f"{OPENOCR_URL}/ocr", json=payload, timeout=60)
    except httpx.RequestError as e:
        raise HTTPException(502, f"OpenOCR no accesible: {e}")

    if r.status_code != 200:
        raise HTTPException(r.status_code, f"OpenOCR error: {r.text}")

    # OpenOCR responde texto plano con el OCR
    return {"text": r.text}


@router.post("/from-file")
def ocr_from_file(
    file: UploadFile = File(...),
    lang: str = Form("spa+eng"),
    user: AuthUser = Depends(get_current_user),
):
    """
    Sube archivo a OpenOCR usando multipart hacia /ocr-file-upload
    y devuelve el texto resultante.
    """
    files = {
        # campo 'file' con (filename, fileobj, mimetype)
        "file": (file.filename, file.file, file.content_type or "application/octet-stream"),
        # campo 'config' en JSON mínimo; OpenOCR parsea este multipart
        "config": (None, '{"engine":"tesseract","tesseract_lang":"%s"}' % lang, "application/json"),
    }

    try:
        r = httpx.post(f"{OPENOCR_URL}/ocr-file-upload", files=files, timeout=None)
    except httpx.RequestError as e:
        raise HTTPException(502, f"OpenOCR no accesible: {e}")

    if r.status_code != 200:
        raise HTTPException(r.status_code, f"OpenOCR error: {r.text}")

    return {"text": r.text}

# app/routers/auth.py
from fastapi import APIRouter, HTTPException
import httpx
from ..core.config import settings

router = APIRouter(prefix="/auth", tags=["auth"])

@router.post("/register")
async def register(payload: dict):
    """
    Crear usuario
    Espera: {
      "email": "...",
      "password": "...",
      "nombre": "...",       # opcional
      "apellido": "...",     # opcional
      "fecha_nacimiento": "YYYY-MM-DD",  # opcional
      "sexo": "M|F|U"        # opcional
    }
    Enviamos esos campos en 'data' para que tu TRIGGER los copie a public.usuarios.
    """
    email = payload.get("email")
    password = payload.get("password")
    if not email or not password:
        raise HTTPException(status_code=400, detail="email y password son requeridos")

    body = {
        "email": email,
        "password": password,
        "data": {
            "nombre": payload.get("nombre"),
            "apellido": payload.get("apellido"),
            "fecha_nacimiento": payload.get("fecha_nacimiento"),
            "sexo": payload.get("sexo"),
        },
    }
    url = f"{settings.SUPABASE_URL}/auth/v1/signup"
    headers = {"apikey": settings.SUPABASE_KEY, "Content-Type": "application/json"}

    async with httpx.AsyncClient(timeout=15) as client:
        r = await client.post(url, headers=headers, json=body)
        if r.status_code >= 400:
            # Supabase suele devolver detalle útil en el body
            raise HTTPException(status_code=400, detail=r.text)
        return {"ok": True, "message": "Usuario creado. Revisa tu correo si requiere verificación."}

@router.post("/login")
async def login(payload: dict):
    """
    Login por email/password contra Supabase Auth.
    Espera: { "email": "...", "password": "..." }
    Devuelve: { "access_token": "...", "token_type": "bearer" }
    """
    email = payload.get("email")
    password = payload.get("password")
    if not email or not password:
        raise HTTPException(status_code=400, detail="email y password son requeridos")

    url = f"{settings.SUPABASE_URL}/auth/v1/token?grant_type=password"
    headers = {"apikey": settings.SUPABASE_KEY, "Content-Type": "application/json"}
    body = {"email": email, "password": password}

    async with httpx.AsyncClient(timeout=15) as client:
        r = await client.post(url, headers=headers, json=body)
        if r.status_code >= 400:
            raise HTTPException(status_code=401, detail="Email o contraseña inválidos")
        data = r.json()
        return {"access_token": data.get("access_token"), "token_type": "bearer"}

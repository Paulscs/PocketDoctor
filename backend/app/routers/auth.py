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

import time

# Almacén en memoria para intentos fallidos
# Key: email (str)
# Value: dict { "count": int, "locked_until": float (timestamp) }
LOGIN_ATTEMPTS = {}

@router.post("/login")
async def login(payload: dict):
    """
    Login por email/password contra Supabase Auth.
    Maneja bloqueo de cuenta tras 5 intentos fallidos.
    """
    email = payload.get("email")
    password = payload.get("password")
    
    if not email or not password:
        raise HTTPException(status_code=400, detail="email y password son requeridos")

    # 0. Check de Enumeración de Usuarios (UX > Seguridad en MVP)
    if settings.SUPABASE_SERVICE_KEY:
        try:
            from supabase import create_client, Client
            admin_client: Client = create_client(settings.SUPABASE_URL, settings.SUPABASE_SERVICE_KEY)
            
            # Intentamos consultar 'usuarios' usando lista (más robusto que maybe_single)
            # res.data será [] si no existe
            res = admin_client.table("usuarios").select("id").eq("email", email).execute()
            
            # Si la lista está vacía -> No registrado
            if not res.data:
                 raise HTTPException(status_code=400, detail="Este correo no está registrado en el sistema.")
                 
        except HTTPException:
            raise
        except Exception as e:
            print(f"[Auth Login Debug] EXCEPTION en check de usuario: {e}")
            # Fallback a login normal

    # 1. Verificar si está bloqueado
    record = LOGIN_ATTEMPTS.get(email)
    if record:
        now = time.time()
        locked_until = record.get("locked_until", 0)
        
        if now < locked_until:
            remaining = int(locked_until - now)
            # Protocolo LOCKED:{segundos}
            raise HTTPException(
                status_code=429, 
                detail=f"LOCKED:{remaining}"
            )
            
    url = f"{settings.SUPABASE_URL}/auth/v1/token?grant_type=password"
    headers = {"apikey": settings.SUPABASE_KEY, "Content-Type": "application/json"}
    body = {"email": email, "password": password}

    async with httpx.AsyncClient(timeout=15) as client:
        r = await client.post(url, headers=headers, json=body)
        
        # 2. Manejo de respuesta
        if r.status_code >= 400:
            # Fallo el login
            if not record:
                record = {"count": 0, "locked_until": 0}
                LOGIN_ATTEMPTS[email] = record
            
            record["count"] += 1
            current_count = record["count"]
            
            # Lógica de bloqueo
            # Intento 5 -> Bloqueo 3 mins
            # Intento 6 -> Bloqueo 4 mins
            # Intento 7 -> Bloqueo 5 mins...
            if current_count >= 5:
                # 3 minutos base + 1 minuto extra por cada intento adicional
                extra_minutes = current_count - 5
                lockout_seconds = (3 + extra_minutes) * 60
                
                record["locked_until"] = time.time() + lockout_seconds
                
                # Devolvemos error de bloqueo INMEDIATAMENTE al fallar el 5to
                raise HTTPException(
                    status_code=429,
                    detail=f"LOCKED:{lockout_seconds}"
                )
            
            # Si es intento 1-4, devolvemos 401 normal
            # Opcional: Avisar cuantos quedan? Por ahora simple.
            raise HTTPException(status_code=401, detail="Email o contraseña inválidos")
            
        # Éxito
        data = r.json()
        
        # 3. Limpiar contador si existe
        if email in LOGIN_ATTEMPTS:
            LOGIN_ATTEMPTS.pop(email)
            
        return {
            "access_token": data.get("access_token"),
            "refresh_token": data.get("refresh_token"),
            "token_type": "bearer",
            "user": data.get("user") # Opcional, pero útil
        }

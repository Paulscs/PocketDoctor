# app/routers/historial.py
from fastapi import APIRouter, Depends, HTTPException
from supabase import create_client
from ..core.config import settings
from ..core.security import get_current_user, AuthUser
from ..core.permissions import ensure_admin_or_403
from ..schemas.historial import HistorialOut, HistorialUpdate

router = APIRouter(prefix="/historial", tags=["historial"])

def client_for_user(token: str):
    c = create_client(settings.SUPABASE_URL, settings.SUPABASE_KEY)
    c.postgrest.auth(token)  # importantísimo para RLS
    return c

def get_mi_usuario_id(c, user: AuthUser) -> int:
    # Evitar .single(): trae 0..1 y manejamos en Python
    resp = (
        c.table("usuarios")
         .select("id")
         .eq("user_auth_id", user.sub)
         .limit(1)
         .execute()
    )
    rows = resp.data or []
    if not rows:
        raise HTTPException(status_code=404, detail="Perfil no encontrado")
    return rows[0]["id"]

@router.get("/me", response_model=HistorialOut)
def get_my_historial(user: AuthUser = Depends(get_current_user)):
    c = client_for_user(user.token)
    usuario_id = get_mi_usuario_id(c, user)

    resp = (
        c.table("historial_medico")
         .select("*")
         .eq("usuario_id", usuario_id)
         .limit(1)
         .execute()
    )
    rows = resp.data or []
    if not rows:
        # No existe todavía: devuelve 404 (o si prefieres, crea vacío aquí)
        raise HTTPException(status_code=404, detail="Historial no encontrado")
    return rows[0]

@router.put("/me", response_model=HistorialOut)
def upsert_my_historial(payload: HistorialUpdate, user: AuthUser = Depends(get_current_user)):
    """
    Crea mi historial si no existe; si existe, actualiza (upsert manual).
    """
    c = client_for_user(user.token)
    usuario_id = get_mi_usuario_id(c, user)

    # ¿existe ya?
    check = (
        c.table("historial_medico")
         .select("id")
         .eq("usuario_id", usuario_id)
         .limit(1)
         .execute()
    )
    exists = bool(check.data)

    data = {k: v for k, v in payload.model_dump().items() if v is not None}

    if exists:
        # 1) UPDATE (sin .select())
        c.table("historial_medico").update(data).eq("usuario_id", usuario_id).execute()
    else:
        # 1) INSERT (sin .select())
        insert_payload = {"usuario_id": usuario_id, **data}
        c.table("historial_medico").insert(insert_payload).execute()

    # 2) LEER la fila actualizada/creada
    res = (
        c.table("historial_medico")
         .select("*")
         .eq("usuario_id", usuario_id)
         .limit(1)
         .execute()
    )
    rows = res.data or []
    if not rows:
        raise HTTPException(status_code=400, detail="No se pudo guardar el historial")
    return rows[0]


# ---- Endpoints de administración opcionales ----

@router.get("/{usuario_id}", response_model=HistorialOut)
def get_historial_by_usuario(usuario_id: int, user: AuthUser = Depends(get_current_user)):
    c = client_for_user(user.token)
    ensure_admin_or_403(c, user.sub)
    res = (
        c.table("historial_medico")
         .select("*")
         .eq("usuario_id", usuario_id)
         .limit(1)
         .execute()
    )
    rows = res.data or []
    if not rows:
        raise HTTPException(status_code=404, detail="Historial no encontrado")
    return rows[0]

@router.delete("/{usuario_id}", status_code=204)
def delete_historial_by_usuario(usuario_id: int, user: AuthUser = Depends(get_current_user)):
    c = client_for_user(user.token)
    ensure_admin_or_403(c, user.sub)
    c.table("historial_medico").delete().eq("usuario_id", usuario_id).execute()
    return

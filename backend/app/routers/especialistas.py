from fastapi import APIRouter, Depends, HTTPException, Query
from typing import Optional
from supabase import create_client
from ..core.config import settings
from ..core.security import get_current_user, AuthUser
from ..core.permissions import ensure_admin_or_403
from ..schemas.especialistas import EspecialistaCreate, EspecialistaUpdate, EspecialistaOut

router = APIRouter(prefix="/especialistas", tags=["especialistas"])

def client_for_user(token: str):
    c = create_client(settings.SUPABASE_URL, settings.SUPABASE_KEY)
    c.postgrest.auth(token)
    return c

@router.get("", response_model=list[EspecialistaOut])
def list_especialistas(
    q: Optional[str] = Query(None, description="Buscar por nombre"),
    limit: int = 20,
    offset: int = 0,
    user: AuthUser = Depends(get_current_user),
):
    c = client_for_user(user.token)
    query = c.table("especialistas").select("*")
    if q:
        # Buscar por nombre O apellido
        # Sintaxis postgrest: or=(col1.op.val,col2.op.val)
        query = query.or_(f"nombre.ilike.%{q}%,apellido.ilike.%{q}%")
    query = query.range(offset, offset + limit - 1)
    res = query.execute()
    return res.data or []

@router.get("/{especialista_id}", response_model=EspecialistaOut)
def get_especialista(especialista_id: int, user: AuthUser = Depends(get_current_user)):
    c = client_for_user(user.token)
    res = c.table("especialistas").select("*").eq("id", especialista_id).single().execute()
    if not res.data:
        raise HTTPException(status_code=404, detail="Especialista no encontrado")
    return res.data

@router.post("", response_model=EspecialistaOut, status_code=201)
def create_especialista(payload: EspecialistaCreate, user: AuthUser = Depends(get_current_user)):
    c = client_for_user(user.token)
    ensure_admin_or_403(c, user.sub)
    res = c.table("especialistas").insert(payload.model_dump()).select("*").single().execute()
    if not res.data:
        raise HTTPException(status_code=400, detail="No se pudo crear el especialista")
    return res.data

@router.put("/{especialista_id}", response_model=EspecialistaOut)
def update_especialista(especialista_id: int, payload: EspecialistaUpdate, user: AuthUser = Depends(get_current_user)):
    c = client_for_user(user.token)
    ensure_admin_or_403(c, user.sub)
    data = {k: v for k, v in payload.model_dump().items() if v is not None}
    res = (c.table("especialistas").update(data).eq("id", especialista_id)
             .select("*").single().execute())
    if not res.data:
        raise HTTPException(status_code=404, detail="Especialista no encontrado")
    return res.data

@router.delete("/{especialista_id}", status_code=204)
def delete_especialista(especialista_id: int, user: AuthUser = Depends(get_current_user)):
    c = client_for_user(user.token)
    ensure_admin_or_403(c, user.sub)
    c.table("especialistas").delete().eq("id", especialista_id).execute()
    return

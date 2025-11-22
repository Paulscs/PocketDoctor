from fastapi import APIRouter, Depends, HTTPException, Query
from typing import Optional
from supabase import create_client
from ..core.config import settings
from ..core.security import get_current_user, AuthUser
from ..core.permissions import ensure_admin_or_403
from ..schemas.centros import CentroCreate, CentroUpdate, CentroOut, EspecialistaCentro

router = APIRouter(prefix="/centros", tags=["centros_medicos"])

def client_for_user(token: str):
    c = create_client(settings.SUPABASE_URL, settings.SUPABASE_KEY)
    c.postgrest.auth(token)  # RLS con el token del usuario
    return c

@router.get("", response_model=list[CentroOut])
def list_centros(
    q: Optional[str] = Query(None, description="Buscar por nombre (contiene)"),
    ciudad: Optional[str] = None,
    provincia: Optional[str] = None,
    limit: int = 20,
    offset: int = 0,
    user: AuthUser = Depends(get_current_user),
):
    c = client_for_user(user.token)
    query = c.table("centros_medicos").select("*")

    if q:
        query = query.ilike("nombre", f"%{q}%")
    if ciudad:
        query = query.ilike("ciudad", f"%{ciudad}%")
    if provincia:
        query = query.ilike("provincia", f"%{provincia}%")

    query = query.range(offset, offset + limit - 1)
    res = query.execute()
    return res.data or []

@router.get("/{centro_id}", response_model=CentroOut)
def get_centro(centro_id: int, user: AuthUser = Depends(get_current_user)):
    c = client_for_user(user.token)
    res = c.table("centros_medicos").select("*").eq("id", centro_id).single().execute()
    if not res.data:
        raise HTTPException(status_code=404, detail="Centro no encontrado")
    return res.data

@router.get("/{centro_id}/especialistas", response_model=list[EspecialistaCentro])
def list_especialistas_centro(centro_id: int, user: AuthUser = Depends(get_current_user)):
    c = client_for_user(user.token)
    res = c.table("v_especialistas_centros").select("*").eq("centro_id", centro_id).execute()
    return res.data or []

@router.post("", response_model=CentroOut, status_code=201)
def create_centro(payload: CentroCreate, user: AuthUser = Depends(get_current_user)):
    c = client_for_user(user.token)
    ensure_admin_or_403(c, user.sub)
    res = c.table("centros_medicos").insert(payload.model_dump()).select("*").single().execute()
    if not res.data:
        raise HTTPException(status_code=400, detail="No se pudo crear el centro")
    return res.data

@router.put("/{centro_id}", response_model=CentroOut)
def update_centro(centro_id: int, payload: CentroUpdate, user: AuthUser = Depends(get_current_user)):
    c = client_for_user(user.token)
    ensure_admin_or_403(c, user.sub)
    data = {k: v for k, v in payload.model_dump().items() if v is not None}
    res = c.table("centros_medicos").update(data).eq("id", centro_id).select("*").single().execute()
    if not res.data:
        raise HTTPException(status_code=404, detail="Centro no encontrado")
    return res.data

@router.delete("/{centro_id}", status_code=204)
def delete_centro(centro_id: int, user: AuthUser = Depends(get_current_user)):
    c = client_for_user(user.token)
    ensure_admin_or_403(c, user.sub)
    # devolvemos 204 aunque borre 0 filas para no filtrar existencia
    c.table("centros_medicos").delete().eq("id", centro_id).execute()
    return

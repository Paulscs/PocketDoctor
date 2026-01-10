from fastapi import APIRouter, Depends, HTTPException, Query
import math # Added for haversine
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

@router.get("/nearest", response_model=list[CentroOut])
def get_nearest_centros(
    lat: float,
    lng: float,
    limit: int = 5,
    specialty: Optional[str] = None,
    user: AuthUser = Depends(get_current_user)
):
    """
    Retorna las clínicas más cercanas ordenadas por distancia (Haversine).
    Opcionalmente filtra por especialidad disponible.
    """
    c = client_for_user(user.token)
    
    # 1. Traer todas las clínicas
    res = c.table("centros_medicos").select("*").execute()
    centros = res.data or []

    # 2. Filtrar por especialidad si se requiere
    # (Hacemos esto antes del sort para eficiencia básica, aunque después de fetch por limitación de ORM/View)
    if specialty and centros:
        try:
            # Consultamos la vista de especialistas para encontrar qué centros tienen la especialidad
            sp_res = c.table("v_especialistas_centros").select("*").execute()
            valid_ids = set()
            normalized_query = specialty.lower().strip()
            
            # Map centro_id -> list[EspecialistaCentro]
            specialists_by_center = {}

            for row in sp_res.data:
                esp = row.get('especialidad')
                matches = False
                # Manejo robusto: puede ser lista o string dependiendo de la vista
                if isinstance(esp, list):
                    # Búsqueda fuzzy simple en la lista
                    if any(normalized_query in s.lower() for s in esp):
                        matches = True
                elif isinstance(esp, str):
                    if normalized_query in esp.lower():
                        matches = True
                
                if matches:
                    cid = row['centro_id']
                    valid_ids.add(cid)
                    if cid not in specialists_by_center:
                        specialists_by_center[cid] = []
                    specialists_by_center[cid].append(row)
            
            # Filtramos la lista de centros y adjuntamos especialistas
            search_results = []
            for centro in centros:
                if centro['id'] in valid_ids:
                    # Inject specialists
                    centro['especialistas'] = specialists_by_center.get(centro['id'], [])
                    search_results.append(centro)
            
            centros = search_results
            
        except Exception as e:
            print(f"[Nearest Error] Filtering specialty failed: {e}")
            import traceback
            traceback.print_exc()
            pass

    if not centros:
        return []

    # 3. Función Haversine
    def get_distance(centro):
        loc = centro.get("ubicacion_geografica")
        if not loc:
            return float('inf')
        try:
            # Formato esperado: "(18.4861,-69.9312)"
            clean = loc.replace('(', '').replace(')', '')
            parts = clean.split(',')
            c_lat = float(parts[0])
            c_lng = float(parts[1])

            R = 6371  # Radio tierra km
            d_lat = math.radians(c_lat - lat)
            d_lng = math.radians(c_lng - lng)
            a = (math.sin(d_lat / 2) ** 2 +
                 math.cos(math.radians(lat)) * math.cos(math.radians(c_lat)) *
                 math.sin(d_lng / 2) ** 2)
            c_dist = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
            return R * c_dist
        except Exception:
            return float('inf')

    # 4. Ordenar
    centros.sort(key=get_distance)

    return centros[:limit]
@router.get("/{centro_id}", response_model=CentroOut)
def get_centro(centro_id: int, user: AuthUser = Depends(get_current_user)):
    c = client_for_user(user.token)
    res = c.table("centros_medicos").select("*").eq("id", centro_id).single().execute()
    if not res.data:
        raise HTTPException(status_code=404, detail="Centro no encontrado")
        
    # Populate specialists (same logic as nearest or lazy load?)
    # For detail view, it makes sense to return them.
    centro = res.data
    # Fetch specialists
    sp_res = c.table("v_especialistas_centros").select("*").eq("centro_id", centro_id).execute()
    centro['especialistas'] = sp_res.data or []
    
    return centro

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

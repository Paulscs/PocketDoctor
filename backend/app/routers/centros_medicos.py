from fastapi import APIRouter, HTTPException, Path
from typing import List, Dict, Any
from ..core.supabase_client import supabase
from ..schemas.centros_medicos import CentroMedicoIn, CentroMedicoOut

router = APIRouter(prefix="/centros-medicos", tags=["centros_medicos"])

TABLE = "centros_medicos"

@router.get("", response_model=List[CentroMedicoOut])
def list_centros():
    try:
        resp = supabase.table(TABLE).select("*").order("id", desc=False).execute()
        return resp.data or []
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al listar: {e}")

@router.get("/{id}", response_model=CentroMedicoOut)
def get_centro(id: int = Path(..., gt=0)):
    try:
        resp = supabase.table(TABLE).select("*").eq("id", id).execute()
        rows = resp.data or []
        if not rows:
            raise HTTPException(status_code=404, detail="No encontrado")
        return rows[0]
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al obtener: {e}")

@router.post("", response_model=CentroMedicoOut, status_code=201)
def create_centro(payload: CentroMedicoIn):
    try:
        resp = supabase.table(TABLE).insert(payload.dict()).execute()
        if not resp.data:
            raise HTTPException(status_code=500, detail="No se pudo crear")
        return resp.data[0]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al crear: {e}")

@router.put("/{id}", response_model=CentroMedicoOut)
def update_centro(id: int = Path(..., gt=0), payload: CentroMedicoIn = ...):
    try:
        resp = supabase.table(TABLE).update(payload.dict()).eq("id", id).execute()
        rows = resp.data or []
        if not rows:
            raise HTTPException(status_code=404, detail="No encontrado")
        return rows[0]
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al actualizar: {e}")

@router.delete("/{id}", response_model=Dict[str, Any])
def delete_centro(id: int = Path(..., gt=0)):
    try:
        resp = supabase.table(TABLE).delete().eq("id", id).execute()
        rows = resp.data or []
        if not rows:
            raise HTTPException(status_code=404, detail="No encontrado")
        return {"deleted": True, "id": id}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al eliminar: {e}")

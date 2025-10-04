from fastapi import APIRouter, HTTPException
from typing import List
from ..core.supabase_client import supabase
from ..schemas.clinicas import ClinicaOut

router = APIRouter(prefix="/clinicas", tags=["clinicas"])

@router.get("", response_model=List[ClinicaOut])
def list_clinicas():
    try:
        resp = supabase.table("clinicas").select("*").order("id", desc=False).execute()
        return resp.data or []
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al listar clínicas: {e}")

# app/schemas/historial.py
from pydantic import BaseModel
from typing import Optional

class HistorialBase(BaseModel):
    condiciones_previas: Optional[str] = None
    alergias: Optional[str] = None
    tipo_sangre: Optional[str] = None
    raza: Optional[str] = None  # si no lo usarás, puedes quitarlo

class HistorialOut(HistorialBase):
    id: int
    usuario_id: int
    fecha_actualizacion: str
    estado: bool

class HistorialUpdate(HistorialBase):
    # todos opcionales; haremos upsert si no existe
    pass

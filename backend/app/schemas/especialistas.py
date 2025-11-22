from pydantic import BaseModel
from typing import Optional, List

class EspecialistaBase(BaseModel):
    nombre: str
    apellido: Optional[str] = None
    especialidad: Optional[List[str]] = None
    ubicacion_geografica: Optional[str] = None
    contacto: Optional[str] = None
    disponibilidad: Optional[dict] = None  # jsonb

class EspecialistaCreate(EspecialistaBase):
    pass

class EspecialistaUpdate(BaseModel):
    nombre: Optional[str] = None
    apellido: Optional[str] = None
    especialidad: Optional[List[str]] = None
    ubicacion_geografica: Optional[str] = None
    contacto: Optional[str] = None
    disponibilidad: Optional[dict] = None
    estado: Optional[bool] = None

class EspecialistaOut(EspecialistaBase):
    id: int
    estado: bool

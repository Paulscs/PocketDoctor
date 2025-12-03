from pydantic import BaseModel
from typing import Optional, List

class EspecialistaCentro(BaseModel):
    especialista_id: int
    nombre: str
    apellido: str
    especialidad: Optional[List[str]] = None
    contacto: Optional[str] = None
    centro_id: int

class CentroBase(BaseModel):
    nombre: str
    direccion: Optional[str] = None
    telefono: Optional[str] = None
    ciudad: Optional[str] = None
    provincia: Optional[str] = None
    rnc: Optional[str] = None
    ubicacion_geografica: Optional[str] = None

class CentroCreate(CentroBase):
    pass

class CentroUpdate(BaseModel):
    nombre: Optional[str] = None
    direccion: Optional[str] = None
    telefono: Optional[str] = None
    ciudad: Optional[str] = None
    provincia: Optional[str] = None
    rnc: Optional[str] = None
    ubicacion_geografica: Optional[str] = None
    estado: Optional[bool] = None

class CentroOut(CentroBase):
    id: int
    estado: bool

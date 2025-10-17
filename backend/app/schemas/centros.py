from pydantic import BaseModel
from typing import Optional

class CentroBase(BaseModel):
    nombre: str
    direccion: Optional[str] = None
    telefono: Optional[str] = None
    ciudad: Optional[str] = None
    provincia: Optional[str] = None
    rnc: Optional[str] = None

class CentroCreate(CentroBase):
    pass

class CentroUpdate(BaseModel):
    nombre: Optional[str] = None
    direccion: Optional[str] = None
    telefono: Optional[str] = None
    ciudad: Optional[str] = None
    provincia: Optional[str] = None
    rnc: Optional[str] = None
    estado: Optional[bool] = None

class CentroOut(CentroBase):
    id: int
    estado: bool

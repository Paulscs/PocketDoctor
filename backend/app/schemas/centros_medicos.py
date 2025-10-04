from pydantic import BaseModel, Field
from typing import Optional

class CentroMedicoIn(BaseModel):
    nombre: str = Field(..., min_length=2, max_length=160)
    direccion: Optional[str] = Field(default=None, max_length=200)
    telefono: Optional[str] = Field(default=None, max_length=50)
    ciudad: Optional[str] = Field(default=None, max_length=100)
    provincia: Optional[str] = Field(default=None, max_length=100)

class CentroMedicoOut(CentroMedicoIn):
    id: int

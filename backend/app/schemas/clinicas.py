from pydantic import BaseModel, Field
from typing import Optional

class ClinicaIn(BaseModel):
    nombre: str = Field(..., min_length=2, max_length=120)
    especialidad: str = Field(..., min_length=2, max_length=120)
    ubicacion: Optional[str] = Field(default=None, max_length=200)
    contacto: Optional[str] = Field(default=None, max_length=100)

class ClinicaOut(ClinicaIn):
    id: int

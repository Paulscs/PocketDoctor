from typing import Optional
from pydantic import BaseModel

class UserProfile(BaseModel):
    id: int
    user_auth_id: str
    nombre: Optional[str] = None
    apellido: Optional[str] = None
    email: str
    fecha_nacimiento: Optional[str] = None
    sexo: Optional[str] = None
    ubicacion: Optional[str] = None
    fecha_registro: str
    estado: bool

class UserProfileUpdate(BaseModel):
    nombre: Optional[str] = None
    apellido: Optional[str] = None
    fecha_nacimiento: Optional[str] = None  # ISO: "YYYY-MM-DD"
    sexo: Optional[str] = None              # "M" | "F" | "U" (según tu convención)

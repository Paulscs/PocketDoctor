from typing import Optional, List
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
    altura_cm: Optional[int] = None
    peso_kg: Optional[float] = None
    alergias: Optional[List[str]] = None
    condiciones_medicas: Optional[List[str]] = None

class UserProfileUpdate(BaseModel):
    peso_kg: Optional[float] = None
    alergias: Optional[List[str]] = None
    condiciones_medicas: Optional[List[str]] = None

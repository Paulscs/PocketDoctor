from fastapi import APIRouter, Depends, HTTPException
from supabase import create_client, Client
from app.core.config import settings
from app.core.security import get_current_user, AuthUser
from app.schemas.user import UserProfile, UserProfileUpdate

router = APIRouter(prefix="/users", tags=["users"])

def supabase_client_for_user(access_token: str) -> Client:
    client: Client = create_client(settings.SUPABASE_URL, settings.SUPABASE_KEY)
    client.postgrest.auth(access_token)
    return client

@router.get("/me", response_model=UserProfile)
async def get_me(user: AuthUser = Depends(get_current_user)):
    client = supabase_client_for_user(user.token)

    resp = client.table("usuarios").select("*").eq("user_auth_id", user.sub).single().execute()
    data = resp.data
    if not data:
        raise HTTPException(status_code=404, detail="Perfil no encontrado")

    if isinstance(data.get("ubicacion"), dict) and "x" in data["ubicacion"]:
        data["ubicacion"] = f'({data["ubicacion"]["x"]}, {data["ubicacion"]["y"]})'
    return data

@router.put("/me", response_model=UserProfile)
async def update_me(payload: UserProfileUpdate, user: AuthUser = Depends(get_current_user)):
    """
    Actualiza SOLO los campos enviados en el body (peso_kg, alergias, condiciones_medicas).
    Seguridad: RLS en `usuarios` debe permitir UPDATE únicamente a tu propia fila:
      create policy "usuarios_update_own"
        on public.usuarios for update
        using (user_auth_id = auth.uid());
    """
    client = supabase_client_for_user(user.token)

    # Construimos el dict con solo los campos presentes (no-None)
    to_update = {k: v for k, v in payload.model_dump().items() if v is not None}
    # Convertir peso_kg a int si es float
    if 'peso_kg' in to_update and isinstance(to_update['peso_kg'], float):
        to_update['peso_kg'] = int(to_update['peso_kg'])

    if not to_update:
        # Si no enviaste nada, devolvemos el perfil actual (no error)
        current = client.table("usuarios").select("*").eq("user_auth_id", user.sub).single().execute().data
        if not current:
            raise HTTPException(status_code=404, detail="Perfil no encontrado")
        if isinstance(current.get("ubicacion"), dict) and "x" in current["ubicacion"]:
            current["ubicacion"] = f'({current["ubicacion"]["x"]}, {current["ubicacion"]["y"]})'
        return current

    # UPDATE con filtro por user_auth_id; RLS evitará que actualices otra fila
    client.table("usuarios").update(to_update).eq("user_auth_id", user.sub).execute()

    # Obtener el perfil actualizado
    resp = client.table("usuarios").select("*").eq("user_auth_id", user.sub).single().execute()
    data = resp.data
    if not data:
        raise HTTPException(status_code=404, detail="Perfil no encontrado")

    if isinstance(data.get("ubicacion"), dict) and "x" in data["ubicacion"]:
        data["ubicacion"] = f'({data["ubicacion"]["x"]}, {data["ubicacion"]["y"]})'
    return data

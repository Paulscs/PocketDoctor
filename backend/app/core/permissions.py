# backend/app/core/permissions.py
from fastapi import HTTPException

def ensure_admin_or_403(client, user_sub: str):
    """
    Verifica en public.usuarios que auth.uid() (user_sub) tenga es_admin = true.
    Usa el mismo client con RLS (ya autenticado con el token del usuario).
    """
    row = (client.table("usuarios")
                .select("id, es_admin")
                .eq("user_auth_id", user_sub)
                .single()
                .execute()
                .data)
    if not row or not row.get("es_admin"):
        raise HTTPException(status_code=403, detail="Se requieren permisos de administrador")

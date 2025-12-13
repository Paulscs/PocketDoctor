# backend/app/routers/parse_llm.py

from fastapi import APIRouter, Body, HTTPException
import json
import re
import google.generativeai as genai
from datetime import date

from .ocr_local import (
    LLMParseRequest,
    LLMInterpretation,
    gemini_configured,
    LLM_PARSER_SYSTEM_PROMPT,
)
from app.core.security import get_current_user, AuthUser
from app.core.config import settings
from supabase import create_client
from fastapi import Depends

# Helper to get user ID
def get_mi_usuario_id(c, user: AuthUser) -> int:
    resp = (
        c.table("usuarios")
         .select("id")
         .eq("user_auth_id", user.sub)
         .limit(1)
         .execute()
    )
    rows = resp.data or []
    if not rows:
        # Fallback or error
        return None
    return rows[0]["id"]


router = APIRouter(prefix="/ocr-local", tags=["OCR Analysis"])


def extract_json_from_text(text: str) -> str:
    """
    Extrae el JSON de una respuesta del modelo Gemini.
    Maneja casos donde viene mezclado con texto o envuelto en ```json.
    """
    try:
        # Intento 1: Buscar contenido entre llaves completas
        match = re.search(r"(\{.*\})", text, re.DOTALL)
        if match:
            return match.group(1)

        # Intento 2: Limpiar marcas tipo ```json
        cleaned = text.replace("```json", "").replace("```", "").strip()
        return cleaned

    except Exception:
        return text


@router.post("/parse-llm", response_model=LLMInterpretation)
async def parse_with_llm(
    payload: LLMParseRequest = Body(...),
    user: AuthUser = Depends(get_current_user)
):
    """
    Usa Google Gemini para interpretar los resultados médicos.
    """
    if not gemini_configured:
        raise HTTPException(
            status_code=500,
            detail="La IA no está configurada en el servidor (falta GOOGLE_API_KEY en .env)",
        )

    user_content = {
        "ocr_text": payload.ocr_text,
        "patient_profile": payload.patient_profile.dict() if payload.patient_profile else None,
        "draft_analysis_input": payload.draft_analysis_input.dict()
        if payload.draft_analysis_input
        else None,
    }

    try:
        model = genai.GenerativeModel(
            model_name="gemini-2.5-flash",
            system_instruction=LLM_PARSER_SYSTEM_PROMPT,
        )

        generation_config = genai.GenerationConfig(
            response_mime_type="application/json",
            temperature=0.1,
        )

        response = model.generate_content(
            json.dumps(user_content, ensure_ascii=False),
            generation_config=generation_config,
        )

        raw_text = response.text
        json_str = extract_json_from_text(raw_text)

        try:
            data = json.loads(json_str)
        except json.JSONDecodeError as e:
            print("--------------------------------------------------")
            print("ERROR PARSEANDO JSON DE GEMINI:")
            print(f"Final del texto recibido: ...{raw_text[-200:]}")
            print(f"Error: {e}")
            print("--------------------------------------------------")

            raise HTTPException(
                status_code=500,
                detail="La IA devolvió un formato inválido o incompleto (JSON cortado).",
            )

        llm_result = LLMInterpretation(**data)

        # ------------------------------------------------------------------
        # GUARDAR EN HISTORIAL (Supabase)
        # ------------------------------------------------------------------
        try:
            # 1. Init Client con token de usuario
            sb = create_client(settings.SUPABASE_URL, settings.SUPABASE_KEY)
            sb.postgrest.auth(user.token)
            
            # 2. Obtener ID del usuario (tabla usuarios)
            user_db_id = get_mi_usuario_id(sb, user)
            
            if user_db_id:
                # 3. Determinar estado y título
                # Estado simple: si hay warnings -> "alert", sino "normal"
                status = "alert" if llm_result.warnings else "normal"
                
                # Título: usamos fecha o tipo
                # Título: usamos fecha actual de análisis
                date_str = date.today().strftime("%Y-%m-%d")
                title = f"Análisis - {date_str}"

                # 4. Insertar en tabla 'analisis_ia'
                # Schema esperado en DB:
                # id, usuario_id, titulo, tipo, estado, resumen, datos_completos, created_at
                record = {
                    "usuario_id": user_db_id,
                    "titulo": title,
                    "tipo": "blood", # Default hardcoded por ahora, podriamos inferirlo
                    "estado": status,
                    "resumen": llm_result.summary,
                    "datos_completos": data # Guardamos todo el JSON raw
                }
                
                sb.table("analisis_ia").insert(record).execute()
                print(f"[History] Análisis guardado para user_id {user_db_id}")
            else:
                print(f"[History] No se encontró usuario_id para {user.sub}, no se guardó historial")

        except Exception as e:
            print(f"[History] Error guardando historial: {e}")
            # No fallamos el request principal si falla el guardado
            # pass 

        return llm_result

    except HTTPException:
        raise

    except Exception as e:
        print(f"Error Gemini General: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Error interno al procesar con Gemini: {str(e)}",
        )

@router.get("/history", response_model=list)
def get_analysis_history(user: AuthUser = Depends(get_current_user)):
    """
    Obtiene el historial de análisis del usuario.
    """
    try:
        sb = create_client(settings.SUPABASE_URL, settings.SUPABASE_KEY)
        sb.postgrest.auth(user.token)
        
        user_db_id = get_mi_usuario_id(sb, user)
        if not user_db_id:
            return []

        # Query a analisis_ia
        resp = (
            sb.table("analisis_ia")
              .select("*")
              .eq("usuario_id", user_db_id)
              .order("created_at", desc=True)
              .execute()
        )
        return resp.data or []
    except Exception as e:
        print(f"[History] Error fetching history: {e}")
        raise HTTPException(status_code=500, detail="Error obteniendo historial")

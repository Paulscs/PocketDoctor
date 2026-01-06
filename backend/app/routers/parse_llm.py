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


def split_text_into_chunks(text: str, max_lines=60, overlap=5) -> list[str]:
    lines = text.split('\n')
    chunks = []
    start = 0
    while start < len(lines):
        end = start + max_lines
        chunk_lines = lines[start:end]
        chunks.append('\n'.join(chunk_lines))
        start += (max_lines - overlap)
        if start >= len(lines):
            break
    return chunks

@router.post("/parse-llm", response_model=LLMInterpretation)
async def parse_with_llm(
    payload: LLMParseRequest = Body(...),
    user: AuthUser = Depends(get_current_user)
):
    """
    Usa Google Gemini en DOS PASOS (con Chunking) para interpretar los resultados médicos evitando truncamiento.
    Paso 1: Extracción por trozos (Chunking) y fusión.
    Paso 2: Análisis médico sobre datos fusionados.
    """
    if not gemini_configured:
        raise HTTPException(
            status_code=500,
            detail="La IA no está configurada en el servidor (falta GOOGLE_API_KEY en .env)",
        )

    # ---------------------------------------------------------
    # PASO 1: EXTRACCIÓN DE DATOS (OCR -> Structured Data)
    # ---------------------------------------------------------
    from .ocr_local import LLM_EXTRACTION_PROMPT, LLM_ANALYSIS_PROMPT

    # Usamos gemini-2.5-flash (segun usuario)
    model_extraction = genai.GenerativeModel(
        model_name="gemini-2.5-flash", 
        system_instruction=LLM_EXTRACTION_PROMPT,
    )
    
    # DIVIDIR TEXTO EN CHUNKS (Estabilidad: 60 líneas)
    ocr_chunks = split_text_into_chunks(payload.ocr_text, max_lines=60, overlap=5)
    print(f"[Gemini] Paso 1: Iniciando extracción PARALELA por Chunks. Total chunks: {len(ocr_chunks)}")

    # Función auxiliar para procesar un chunk individualmente
    async def process_chunk(index: int, chunk_text: str):
        print(f"[Gemini] Lanzando Chunk {index+1}...")
        chunk_content = {
            "ocr_text": chunk_text,
            "input_profile": payload.patient_profile.dict() if payload.patient_profile else None
        }
        
        # Retry loop por chunk (Temp 0.1 -> 0.4 -> 0.9)
        # 0.9 es la "bala de plata" para romper bucles de error sintáctico
        chunk_temperatures = [0.1, 0.4, 0.9]
        for attempt, temp in enumerate(chunk_temperatures):
            try:
                # generate_content es sincrono, pero lo envolvemos en to_thread si bloquea, 
                # o confiamos en que fastAPI maneje threads. 
                # Nota: Google GenAI 'generate_content_async' es lo ideal si existe,
                # pero si no, usamos generate_content en un threadpool para no bloquear el loop.
                response_ext = await  genai.GenerativeModel("gemini-2.5-flash", system_instruction=LLM_EXTRACTION_PROMPT).generate_content_async(
                    json.dumps(chunk_content, ensure_ascii=False),
                    generation_config=genai.GenerationConfig(
                        response_mime_type="application/json",
                        temperature=temp,
                        max_output_tokens=8192,
                    )
                )
                
                json_ext = extract_json_from_text(response_ext.text)
                data = json.loads(json_ext)
                print(f"[Gemini] Chunk {index+1} FINALIZADO (Intento {attempt+1})")
                return data
            except Exception as e:
                print(f"[Gemini] Error Chunk {index+1} Intento {attempt+1}: {e}")
        
        print(f"[Gemini] Advertencia: Chunk {index+1} FALLÓ tras reintentos.")
        return None

    # Ejecutar todos los chunks en paralelo
    import asyncio
    tasks = [process_chunk(i, chunk) for i, chunk in enumerate(ocr_chunks)]
    chunk_results = await asyncio.gather(*tasks)

    accumulated_results = []
    final_patient_profile = None
    final_lab_metadata = None

    # Procesar resultados
    for i, chunk_data in enumerate(chunk_results):
        if chunk_data and "analysis_input" in chunk_data:
            inp = chunk_data["analysis_input"]
            
            # Acumular resultados
            if "lab_results" in inp and isinstance(inp["lab_results"], list):
                accumulated_results.extend(inp["lab_results"])
            
            # Guardamos el primer perfil valido
            if not final_patient_profile and inp.get("patient_profile"):
                 final_patient_profile = inp["patient_profile"]
            
            if not final_lab_metadata and inp.get("lab_metadata"):
                final_lab_metadata = inp["lab_metadata"]

    print(f"[Gemini] Paso 1 Completado. Total resultados extraídos: {len(accumulated_results)}")

    if not accumulated_results and not final_patient_profile:
         raise HTTPException(status_code=500, detail="La IA no pudo extraer datos de ninguna sección del documento.")

    # Construir objeto unificado
    if not final_patient_profile:
        final_patient_profile = payload.patient_profile.dict() if payload.patient_profile else {}

    analysis_input_obj = {
        "patient_profile": final_patient_profile,
        "lab_metadata": final_lab_metadata or {},
        "lab_results": accumulated_results
    }


    # ---------------------------------------------------------
    # PASO 2: ANÁLISIS MÉDICO (Structured Data -> Insights)
    # ---------------------------------------------------------
    print("[Gemini] Inicio Paso 2: Análisis médico...")
    
    model_analysis = genai.GenerativeModel(
        model_name="gemini-2.5-flash", 
        system_instruction=LLM_ANALYSIS_PROMPT,
    )

    analysis_payload = {
        "lab_results_structured": analysis_input_obj
    }

    final_analysis = None
    try:
        response_ana = model_analysis.generate_content(
            json.dumps(analysis_payload, ensure_ascii=False),
            generation_config=genai.GenerationConfig(
                response_mime_type="application/json",
                temperature=0.2, # Un poco de creatividad para explicaciones
                max_output_tokens=8192,
            )
        )
        json_ana = extract_json_from_text(response_ana.text)
        final_analysis = json.loads(json_ana)
        print("[Gemini] Paso 2 Completado. Análisis generado.")

    except Exception as e:
        print(f"[Gemini] Error en Paso 2 (Análisis): {e}")
        # Si falla el análisis, devolvemos al menos los datos con un error en el resumen
        final_analysis = {
            "summary": "Error generando análisis detallado, pero se extrajeron los datos.",
            "warnings": [],
            "recommendations": [],
            "qa": {},
            "disclaimer": "Error parcial en IA."
        }

    # ---------------------------------------------------------
    # MERGE Y RETORNO
    # ---------------------------------------------------------
    
    # Sanitización de QA (doctor_questions a veces viene como lista)
    qa_data = final_analysis.get("qa", None)
    if qa_data and isinstance(qa_data, dict):
        dq = qa_data.get("doctor_questions")
        if isinstance(dq, list):
            # Convertimos lista a string
            qa_data["doctor_questions"] = "\n".join([str(q) for q in dq])
            
    # Construimos el objeto final combinando ambos
    full_response = LLMInterpretation(
        analysis_input=analysis_input_obj, # Del paso 1
        summary=final_analysis.get("summary", "Sin resumen"), # Del paso 2
        warnings=final_analysis.get("warnings", []),
        recommendations=final_analysis.get("recommendations", []),
        qa=qa_data,
        disclaimer=final_analysis.get("disclaimer", "IA generated")
    )

    # ------------------------------------------------------------------
    # GUARDAR EN HISTORIAL (Supabase) - Lógica existente mantenida
    # ------------------------------------------------------------------
    try:
        sb = create_client(settings.SUPABASE_URL, settings.SUPABASE_KEY)
        sb.postgrest.auth(user.token)
        user_db_id = get_mi_usuario_id(sb, user)
        
        if user_db_id:
            status = "alert" if full_response.warnings else "normal"
            date_str = date.today().strftime("%Y-%m-%d")
            title = f"Análisis - {date_str}"

            record = {
                "usuario_id": user_db_id,
                "titulo": title,
                "tipo": "blood",
                "estado": status,
                "resumen": full_response.summary,
                "datos_completos": final_analysis # Guardamos insights, los datos crudos ya están en analysis_input si quisiéramos
            }
            # Guardamos un JSON mixto o solo lo que quepa. Idealmente todo full_response.dict()
            # Ajuste: guardamos full_response mas completo con serialización JSON segura (para fechas)
            record["datos_completos"] = json.loads(full_response.json())

            sb.table("analisis_ia").insert(record).execute()
            print(f"[History] Análisis guardado para user_id {user_db_id}")
    except Exception as e:
        import traceback
        traceback.print_exc()
        print(f"[History] Error GUARDANDO historial: {e}")

    return full_response

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

@router.delete("/history/{item_id}", status_code=204)
def delete_analysis_history(item_id: str, user: AuthUser = Depends(get_current_user)):
    """
    Elimina un item del historial de análisis.
    """
    try:
        sb = create_client(settings.SUPABASE_URL, settings.SUPABASE_KEY)
        sb.postgrest.auth(user.token)
        
        user_db_id = get_mi_usuario_id(sb, user)
        if not user_db_id:
            raise HTTPException(status_code=404, detail="Usuario no encontrado")

        # Execute Delete with ownership check
        sb.table("analisis_ia").delete().eq("id", item_id).eq("usuario_id", user_db_id).execute()
        
        return
    except Exception as e:
        print(f"[History] Error deleting history item {item_id}: {e}")
        raise HTTPException(status_code=500, detail="Error eliminando el análisis")

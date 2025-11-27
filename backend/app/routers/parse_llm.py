# backend/app/routers/parse_llm.py

from fastapi import APIRouter, Body, HTTPException
import json
import re

# Importamos las configuraciones y modelos desde ocr_local
from .ocr_local import (
    LLMParseRequest,
    LLMInterpretation,
    DEEPSEEK_API_KEY,
    llm_client,
)

router = APIRouter(
    prefix="/ocr-local",
    tags=["OCR + LLM"],
)

# Prompt del sistema (sin cambios)
LLM_PARSER_SYSTEM_PROMPT = """
Eres un asistente médico digital experto (DeepSeek V3). Tu tarea es analizar texto OCR y devolver UNICAMENTE un objeto JSON válido.

Reglas ESTRICTAS:
1. NO escribas introducciones, ni conclusiones, ni bloques de código markdown (```json).
2. Devuelve solo el JSON crudo.
3. Si el OCR tiene errores obvios, corrígelos en el JSON.
4. Tu respuesta debe empezar con '{' y terminar con '}'.
5. Sigue estrictamente este esquema:

{
  "analysis_input": {
    "patient_profile": {
      "age": int | null,
      "sex": "M" | "F" | null,
      "weight_kg": float | null,
      "height_cm": float | null,
      "conditions": [string],
      "medications": [string]
    },
    "lab_metadata": {
      "collection_date": "YYYY-MM-DD" | null,
      "lab_name": string | null
    },
    "lab_results": [
      {
        "group": string | null,
        "name": string,
        "code": string | null,
        "value": float | null,
        "unit": string | null,
        "ref_low": float | null,
        "ref_high": float | null,
        "status": "bajo" | "normal" | "alto" | null,
        "flag_from_lab": string | null,
        "line": string
      }
    ]
  },
  "summary": "Resumen en español...",
  "warnings": ["Warning 1", ...],
  "disclaimer": "Este análisis es generado por IA y no sustituye el consejo médico profesional."
}
"""

def extract_json_from_text(text: str) -> str:
    """
    Busca el primer '{' y el último '}' para extraer solo el objeto JSON.
    """
    try:
        match = re.search(r"(\{.*\})", text, re.DOTALL)
        if match:
            return match.group(1)
        text = text.replace("```json", "").replace("```", "").strip()
        return text
    except Exception:
        return text

@router.post("/parse-llm", response_model=LLMInterpretation)
async def parse_with_llm(payload: LLMParseRequest = Body(...)):
    """
    Usa DeepSeek para interpretar los resultados médicos.
    """
    if not DEEPSEEK_API_KEY or llm_client is None:
        raise HTTPException(
            status_code=500,
            detail="La IA no está configurada en el servidor (falta DEEPSEEK_API_KEY en .env)",
        )

    user_content = {
        "ocr_text": payload.ocr_text,
        "patient_profile": (
            payload.patient_profile.dict() if payload.patient_profile else None
        ),
        "draft_analysis_input": (
            payload.draft_analysis_input.dict()
            if payload.draft_analysis_input
            else None
        ),
    }

    try:
        resp = llm_client.chat.completions.create(
            model="deepseek-chat", 
            messages=[
                {"role": "system", "content": LLM_PARSER_SYSTEM_PROMPT},
                {
                    "role": "user",
                    "content": json.dumps(user_content, ensure_ascii=False),
                },
            ],
            temperature=0.1,
            response_format={"type": "json_object"}, 
            
            # --- CAMBIO IMPORTANTE AQUI ---
            max_tokens=8000  # Subido de 4000 a 8000 para evitar cortes en reportes largos
            # ------------------------------
        )

        raw_text = resp.choices[0].message.content or ""
        json_str = extract_json_from_text(raw_text)

        try:
            data = json.loads(json_str)
        except json.JSONDecodeError as e:
            print("--------------------------------------------------")
            print("ERROR PARSEANDO JSON DE DEEPSEEK:")
            # Imprimimos solo los últimos 200 caracteres para ver dónde cortó
            print(f"Final del texto recibido: ...{raw_text[-200:]}")
            print(f"Error: {e}")
            print("--------------------------------------------------")
            
            raise HTTPException(
                status_code=500,
                detail="La IA devolvió un formato inválido o incompleto (JSON cortado).",
            )

        interpretation = LLMInterpretation(**data)
        return interpretation

    except HTTPException:
        raise
    except Exception as e:
        print(f"Error DeepSeek General: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Error interno al procesar con DeepSeek: {str(e)}",
        )
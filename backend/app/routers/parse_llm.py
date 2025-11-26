# backend/app/routers/parse_llm.py

from fastapi import APIRouter, Body, HTTPException
import json

# Importamos TODO lo que ya definiste en ocr_local.py
from .ocr_local import (
    LLMParseRequest,
    LLMInterpretation,
    OPENAI_API_KEY,
    openai_client,
)

router = APIRouter(
    prefix="/ocr-local",          # => endpoint final: /ocr-local/parse-llm
    tags=["OCR + LLM"],
)

# Prompt del sistema para la LLM
LLM_PARSER_SYSTEM_PROMPT = """
Eres un asistente médico digital que ayuda a interpretar resultados de laboratorio.
Recibes:

- Texto OCR crudo de un informe de laboratorio.
- (Opcional) Un perfil básico del paciente.
- (Opcional) Un borrador de análisis estructurado (draft_analysis_input) con los
  resultados ya medio parseados pero no completos.

Tu tarea es:

1. Revisar el borrador de análisis (draft_analysis_input) y corregirlo solo si ves
   errores claros. Si no estás seguro, deja los valores tal como están.
2. Completar el objeto "analysis_input" con esta estructura:

{
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
}

3. Generar:
   - "summary": explicación en lenguaje sencillo (en español) de los hallazgos
     más importantes para el paciente (qué está normal, qué está alto/bajo, etc.).
   - "warnings": lista de advertencias o puntos a vigilar (puede estar vacía).
   - "disclaimer": recordatorio claro de que esto NO sustituye una consulta médica
     y que siempre debe comentarlo con su médico.

IMPORTANTE:
- Responde SIEMPRE con UN ÚNICO JSON VÁLIDO.
- No incluyas texto antes ni después del JSON.
- Si hay datos dudosos en el OCR, puedes mencionarlo en "warnings".
"""


@router.post("/parse-llm", response_model=LLMInterpretation)
async def parse_with_llm(payload: LLMParseRequest = Body(...)):
    """
    Usa una LLM para:
    - Leer el texto OCR del informe de laboratorio
    - Revisar/completar el análisis estructurado (analysis_input)
    - Devolver un resumen y advertencias para el paciente
    """
    if not OPENAI_API_KEY:
        raise HTTPException(
            status_code=500,
            detail="OPENAI_API_KEY no configurada en el servidor",
        )

    # Lo que le vamos a pasar a la LLM como "user" message
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
        resp = openai_client.chat.completions.create(
            model="gpt-4.1-mini",   # puedes cambiar el modelo si quieres
            messages=[
                {"role": "system", "content": LLM_PARSER_SYSTEM_PROMPT},
                {
                    "role": "user",
                    "content": json.dumps(user_content, ensure_ascii=False),
                },
            ],
            temperature=0.1,
        )

        raw_text = resp.choices[0].message.content

        # Intentar parsear el JSON que devuelve la IA
        try:
            data = json.loads(raw_text)
        except json.JSONDecodeError:
            raise HTTPException(
                status_code=500,
                detail="La IA no devolvió JSON válido",
            )

        # Validar contra el modelo Pydantic que ya definiste
        interpretation = LLMInterpretation(**data)
        return interpretation

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error al llamar a la IA: {e}",
        )

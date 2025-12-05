# backend/app/routers/parse_llm.py

from fastapi import APIRouter, Body, HTTPException
import json
import re
import google.generativeai as genai

from .ocr_local import (
    LLMParseRequest,
    LLMInterpretation,
    gemini_configured,
    LLM_PARSER_SYSTEM_PROMPT,
)

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
async def parse_with_llm(payload: LLMParseRequest = Body(...)):
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
        # Modelo Gemini recomendado
        model = genai.GenerativeModel(
            model_name="gemini-2.5-pro",
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

        return LLMInterpretation(**data)

    except HTTPException:
        raise

    except Exception as e:
        print(f"Error Gemini General: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Error interno al procesar con Gemini: {str(e)}",
        )

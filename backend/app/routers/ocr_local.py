import io
import re
from typing import List, Optional
import os
import uuid
import json
from datetime import date
from typing import Dict

from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
from pydantic import BaseModel
from supabase import create_client, Client
from doctr.io import DocumentFile
from doctr.models import ocr_predictor

# Eliminamos openai e importamos google-generativeai
import google.generativeai as genai

from dotenv import load_dotenv
from app.core.security import get_current_user, AuthUser
from app.core.config import settings

load_dotenv()

# ---------------------------
# Configuración Google Gemini
# ---------------------------
# Asegúrate de tener GOOGLE_API_KEY en tu archivo .env
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")

# Variable de control para saber si podemos usar la IA
gemini_configured = False

if not GOOGLE_API_KEY:
    # No rompemos el servidor aquí, solo avisamos en consola
    print("[Gemini] WARNING: GOOGLE_API_KEY no configurada. "
          "Los endpoints que usan la IA devolverán error 500.")
else:
    # Configuramos la librería globalmente
    genai.configure(api_key=GOOGLE_API_KEY)
    gemini_configured = True



print("[OCR] Module LOADED successfully. Gemini configured:", gemini_configured)

router = APIRouter(prefix="/ocr-local", tags=["OCR local"])

# ---------------------------
# Supabase
# ---------------------------

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_KEY = os.getenv("SUPABASE_SERVICE_KEY")
SUPABASE_BUCKET = "uploads"

supabase_client: Optional[Client] = None
if SUPABASE_URL and SUPABASE_SERVICE_KEY:
    try:
        supabase_client = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)
    except Exception as e:
        print(f"[Supabase] Error creando cliente: {e}")
else:
    print("[Supabase] SUPABASE_URL o SUPABASE_SERVICE_KEY no configurados")


def upload_pdf_to_supabase(content: bytes, filename: str) -> tuple[Optional[str], Optional[str]]:
    """
    Sube el PDF al bucket 'uploads' de Supabase.
    Devuelve (storage_path, public_url) o (None, None) si falla o no hay cliente.
    """
    if supabase_client is None:
        print("[Supabase] Cliente no inicializado, no se subirá el archivo")
        return None, None

    unique_name = f"{uuid.uuid4()}_{filename}"
    storage_path = f"labs/{unique_name}"

    try:
        supabase_client.storage.from_(SUPABASE_BUCKET).upload(
            path=storage_path,
            file=content,
        )
        public_url = supabase_client.storage.from_(SUPABASE_BUCKET).get_public_url(
            storage_path
        )
        return storage_path, public_url
    except Exception as e:
        print(f"[Supabase] Error subiendo archivo: {e}")
        return None, None

# ---------------------------
# Modelos de respuesta
# ---------------------------
# ---------------------------
# Modelos de respuesta
# ---------------------------
LLM_PARSER_SYSTEM_PROMPT = """
Eres un modelo de IA especializado en interpretar OCR médico.
Tu tarea es analizar el texto extraído de un análisis de laboratorio y estructurarlo en un formato JSON específico.

Debes devolver SIEMPRE un JSON válido que cumpla estrictamente con la siguiente estructura (schema):

{
  "analysis_input": {
    "patient_profile": {
      "age": int | null,
      "sex": "M" | "F" | null,
      "weight_kg": float | null,
      "height_cm": float | null,
      "conditions": [str],
      "medications": [str],
      "allergies": [str]
    },
    "lab_metadata": {
      "collection_date": "YYYY-MM-DD" | null,
      "lab_name": str | null
    },
    "lab_results": [
      {
        "group": str | null,
        "name": str,
        "code": str | null,
        "value": float | null,
        "value_as_string": str | null,
        "unit": str | null,
        "ref_low": float | null,
        "ref_high": float | null,
        "status": "bajo" | "normal" | "alto" | null,
        "flag_from_lab": str | null,
        "line": str
      }
    ]
  },
  "summary": "Resumen conciso de los hallazgos principales en lenguaje natural (español).",
  "warnings": ["Lista de posibles riesgos o valores fuera de rango que requieren atención."],
  "recommendations": ["Lista de 3 a 5 recomendaciones de salud accionables y específicas (nutrición, estilo de vida, chequeos)."],
  "disclaimer": "Este análisis es generado por IA y no sustituye el diagnóstico médico profesional."
}

Instrucciones adicionales:
1. Extrae la información del paciente si está disponible.
2. Normaliza los nombres de los análisis.
3. Interpreta los valores y rangos de referencia.
4. Si el valor NO es numérico (ej: "NEGATIVO", "POSITIVO", "NO REACTIVO", texto largo), usa "value_as_string" y deja "value" en null.
5. Genera un resumen útil para el paciente.
6. Genera recomendaciones prácticas basadas en los resultados anómalos o para mantener la buena salud.
7. NO incluyas texto fuera del JSON (como ```json ... ```). Devuelve SOLO el JSON crudo.
"""

class PatientProfile(BaseModel):
    age: Optional[int] = None
    sex: Optional[str] = None  # "M", "F", etc.
    weight_kg: Optional[float] = None
    height_cm: Optional[float] = None
    conditions: List[str] = []
    medications: List[str] = []
    allergies: List[str] = []


class LabMetadata(BaseModel):
    collection_date: Optional[date] = None
    lab_name: Optional[str] = None


class LabResult(BaseModel):
    group: Optional[str] = None
    name: str
    code: Optional[str] = None
    value: Optional[float] = None
    value_as_string: Optional[str] = None
    unit: Optional[str] = None
    ref_low: Optional[float] = None
    ref_high: Optional[float] = None
    status: Optional[str] = None        # "bajo", "normal", "alto", etc.
    flag_from_lab: Optional[str] = None # equivalente a tu flag
    line: str


class AnalysisInput(BaseModel):
    patient_profile: PatientProfile
    lab_metadata: LabMetadata
    lab_results: List[LabResult]

class LLMParseRequest(BaseModel):
    ocr_text: str
    patient_profile: Optional[PatientProfile] = None
    draft_analysis_input: Optional[AnalysisInput] = None  # opcional: lo que ya tienes del parser actual


class LLMInterpretation(BaseModel):
    analysis_input: AnalysisInput  # reutilizamos tu schema
    summary: str                   # resumen en lenguaje natural
    warnings: List[str] = []       # cosas a vigilar / posibles riesgos
    recommendations: List[str] = [] # recomendaciones de salud
    disclaimer: str                # recordatorio de que no es diagnóstico



class RefRange(BaseModel):
    min: Optional[float] = None
    max: Optional[float] = None


class LabItem(BaseModel):
    name_raw: str
    name: str
    value: Optional[float] = None
    value_as_string: Optional[str] = None
    unit: Optional[str] = None
    ref_range: Optional[RefRange] = None
    flag: Optional[str] = None  # "H", "L", etc.
    status: Optional[str] = None  # "alto", "bajo", "normal"
    line: str

class OCRResponse(BaseModel):
    text: str
    table_text: str
    items: List[LabItem]
    pages_processed: int
    storage_path: Optional[str] = None  # path en Supabase
    public_url: Optional[str] = None    # URL pública (si aplica)
    analysis_input: Optional[AnalysisInput] = None



# ---------------------------
# Modelo de docTR
# ---------------------------

OCR_PREDICTOR = ocr_predictor(pretrained=True)
MAX_PAGES = 5


# ---------------------------
# Utilidades de texto
# ---------------------------

def normalize_whitespace(s: str) -> str:
    return re.sub(r"\s+", " ", s).strip()


def preclean_lines(lines: List[str]) -> List[str]:
    cleaned = []
    for ln in lines:
        ln = ln.replace("\u00a0", " ")
        ln = ln.replace("µ", "u")  # homogeneizar µ -> u
        ln = normalize_whitespace(ln)
        if not ln:
            continue
        cleaned.append(ln)
    return cleaned


NUM_RE = re.compile(r"[<>]?\d+(?:\.\d+)?")


def is_value_only(s: str) -> bool:
    s = normalize_whitespace(s)
    return re.fullmatch(r"[<>]?\s*\d+(?:\.\d+)?", s) is not None


def is_range_only(s: str) -> bool:
    s = normalize_whitespace(s)
    return re.fullmatch(r"\d+(?:\.\d+)?\s*-\s*\d+(?:\.\d+)?", s) is not None


def is_unit_like(s: str) -> bool:
    up = s.upper().replace(" ", "")
    candidates = [
        "G/DL",
        "MG/DL",
        "U/L",
        "FL",
        "PG",
        "%",
        "UG/G",
        "UG/GL",
        "10*3/UL",
        "10:3/UL",
        "10-3/UL",
        "10*6/UL",
        "MM/1H",
        "P/C",
    ]
    return any(c in up for c in candidates)


def looks_like_full_row(line: str) -> bool:
    s = normalize_whitespace(line)
    m = re.match(
        r"^(.+?)\s+([<>]?\d+(?:\.\d+)?)\s+(\d+(?:\.\d+)?)\s*-\s*(\d+(?:\.\d+)?)(?:\s+\S.+)?$",
        s,
    )
    return m is not None


# ---------------------------
# Nombres que NO son analitos
# ---------------------------

def is_patient_line(line: str) -> bool:
    up = line.upper()
    if "SR(A)" in up or "CED/PAS" in up:
        return True
    if "FEC NAC" in up or "EDAD" in up or "SEXO" in up:
        return True
    if "TEL." in up or "TEL:" in up or "TELEF" in up:
        return True
    if "LABORATORIO CLINICO" in up or "LABORATORIO CLÍNICO" in up:
        return True
    return False


def is_banned_name(name: str) -> bool:
    up = normalize_whitespace(name).upper()

    # Encabezados genéricos de tabla
    header_tokens = [
        "DETERMINACION",
        "DETERMINACIÓN",
        "METODO",
        "MÉTODO",
        "RESULTADO",
        "INTERVALO",
        "UNIDADES",
        "DE REFERENCIA",
        "UNIDAD DE MEDIDA",
        "TIPO MUESTRA",
    ]
    if any(tok in up for tok in header_tokens):
        return True

    # Títulos de secciones (no son analitos)
    section_titles = [
        "HEMOGRAMA",
        "RECUENTO DIFERENCIAL",
        "RECUENTO DIFERENCIAL:",
        "DIGESTION MATERIAS FECALES",
        "DIGESTIÓN MATERIAS FECALES",
        "EXAMEN MACROSCOPICO",
        "EXAMEN MACROSCÓPICO",
        "EXAMEN MICROSCOPICO",
        "EXAMEN MICROSCÓPICO",
        "EXAMEN QUIMICO",
        "EXAMEN QUÍMICO",
        "INVESTIGACION PARASITOS",
        "INVESTIGACIÓN PARÁSITOS",
    ]
    if up in section_titles:
        return True

    # Coincidencias parciales de secciones
    partial_section = [
        "EXAMEN MICROSC",
        "EXAMEN MACROSC",
        "DIGESTION MATERIAS",
        "DIGESTIÓN MATERIAS",
        "RECUENTO DIFERENCIAL",
    ]
    if any(tok in up for tok in partial_section):
        return True

    # Cosas de cabecera / admin
    patient_tokens = [
        "SR(A)",
        "SR.",
        "SRA.",
        "FEC NAC",
        "EDAD",
        "SEXO",
        "CED/PAS",
        "TEL.",
        "TEL:",
        "TELEF",
        "REFERENCIA LABORATORIO",
        "INFORME DE RESULTADO",
        "INFORME DE RESULTADO(S)",
        "PAGINA:",
        "PÁGINA:",
        "RNC:",
        "NO.",
        "COLECCION:",
        "COLECCIÓN:",
        "RECEPCION:",
        "RECEPCIÓN:",
        "REPORTE",
        "VALORES CRITICOS",
        "VALORES CRÍTICOS",
        "SERIAL: NO.R",
        "TOMA DE MUESTRACS",
        "HUMANO SEGUROS",
    ]
    if any(tok in up for tok in patient_tokens):
        return True

    # Nombres que son solo métodos
    method_only = {
        "ENZIMATICO",
        "COLORIMETRICO",
        "COLORIMÉTRICO",
        "CALCULO",
        "CINETICO",
        "CINÉTICO",
        "CITOM. DE FLUJO",
        "INMUNOTURBID.",
        "INMUNOTURBID",
        "COLORIME TRICO",
    }
    if up in method_only:
        return True

    # Líneas tipo "SE OBSERVA BLASTOCYSTIS..." las descartamos por ahora
    if "SE OBSERVA BLASTOCYSTIS" in up:
        return True

    return False


# ---------------------------
# Unidades
# ---------------------------

UNIT_FIXES = {
    "10*3/UL": "10^3/µL",
    "10:3/UL": "10^3/µL",
    "10-3/UL": "10^3/µL",
    "10*6/UL": "10^6/µL",
    "UG/G": "µg/g",
    "UG/GL": "µg/g",
    "UL": "µL",
}


def normalize_unit(unit: Optional[str]) -> Optional[str]:
    if not unit:
        return None
    u = normalize_whitespace(unit)
    key = u.upper().replace(" ", "")
    return UNIT_FIXES.get(key, u)


# ---------------------------
# Normalización de nombres de pruebas
# ---------------------------

def normalize_name(name_raw: str) -> str:
    base = normalize_whitespace(name_raw)
    up = base.upper()

    mapping = {
        "G. ROJOS": "GLOBULOS ROJOS",
        "G ROJOS": "GLOBULOS ROJOS",
        "G. BLANCOS": "GLOBULOS BLANCOS",
        "G BLANCOS": "GLOBULOS BLANCOS",
        "HEI MOGLOBINA": "HEMOGLOBINA",
        "EOSINOF ILOS": "EOSINOFILOS",
        "EOSINOF ILOS(#)": "EOSINOFILOS(#)",
        "EOSINOFI ILOS(#)": "EOSINOFILOS(#)",
        "BASOF ILOS": "BASOFILOS",
    }

    return mapping.get(up, base)

# ---------------------------
# Agrupación y códigos de pruebas
# ---------------------------

NAME_TO_GROUP: Dict[str, str] = {
    # Hemograma
    "HEMOGLOBINA": "Hemograma",
    "HEMATOCRITO": "Hemograma",
    "GLOBULOS ROJOS": "Hemograma",
    "GLOBULOS BLANCOS": "Hemograma",
    "PLAQUETAS": "Hemograma",
    "VCM": "Hemograma",
    "HCM": "Hemograma",
    "CHCM": "Hemograma",
    "RDW-CV": "Hemograma",
    "NEUTROF: ILOS": "Hemograma",
    "NEUTROF: ILOS(#)": "Hemograma",
    "LINFOCITOS": "Hemograma",
    "LINFOCITOS(#)": "Hemograma",
    "MONOCITOS": "Hemograma",
    "MONOCITOS(#)": "Hemograma",
    "EOSINOFILOS": "Hemograma",
    "EOSINOFILOS(#)": "Hemograma",
    "BASOFILOS": "Hemograma",
    "BASOFILOS(#)": "Hemograma",

    # Perfil hepático
    "AST (SGOT)": "Perfil hepático",
    "ALT (SGPT)": "Perfil hepático",
    "PROTEINAS TOTALES": "Perfil hepático",
    "PROTEINAS TOTALES ": "Perfil hepático",  # por si acaso
    "ALBUMINA": "Perfil hepático",
    "AL BUMINA": "Perfil hepático",
    "GLOBULINAS": "Perfil hepático",
    "RELACION A/G": "Perfil hepático",

    # Función renal
    "CREATININA": "Función renal",
    "BUN": "Función renal",
    "TASA FILTRACION G.(EGFR)": "Función renal",

    # Metabolismo de carbohidratos
    "GLUCOSA": "Metabolismo de carbohidratos",

    # Gastrointestinal / heces
    "CALPROTECTINA FECAL": "Gastrointestinal",
    "DIGESTION MATERIAS FECALES": "Gastrointestinal",
    "DIGESTIÓN MATERIAS FECALES": "Gastrointestinal",
}

NAME_TO_CODE: Dict[str, str] = {
    "HEMOGLOBINA": "HGB",
    "HEMATOCRITO": "HCT",
    "GLOBULOS ROJOS": "RBC",
    "GLOBULOS BLANCOS": "WBC",
    "PLAQUETAS": "PLT",
    "VCM": "MCV",
    "HCM": "MCH",
    "CHCM": "MCHC",
    "RDW-CV": "RDW",
    "AST (SGOT)": "AST",
    "ALT (SGPT)": "ALT",
    "CREATININA": "CREAT",
    "GLUCOSA": "GLU",
    "BUN": "BUN",
    "CALPROTECTINA FECAL": "CALPROT",
}

# ---------------------------
# Construcción de filas tipo tabla
# ---------------------------
def lab_item_to_lab_result(item: LabItem) -> LabResult:
    up_name = normalize_whitespace(item.name).upper()

    group = NAME_TO_GROUP.get(up_name)
    code = NAME_TO_CODE.get(up_name)

    ref_low = item.ref_range.min if item.ref_range else None
    ref_high = item.ref_range.max if item.ref_range else None

    return LabResult(
        group=group,
        name=item.name,          # ya normalizado por normalize_name
        code=code,
        value=item.value,
        value_as_string=item.value_as_string,
        unit=item.unit,
        ref_low=ref_low,
        ref_high=ref_high,
        status=item.status,
        flag_from_lab=item.flag,
        line=item.line,
    )

def build_analysis_input(
    items: List[LabItem],
    full_text: str,
    storage_path: Optional[str] = None,
    public_url: Optional[str] = None,
    patient_profile: Optional[PatientProfile] = None,
) -> AnalysisInput:
    # TODO: aquí podrías parsear full_text para sacar la fecha de colección y el nombre del lab
    lab_metadata = LabMetadata(
        collection_date=None,
        lab_name=None,
    )

    if patient_profile is None:
        patient_profile = PatientProfile(
            age=None,
            sex=None,
            weight_kg=None,
            height_cm=None,
            conditions=[],
            medications=[],
            allergies=[],
        )

    lab_results = [lab_item_to_lab_result(it) for it in items]

    return AnalysisInput(
        patient_profile=patient_profile,
        lab_metadata=lab_metadata,
        lab_results=lab_results,
    )


def build_candidate_rows(lines: List[str]) -> List[str]:
    rows: List[str] = []
    i = 0
    n = len(lines)

    while i < n:
        L0 = lines[i]

        if is_patient_line(L0):
            i += 1
            continue

        # Fila completa en una sola línea
        if looks_like_full_row(L0):
            rows.append(L0)
            i += 1
            continue

        # name + value + range + unit (4 líneas)
        if i + 3 < n:
            L1 = lines[i + 1]
            L2 = lines[i + 2]
            L3 = lines[i + 3]
            if is_value_only(L1) and is_range_only(L2) and is_unit_like(L3):
                row = f"{L0} {L1} {L2} {L3}"
                rows.append(row)
                i += 4
                continue

        # name + value + range (3 líneas, sin unidad)
        if i + 2 < n:
            L1 = lines[i + 1]
            L2 = lines[i + 2]
            if is_value_only(L1) and is_range_only(L2):
                row = f"{L0} {L1} {L2}"
                rows.append(row)
                i += 3
                continue

        # Método + analito + valor + rango + unidad (5 líneas)
        # Ej: Citom. de Flujo / HEMOGLOBINA / 16.5 / 14-18 / g/dL
        if i + 4 < n:
            L1 = lines[i + 1]
            L2 = lines[i + 2]
            L3 = lines[i + 3]
            L4 = lines[i + 4]
            up0 = L0.upper()
            has_digits_L1 = any(ch.isdigit() for ch in L1)
            if (
                any(tok in up0 for tok in ["ENZIM", "COLORIM", "CITOM", "INMUNOTURB", "CLIA"])
                and not has_digits_L1
                and is_value_only(L2)
                and is_range_only(L3)
                and is_unit_like(L4)
            ):
                row = f"{L1} {L2} {L3} {L4}"
                rows.append(row)
                i += 5
                continue

        # name + método + valor + rango + unidad (5 líneas)
        # Ej: ERITRO / FOTOMETRIA / 2 / 0-15 / mm/1H
        if i + 4 < n:
            L1 = lines[i + 1]
            L2 = lines[i + 2]
            L3 = lines[i + 3]
            L4 = lines[i + 4]

            has_digits_L1 = any(ch.isdigit() for ch in L1)
            if (
                not has_digits_L1
                and is_value_only(L2)
                and is_range_only(L3)
                and is_unit_like(L4)
            ):
                row = f"{L0} {L2} {L3} {L4}"
                rows.append(row)
                i += 5
                continue

        # Fallback: línea que contiene número, posible fila parcial
        if NUM_RE.search(L0):
            rows.append(L0)

        i += 1

    return rows


# ---------------------------
# Parsing fila -> LabItem
# ---------------------------

ROW_RANGE_RE = re.compile(
    r"""
    ^(?P<name>.+?)\s+
    (?P<value>[<>]?\d+(?:\.\d+)?)\s+
    (?P<min>\d+(?:\.\d+)?)\s*-\s*(?P<max>\d+(?:\.\d+)?)
    (?:\s+(?P<unit>.+))?
    $
    """,
    re.X,
)

ROW_UPPER_ONLY_RE = re.compile(
    r"""
    ^(?P<name>.+?)\s+
    (?P<value>[<>]?\d+(?:\.\d+)?)\s*
    (?P<cmp><=|<|>=|>)\s*
    (?P<max>\d+(?:\.\d+)?)
    (?:\s+(?P<unit>.+))?
    $
    """,
    re.X,
)


def safe_float(x: Optional[str]) -> Optional[float]:
    if x is None:
        return None
    try:
        return float(x.replace(",", "."))
    except Exception:
        return None


def classify_status(value: Optional[float], ref: Optional[RefRange]) -> Optional[str]:
    if value is None or ref is None:
        return None
    if ref.min is not None and value < ref.min:
        return "bajo"
    if ref.max is not None and value > ref.max:
        return "alto"
    if ref.min is not None and ref.max is not None:
        return "normal"
    return None


def parse_row_to_item(row: str) -> Optional[LabItem]:
    s = normalize_whitespace(row)

    # Ignorar listas de muchas pruebas
    if "," in s:
        return None

    # Ignorar líneas que empiezan solo con comparadores (<= 5.00, < 0.24, etc.)
    if s.lstrip().startswith("<") or s.lstrip().startswith(">"):
        return None

    if is_patient_line(s):
        return None

    # Patrón completo: name value min-max [unit]
    m = ROW_RANGE_RE.match(s)
    if m:
        name_raw = m.group("name").strip()

        # nombre debe tener letras y más de 1 char útil
        clean_for_len = re.sub(r"[.:]", "", name_raw).strip()
        if not any(ch.isalpha() for ch in name_raw) or len(clean_for_len) <= 1:
            return None
        if is_banned_name(name_raw):
            return None

        value = safe_float(m.group("value"))
        min_v = safe_float(m.group("min"))
        max_v = safe_float(m.group("max"))
        unit = normalize_unit(m.group("unit"))

        ref = RefRange(min=min_v, max=max_v) if (min_v is not None or max_v is not None) else None
        status = classify_status(value, ref)
        flag = None
        if status == "alto":
            flag = "H"
        elif status == "bajo":
            flag = "L"

        return LabItem(
            name_raw=name_raw,
            name=normalize_name(name_raw),
            value=value,
            unit=unit,
            ref_range=ref,
            flag=flag,
            status=status,
            line=row,
        )

    # Patrón: name value <= max (sin rango inferior)
    m2 = ROW_UPPER_ONLY_RE.match(s)
    if m2:
        name_raw = m2.group("name").strip()
        clean_for_len = re.sub(r"[.:]", "", name_raw).strip()
        if not any(ch.isalpha() for ch in name_raw) or len(clean_for_len) <= 1:
            return None
        if is_banned_name(name_raw):
            return None

        value = safe_float(m2.group("value"))
        max_v = safe_float(m2.group("max"))
        unit = normalize_unit(m2.group("unit"))
        cmp_op = m2.group("cmp")

        ref = None
        if max_v is not None and cmp_op in ("<", "<="):
            ref = RefRange(min=None, max=max_v)
        elif max_v is not None and cmp_op in (">", ">="):
            ref = RefRange(min=max_v, max=None)

        status = classify_status(value, ref)
        flag = None
        if status == "alto":
            flag = "H"
        elif status == "bajo":
            flag = "L"

        return LabItem(
            name_raw=name_raw,
            name=normalize_name(name_raw),
            value=value,
            unit=unit,
            ref_range=ref,
            flag=flag,
            status=status,
            line=row,
        )

    # Fallback: nombre + valor sin rango
    nums = list(NUM_RE.finditer(s))
    if len(nums) >= 1:
        first_num = nums[0]
        name_raw = s[: first_num.start()].strip()
        clean_for_len = re.sub(r"[.:]", "", name_raw).strip()

        if not name_raw:
            return None
        if not any(ch.isalpha() for ch in name_raw) or len(clean_for_len) <= 1:
            return None
        if is_banned_name(name_raw):
            return None

        value_str = first_num.group()
        value = safe_float(value_str)
        unit = None

        if len(nums) == 1:
            tail = s[first_num.end():].strip()
            if tail:
                unit = normalize_unit(tail)

        return LabItem(
            name_raw=name_raw,
            name=normalize_name(name_raw),
            value=value,
            unit=unit,
            ref_range=None,
            flag=None,
            status=None,
            line=row,
        )

    return None


# ---------------------------
# Endpoint principal
# ---------------------------

@router.post("/pdf", response_model=OCRResponse)
async def ocr_pdf(
    file: UploadFile = File(...),
    user: AuthUser = Depends(get_current_user)
):
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Solo se permiten archivos PDF")

    try:
        content = await file.read()
        if not content:
            raise HTTPException(status_code=400, detail="Archivo vacío")

        # Subir el PDF a Supabase (si está configurado)
        print(f"[OCR] Starting processing for {file.filename}")
        storage_path, public_url = upload_pdf_to_supabase(content, file.filename)
        print(f"[OCR] Upload to Supabase done: {storage_path}")

        # ---------------------------------------------------------
        # Obtener datos del usuario logueado
        # ---------------------------------------------------------
        user_profile_data = None
        try:
            # Creamos cliente con el token del usuario para respetar RLS
            client = create_client(settings.SUPABASE_URL, settings.SUPABASE_KEY)
            client.postgrest.auth(user.token)
            
            resp = client.table("usuarios").select("*").eq("user_auth_id", user.sub).single().execute()
            if resp.data:
                user_profile_data = resp.data
        except Exception as e:
            print(f"[OCR] Error obteniendo perfil de usuario: {e}")

        print(f"[OCR] User profile fetched: {user_profile_data is not None}")

        # Mapear a PatientProfile
        patient_profile = None
        if user_profile_data:
            # Calcular edad
            age = None
            if user_profile_data.get("fecha_nacimiento"):
                try:
                    dob = date.fromisoformat(user_profile_data["fecha_nacimiento"])
                    today = date.today()
                    age = today.year - dob.year - ((today.month, today.day) < (dob.month, dob.day))
                except Exception:
                    pass
            
            # Mapear sexo
            sex_map = {"Masculino": "M", "Femenino": "F", "M": "M", "F": "F"}
            raw_sex = user_profile_data.get("sexo")
            sex = sex_map.get(raw_sex, raw_sex)

            patient_profile = PatientProfile(
                age=age,
                sex=sex,
                weight_kg=user_profile_data.get("peso_kg"),
                height_cm=user_profile_data.get("altura_cm"),
                conditions=user_profile_data.get("condiciones_medicas") or [],
                medications=[],
                allergies=user_profile_data.get("alergias") or []
            )

        doc = DocumentFile.from_pdf(io.BytesIO(content))

        if len(doc) == 0:
            raise HTTPException(status_code=400, detail="El PDF no contiene páginas")

        pages_to_process = min(len(doc), MAX_PAGES)

        pages_to_process = min(len(doc), MAX_PAGES)
        print(f"[OCR] Model ready. Pages to process: {pages_to_process}")

        result = OCR_PREDICTOR(doc)
        print("[OCR] Model inference complete")
        export = result.export()

        all_text_lines: List[str] = []
        logical_lines: List[str] = []

        for page_idx, page in enumerate(export["pages"][:pages_to_process]):
            for block in page.get("blocks", []):
                for line in block.get("lines", []):
                    words = [w["value"] for w in line.get("words", [])]
                    if not words:
                        continue
                    line_text = " ".join(words)
                    all_text_lines.append(line_text)
                    logical_lines.append(line_text)

        full_text = "\n".join(all_text_lines)

        cleaned_lines = preclean_lines(logical_lines)
        candidate_rows = build_candidate_rows(cleaned_lines)
        table_text = "\n".join(candidate_rows)

        items: List[LabItem] = []
        for row in candidate_rows:
            item = parse_row_to_item(row)
            if item is None:
                continue
            items.append(item)

        analysis_input = build_analysis_input(
            items=items,
            full_text=full_text,
            storage_path=storage_path,
            public_url=public_url,
            patient_profile=patient_profile
        )

        return OCRResponse(
            text=full_text,
            table_text=table_text,
            items=items,
            pages_processed=pages_to_process,
            storage_path=storage_path,
            public_url=public_url,
            analysis_input=analysis_input,
        )


    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"OCR/PDF error: {e}")
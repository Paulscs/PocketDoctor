# app/routers/ocr_local.py
from typing import Optional, Callable, List, TypedDict, Literal
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from app.core.config import settings
from app.core.security import get_current_user, AuthUser

import shutil
import re
import pytesseract
from PIL import Image, ImageOps
from io import BytesIO

# ---- PDF opcional (pdf2image) ----
PDF2IMAGE_AVAILABLE: bool = False
_convert_from_bytes: Optional[Callable[..., list]] = None  # lista de PIL.Image

try:
    from pdf2image import convert_from_bytes as _pdf2image_convert_from_bytes  # type: ignore
    _convert_from_bytes = _pdf2image_convert_from_bytes
    PDF2IMAGE_AVAILABLE = True
except Exception:
    PDF2IMAGE_AVAILABLE = False
    _convert_from_bytes = None  # asegura que exista

router = APIRouter(prefix="/ocr", tags=["ocr"])

# Configura tesseract desde .env o PATH
pytesseract.pytesseract.tesseract_cmd = (
    settings.TESSERACT_CMD
    or shutil.which("tesseract")
    or "tesseract"
)

# =========================================================
#                 PREPROCESADO Y OCR
# =========================================================

def _preprocess(img: Image.Image) -> Image.Image:
    """Mejoras simples para OCR: reescalado, gris, autocontraste y binarización."""
    w, h = img.size
    if max(w, h) < 1800:
        img = img.resize((int(w * 1.5), int(h * 1.5)))
    img = ImageOps.grayscale(img)
    img = ImageOps.autocontrast(img)
    img = img.point(lambda x: 255 if x > 180 else 0, mode="1")
    return img

def _ocr_image_bytes(img_bytes: bytes, lang: str) -> str:
    img = Image.open(BytesIO(img_bytes))
    if img.mode in ("RGBA", "P"):
        img = img.convert("RGB")
    img = _preprocess(img)
    config = "--oem 1 --psm 6"  # tablas alineadas; si hay columnas, prueba --psm 4
    text = pytesseract.image_to_string(img, lang=lang, config=config)
    return text.strip()

# =========================================================
#           PARSER GENÉRICO ROBUSTO → JSON
# =========================================================

class RefRange(TypedDict, total=False):
    min: float
    max: float

class ParsedItem(TypedDict, total=False):
    name_raw: str
    name: str
    value: float
    unit: Optional[str]
    ref_range: Optional[RefRange]
    flag: Optional[Literal["H", "L"]]
    status: Optional[Literal["bajo", "normal", "alto"]]
    line: str

_DASH = r"[-\-–—]"  # variantes de guiones
_NUM = r"\d+(?:[.,]\d+)?"

RANGE_RE = re.compile(
    rf"(?P<low>{_NUM})\s*(?:{_DASH}|(?:\bto\b)|(?:\ba\b))\s*(?P<high>{_NUM})",
    re.IGNORECASE,
)

UNIT_TAIL_RE = re.compile(r"([%A-Za-zµμ/^\d\.\-]+)\s*$")

FLAG_RE = re.compile(r"\b([HL])\b|↑|↓|Tt", re.IGNORECASE)  # 'Tt' aparece a veces por OCR

NOISE_REPLACEMENTS = [
    (r"\bU\.?d\.?A\.?\b", ""),  # "U.d.A." ruido en tus informes
]

METHOD_WORDS = [
    "CLIA", "ENZIMATICO", "ENZIMÁTICO", "COLORIMETRICO", "COLORIMÉTRICO",
    "CINETICO", "CINÉTICO", "CINETICA", "CINÉTICA", "INMUNOTURBID.",
    "CALCULO", "CÁLCULO"
]

def _norm_dec(s: str) -> float:
    return float(s.replace(",", "."))

def _normalize_line(s: str) -> str:
    s = s.replace("°", "^").replace("º", "^")
    s = re.sub(r"(?<=\d),(?=\d)", ".", s)  # 47,4 -> 47.4
    s = s.replace("uL", "µL").replace("mcL", "µL")
    s = re.sub(r"\bTt\b", "↑", s, flags=re.IGNORECASE)  # flag raro
    for pat, rep in NOISE_REPLACEMENTS:
        s = re.sub(pat, rep, s, flags=re.IGNORECASE)
    s = re.sub(r"\s+", " ", s).strip()
    return s

def _status_from_range(val: float, low: float, high: float) -> Literal["bajo", "normal", "alto"]:
    if val < low:
        return "bajo"
    if val > high:
        return "alto"
    return "normal"

def _extract_unit_after(text: str, start_idx: int) -> Optional[str]:
    tail = text[start_idx:]
    m = UNIT_TAIL_RE.search(tail)
    if m:
        return m.group(1).strip()
    return None

def _clean_name_segment(seg: str) -> str:
    seg = seg.strip()
    # quita posibles palabras de método al final del nombre
    tokens = [t for t in seg.split() if t.upper() not in METHOD_WORDS]
    name = " ".join(tokens)
    # quita adornos
    name = re.sub(r"[\(\)#]", "", name)
    name = re.sub(r"\s+", " ", name).strip()
    return name

# =========================================================
#      SEGMENTACIÓN DE TABLAS SOBRE TEXTO DE OCR
# =========================================================

# Palabras típicas de cabeceras de tablas
_HEADER_GROUPS = {
    "name": [
        "DETERMIN", "PRUEBA", "ANALISIS", "ANÁLISIS",
        "EXAMEN", "PARAM", "DETERMINACION", "DETERMINACIÓN"
    ],
    "result": ["RESULTADO", "VALOR"],
    "ref": ["INTERVALO", "RANGO", "REFERENCIA", "VALORES"],
    "unit": ["UNIDAD", "UNIDADES"],
}

# Frases que casi seguro NO son filas de tabla (cabeceras, pies, datos de paciente)
_NON_TABLE_KEYWORDS = [
    "INFORME DE RESULTADO", "INFORME DE RESULTADOCS",
    "FACT.", "FACT ", "CED/PAS", "FEC NAC", "EDAD", "SEXO",
    "TOMA DE MUESTRA", "TOMA DE MUESTRAS",
    "EMITIDO", "EMITIDOCS",
    "AUTORIZADO", "SERIAL", "PAGINA", "PÁGINA",
    "RNC", "TEL", "AV.", "SEGUROS", "LABORATORIO CLINICO",
    "TIPO MUESTRA", "RESULTADOS FUERA DE INTERVALO", "VALORES CRITICOS",
]

# Unidades típicas de laboratorio para detección rápida
_COMMON_UNITS = [
    "MG/DL", "G/DL", "U/L", "UI/L", "MM/1H", "%", "UG/G",
    "10^3/UL", "10°3/UL", "10*3/UL", "10^6/UL", "10°6/UL",
    "FL", "PG", "UL", "µL"
]

# Títulos de sección que NO son filas (aunque estén dentro de la tabla)
_SECTION_TITLE_KEYWORDS = [
    "EXAMEN MACROSC",   # MACROSCOPICO / MACROSC6PICO
    "EXAMEN MICROSC",   # MICROSCOPICO / MICROSC6PICO
]

def _is_header_line(line_u: str) -> bool:
    """
    Devuelve True si la línea parece la cabecera de una tabla.
    Requerimos al menos un término de 'name' (DETERMINACION / PRUEBA / EXAMEN...)
    y al menos otro grupo (resultado / referencia / unidad).
    Así evitamos confundir 'INFORME DE RESULTADO(S) REFERENCIA' con cabecera.
    """
    groups_present = set()
    for group, kws in _HEADER_GROUPS.items():
        if any(kw in line_u for kw in kws):
            groups_present.add(group)

    # Debe tener algo del grupo 'name' y al menos otro grupo más
    if "name" in groups_present and len(groups_present) >= 2:
        return True
    return False

def _is_footer_line(line_u: str) -> bool:
    """Línea que indica que ya salimos de la tabla (pie, disclaimers, etc.)."""
    return any(kw in line_u for kw in _NON_TABLE_KEYWORDS)

def _looks_like_table_row(line: str, line_u: str) -> bool:
    """Heurística: ¿esta línea parece una fila de resultados?"""
    # Títulos de sección dentro de la tabla (no son filas)
    if any(kw in line_u for kw in _SECTION_TITLE_KEYWORDS):
        return False

    # Debe tener al menos un dígito
    if not re.search(r"\d", line):
        return False

    # Si tiene rango tipo 0.7 - 1.2, seguro es fila
    if RANGE_RE.search(line):
        return True

    # Si termina con una unidad típica
    if any(unit in line_u for unit in _COMMON_UNITS):
        return True

    # Unidad genérica al final (letras/%/µ/etc.)
    if re.search(r"\d\s*[%A-ZÁÉÍÓÚÜÑµμ/^\d\.\-]+$", line_u):
        return True

    # Densidad numérica: muchas cifras en una línea relativamente corta
    digits = len(re.findall(r"\d", line))
    if digits >= 2 and digits / max(len(line), 1) > 0.15:
        return True

    return False

def _extract_table_lines(text: str) -> List[str]:
    """
    Strategy 1: segmentación por texto.
    - Busca cabeceras de tabla (DETERMINACION / RESULTADO / INTERVALO / UNIDADES...)
    - Desde ahí, recoge las líneas que parecen filas de tabla.
    - Corta solo cuando detecta pies de página / disclaimers claros.
    """
    raw_lines = re.split(r"[\r\n]+", text)
    normalized_lines = [_normalize_line(l) for l in raw_lines]

    table_lines: List[str] = []
    in_table = False

    for line in normalized_lines:
        if not line:
            # líneas vacías se ignoran siempre
            continue

        line_u = line.upper()

        # Si aún no estamos dentro de una tabla, buscamos cabecera
        if not in_table:
            if _is_header_line(line_u):
                in_table = True
                # no añadimos la cabecera a las filas
            continue

        # Ya dentro de una tabla -------------------------

        # ¿Llegamos a un pie/leyenda claro? -> cerramos tabla
        if _is_footer_line(line_u):
            in_table = False
            continue

        # Solo añadimos líneas que parezcan filas de tabla;
        # las demás se ignoran pero NO cierran la tabla.
        if _looks_like_table_row(line, line_u):
            table_lines.append(line)

    return table_lines

# =========================================================
#        PARSEO DE LINEAS (YA FILTRADAS) DE LABORATORIO
# =========================================================

def _parse_line_range_first(line: str) -> Optional[ParsedItem]:
    """
    Estrategia:
      1) Buscar el RANGO (low-high). Si no hay, devolver None.
      2) Tomar el número inmediato ANTERIOR al rango como VALUE.
      3) UNIT: lo que hay después del rango al final de línea.
      4) NAME: todo lo que está antes del VALUE (limpiando métodos).
      5) FLAG: H/L/↑/↓ cerca del value/rango.
    """
    m = RANGE_RE.search(line)
    if not m:
        return None

    low_s, high_s = m.group("low"), m.group("high")
    low, high = _norm_dec(low_s), _norm_dec(high_s)
    range_start, range_end = m.span()

    # Busca el último número ANTES del rango: ese es el valor
    numbers_before = list(re.finditer(_NUM, line[:range_start]))
    if not numbers_before:
        return None  # no hay valor antes del rango
    value_match = numbers_before[-1]
    value_s = value_match.group(0)
    value = _norm_dec(value_s)

    # Nombre: todo antes del valor
    name_seg = line[:value_match.start()]
    name_raw = name_seg.strip()
    name = _clean_name_segment(name_raw).upper()

    # Flag cerca del valor/rango
    vicinity = line[value_match.end():range_end]
    f = FLAG_RE.search(vicinity)
    flag: Optional[Literal["H", "L"]] = None
    if f:
        g = f.group(0).upper()
        flag = "H" if (g == "H" or g == "↑") else "L" if (g == "L" or g == "↓") else None

    unit = _extract_unit_after(line, range_end)

    item: ParsedItem = {
        "name_raw": name_raw,
        "name": name if name else name_raw.upper(),
        "value": value,
        "unit": unit,
        "ref_range": {"min": low, "max": high},
        "flag": flag,
        "status": _status_from_range(value, low, high),
        "line": line,
    }
    return item

def _parse_line_value_only(line: str) -> Optional[ParsedItem]:
    """
    Fallback: línea con NOMBRE + VALOR (+ UNIDAD opcional), sin rango.
    Toma el PRIMER número como valor y lo que haya al final como unidad.
    """
    num = re.search(_NUM, line)
    if not num:
        return None
    value = _norm_dec(num.group(0))
    name_seg = line[:num.start()]
    name_raw = name_seg.strip()
    name = _clean_name_segment(name_raw).upper()

    # unidad (si existe) -> al final
    unit = _extract_unit_after(line, num.end())

    # flag (si está pegado al valor)
    vicinity = line[num.end():]
    f = FLAG_RE.search(vicinity)
    flag: Optional[Literal["H", "L"]] = None
    if f:
        g = f.group(0).upper()
        flag = "H" if (g == "H" or g == "↑") else "L" if (g == "L" or g == "↓") else None

    return {
        "name_raw": name_raw,
        "name": name if name else name_raw.upper(),
        "value": value,
        "unit": unit,
        "ref_range": None,
        "flag": flag,
        "status": None,
        "line": line,
    }

def parse_generic_labs(text: str) -> List[ParsedItem]:
    items: List[ParsedItem] = []
    for raw in re.split(r"[\r\n]+", text):
        line = _normalize_line(raw)
        if not line or len(line) < 3:
            continue

        # descarta encabezados "título" en mayúsculas puras (p. ej. HEMOGRAMA)
        if re.fullmatch(r"[A-ZÁÉÍÓÚÜÑ ]{3,}", line) and " " not in line.strip():
            continue

        parsed = _parse_line_range_first(line)
        if not parsed:
            parsed = _parse_line_value_only(line)
        if parsed:
            items.append(parsed)
    return items

# =========================================================
#                     ENDPOINT
# =========================================================

@router.post("/local-file")
def ocr_local_file(
    file: UploadFile = File(...),
    lang: str = Form(default=settings.OCR_LANG),
    user: AuthUser = Depends(get_current_user),
):
    """
    Sube una imagen o PDF local y devuelve:
    - text: OCR crudo completo
    - table_text: solo líneas de tablas detectadas
    - items: objetos parseados {name_raw, name, value, unit, ref_range?, flag?, status?}
    - pages_processed: para PDFs (si aplica)
    """
    mime = (file.content_type or "").lower()

    # IMÁGENES
    if mime.startswith("image/"):
        try:
            content = file.file.read()
            full_text = _ocr_image_bytes(content, lang=lang)

            table_lines = _extract_table_lines(full_text)
            table_text = "\n".join(table_lines)
            items = parse_generic_labs(table_text)

            return {
                "text": full_text,
                "table_text": table_text,
                "items": items,
            }
        except Exception as e:
            raise HTTPException(500, f"OCR error: {e}")

    # PDF
    if mime == "application/pdf":
        if not PDF2IMAGE_AVAILABLE or _convert_from_bytes is None:
            raise HTTPException(
                400,
                "Soporte PDF no activo: instala pdf2image y configura POPPLER_PATH (Windows)."
            )
        try:
            pdf_content = file.file.read()
            images = _convert_from_bytes(
                pdf_content,
                dpi=300,
                poppler_path=settings.POPPLER_PATH or None
            )
            if not images:
                raise ValueError("PDF sin páginas procesables")

            texts = []
            for img in images:
                buf = BytesIO()
                img.save(buf, format="PNG")
                texts.append(_ocr_image_bytes(buf.getvalue(), lang=lang))

            full_text = "\n\n".join(texts)

            table_lines = _extract_table_lines(full_text)
            table_text = "\n".join(table_lines)
            items = parse_generic_labs(table_text)

            return {
                "text": full_text,
                "table_text": table_text,
                "items": items,
                "pages_processed": len(images),
            }
        except Exception as e:
            raise HTTPException(500, f"OCR/PDF error: {e}")

    raise HTTPException(415, f"MIME no soportado: {mime}. Usa image/* o application/pdf.")

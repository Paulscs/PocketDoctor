import pytest
from unittest.mock import Mock, AsyncMock, patch
from fastapi.testclient import TestClient
from app.main import app
from app.core.security import get_current_user

# --- Mock Data ---

MOCK_ANALYSIS_INPUT = {
    "patient_profile": {
        "age": 30,
        "sex": "M",
        "conditions": ["Diabetes"],
        "medications": [],
        "allergies": []
    },
    "lab_metadata": {},
    "lab_results": [
        {
            "name": "HEMOGLOBINA",
            "value": 15.0,
            "unit": "g/dL",
            "ref_low": 13.5,
            "ref_high": 17.5,
            "status": "normal",
            "line": "Hemoglobina 15.0 13.5-17.5"
        }
    ]
}

MOCK_INTERPRETATION = {
    "analysis_input": MOCK_ANALYSIS_INPUT,
    "summary": "Resultados normales.",
    "warnings": [],
    "recommendations": [{"title": "Mantener hábitos", "description": "Seguir así."}],
    "disclaimer": "No es diagnóstico."
}

@pytest.fixture
def client_with_auth(mock_supabase_client, mock_auth_user):
    """Fixture with auth for file tests"""
    mock_client, mock_table, mock_query = mock_supabase_client
    
    def mock_get_current_user():
        return mock_auth_user
    
    app.dependency_overrides[get_current_user] = mock_get_current_user
    
    # Mock storage calls if needed
    # (files.py uses httpx directly, we mock that in the test)
    
    yield TestClient(app)
    
    app.dependency_overrides.clear()


# --- Pruebas de Archivos (TC-024, TC-025, TC-026) ---

def test_upload_valid_document_success(client_with_auth):
    """TC-024: Subir documento válido"""
    # Mock httpx for Supabase Storage
    mock_response = Mock()
    mock_response.status_code = 200
    mock_response.json.return_value = {"Key": "uploads/user/file.pdf"}

    file_content = b"fake pdf content"
    files = {"file": ("test.pdf", file_content, "application/pdf")}

    with patch("httpx.AsyncClient.post", new_callable=AsyncMock) as mock_post:
        mock_post.return_value = mock_response
        
        response = client_with_auth.post("/files/upload", files=files)

    assert response.status_code == 200
    assert response.json()["mime"] == "application/pdf"
    assert "path" in response.json()


def test_upload_unsupported_file(client_with_auth):
    """TC-025: Validar error con archivo no soportado (ej. .exe o .txt)"""
    file_content = b"fake exe content"
    files = {"file": ("malicious.exe", file_content, "application/x-msdownload")}

    response = client_with_auth.post("/files/upload", files=files)

    assert response.status_code == 415
    assert "no permitido" in response.json()["detail"]


def test_upload_too_large(client_with_auth):
    """TC-026: Validar manejo de documento demasiado grande"""
    # 11 MB file
    large_content = b"0" * (11 * 1024 * 1024)
    files = {"file": ("large.pdf", large_content, "application/pdf")}

    response = client_with_auth.post("/files/upload", files=files)

    assert response.status_code == 413
    assert "supera" in response.json()["detail"]


# --- Pruebas de OCR e Interpretación (TC-031, TC-032, TC-033) ---

def test_ocr_pdf_processing(client_with_auth):
    """Test /ocr-local/pdf processing (Mocks docTR)"""
    file_content = b"%PDF-1.4..."
    files = {"file": ("lab_result.pdf", file_content, "application/pdf")}

    # Mock OCR Predictor output
    mock_page = {"blocks": [{"lines": [{"words": [{"value": "Hemoglobina"}, {"value": "15.0"}]}]}]}
    mock_export = {"pages": [mock_page]}
    
    mock_result = Mock()
    mock_result.export.return_value = mock_export

    # Mock DocumentFile.from_pdf
    mock_doc_file = [1] # len() > 0

    # Also need to mock upload_pdf_to_supabase inside ocr_local or assume it fails/passes gracefully?
    # ocr_local uses supabase_client global var. We can mock upload_pdf_to_supabase function.
    
    with patch("app.routers.ocr_local.OCR_PREDICTOR") as mock_predictor, \
         patch("app.routers.ocr_local.DocumentFile.from_pdf", return_value=mock_doc_file), \
         patch("app.routers.ocr_local.upload_pdf_to_supabase", return_value=("path/to/file", "http://url")), \
         patch("app.routers.ocr_local.create_client") as mock_create_client: # for user profile fetch
            
            mock_predictor.return_value = mock_result
            
            # Mock user profile fetch inside ocr_pdf
            mock_supa = Mock()
            mock_supa.table.return_value.select.return_value.eq.return_value.single.return_value.execute.return_value = Mock(data={})
            mock_create_client.return_value = mock_supa

            response = client_with_auth.post("/ocr-local/pdf", files=files)

    assert response.status_code == 200
    data = response.json()
    assert "Hemoglobina" in data["text"]
    assert data["items"] is not None # Even if empty parsing due to simple text


@pytest.mark.asyncio
async def test_llm_interpretation_success(client_with_auth):
    """TC-031, TC-032: Mostrar interpretación y validar formato"""
    payload = {
        "ocr_text": "Hemoglobina 15.0",
        "patient_profile": MOCK_ANALYSIS_INPUT["patient_profile"],
        "draft_analysis_input": MOCK_ANALYSIS_INPUT
    }

    # Mock Gemini generation
    mock_gen_response = Mock()
    # Return JSON string
    import json
    mock_gen_response.text = json.dumps(MOCK_INTERPRETATION)

    mock_model = Mock()
    mock_model.generate_content.return_value = mock_gen_response

    with patch("google.generativeai.GenerativeModel", return_value=mock_model):
        # Allow testing even if API KEY not present (mock gemini_configured check if needed, 
        # but parse_llm.py checks gemini_configured. We might need to patch that too)
        with patch("app.routers.parse_llm.gemini_configured", True):
             response = client_with_auth.post("/ocr-local/parse-llm", json=payload)

    assert response.status_code == 200
    data = response.json()
    assert data["summary"] == "Resultados normales."
    assert len(data["recommendations"]) > 0
    # TC-032: Validar formato comprensible (implícito en el schema validado por Pydantic)
    assert "analysis_input" in data


@pytest.mark.asyncio
async def test_llm_out_of_range_handling(client_with_auth):
    """TC-033: Manejar resultados fuera de rango"""
    # Modificamos input para tener un valor alto
    input_data = MOCK_ANALYSIS_INPUT.copy()
    input_data["lab_results"][0]["value"] = 20.0 # Alto (ref_high 17.5)
    input_data["lab_results"][0]["status"] = "alto"
    
    payload = {
        "ocr_text": "Hemoglobina 20.0 High",
        "draft_analysis_input": input_data
    }

    # Mock Gemini detectando el riesgo
    mock_resp_data = MOCK_INTERPRETATION.copy()
    mock_resp_data["warnings"] = [{"title": "Hemoglobina Alta", "description": "Posible anemia o deshidratación."}]
    
    import json
    mock_gen_response = Mock()
    mock_gen_response.text = json.dumps(mock_resp_data)
    mock_model = Mock()
    mock_model.generate_content.return_value = mock_gen_response

    with patch("google.generativeai.GenerativeModel", return_value=mock_model):
        with patch("app.routers.parse_llm.gemini_configured", True):
             response = client_with_auth.post("/ocr-local/parse-llm", json=payload)

    assert response.status_code == 200
    data = response.json()
    assert len(data["warnings"]) == 1
    assert data["warnings"][0]["title"] == "Hemoglobina Alta"


if __name__ == "__main__":
    pytest.main([__file__, "-v"])

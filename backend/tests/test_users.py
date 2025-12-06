import pytest
from unittest.mock import Mock
from fastapi.testclient import TestClient
from app.main import app
from app.core.security import get_current_user
from unittest.mock import AsyncMock, patch
import httpx


# Mock data
MOCK_USER_PROFILE = {
    "id": 1,
    "user_auth_id": "user-123",
    "nombre": "Juan",
    "apellido": "Pérez",
    "email": "juan@example.com",
    "fecha_nacimiento": "1994-01-15",
    "sexo": "M",
    "ubicacion": "(18.4861, -69.9312)",
    "fecha_registro": "2024-01-01",
    "estado": True,
    "altura_cm": 180,
    "peso_kg": 75.5,
    "alergias": ["Penicilina"],
    "condiciones_medicas": ["Diabetes"],
}


@pytest.fixture
def client_with_auth(mock_supabase_client, mock_auth_user):
    """Fixture que proporciona un cliente de test con autenticación mockeada"""
    mock_client, mock_table, mock_query = mock_supabase_client
    
    def mock_get_current_user():
        return mock_auth_user
    
    app.dependency_overrides[get_current_user] = mock_get_current_user
    
    from app.routers import users
    users.supabase_client_for_user = lambda token: mock_client
    
    client = TestClient(app)
    yield client, mock_query
    
    app.dependency_overrides.clear()


def test_get_me_success(client_with_auth):
    """Test GET /users/me - Obtener perfil del usuario actual"""
    client, mock_query = client_with_auth
    mock_query.execute.return_value = Mock(data=MOCK_USER_PROFILE)

    response = client.get("/users/me")

    assert response.status_code == 200
    assert response.json()["id"] == 1
    assert response.json()["nombre"] == "Juan"
    assert response.json()["email"] == "juan@example.com"


def test_get_me_not_found(client_with_auth):
    """Test GET /users/me - Perfil no encontrado"""
    client, mock_query = client_with_auth
    mock_query.execute.return_value = Mock(data=None)

    response = client.get("/users/me")

    assert response.status_code == 404
    assert "no encontrado" in response.json()["detail"].lower()


def test_get_me_with_ubicacion_format(client_with_auth):
    """Test GET /users/me - Formatea correctamente la ubicación"""
    client, mock_query = client_with_auth
    
    user_data = MOCK_USER_PROFILE.copy()
    mock_query.execute.return_value = Mock(data=user_data)

    response = client.get("/users/me")

    assert response.status_code == 200
    # La ubicación ya viene formateada desde el mock
    ubicacion = response.json()["ubicacion"]
    assert isinstance(ubicacion, str)
    assert "18.4861" in ubicacion


# --- Pruebas de Autenticación (TC-001 a TC-008) ---

@pytest.mark.asyncio
async def test_register_success():
    """TC-001: Registrar usuario con datos válidos"""
    payload = {
        "email": "newuser@example.com",
        "password": "securePassword123",
        "nombre": "Nuevo",
        "apellido": "Usuario",
        "fecha_nacimiento": "1990-01-01",
        "sexo": "M"
    }
    
    # Mock httpx response for Supabase signup
    mock_response = Mock()
    mock_response.status_code = 200
    mock_response.json.return_value = {"id": "new-user-id", "email": "newuser@example.com"}

    with patch("httpx.AsyncClient.post", new_callable=AsyncMock) as mock_post:
        mock_post.return_value = mock_response
        
        # Usamos TestClient pero ojo, auth.py usa async httpx dentro. 
        # TestClient de Starlette/FastAPI maneja async endpoints correctamente.
        with TestClient(app) as client:
            response = client.post("/auth/register", json=payload)

    assert response.status_code == 200
    assert response.json()["ok"] is True


def test_register_missing_fields():
    """TC-002: Validar error al dejar campos obligatorios vacíos"""
    payload = {
        "email": "", # Vacío
        "password": "" 
    }
    
    with TestClient(app) as client:
        response = client.post("/auth/register", json=payload)

    assert response.status_code == 400
    assert "requeridos" in response.json()["detail"].lower()


@pytest.mark.asyncio
async def test_register_existing_user():
    """TC-004: Validar registro de usuario ya existente"""
    payload = {
        "email": "existing@example.com",
        "password": "password123"
    }

    # Mock error from Supabase
    mock_response = Mock()
    mock_response.status_code = 400
    mock_response.text = "User already registered"

    with patch("httpx.AsyncClient.post", new_callable=AsyncMock) as mock_post:
        mock_post.return_value = mock_response
        
        with TestClient(app) as client:
            response = client.post("/auth/register", json=payload)

    assert response.status_code == 400
    assert "User already registered" in response.json()["detail"]


@pytest.mark.asyncio
async def test_login_success():
    """TC-006: Iniciar sesión con credenciales correctas"""
    payload = {
        "email": "valid@example.com",
        "password": "correctPassword"
    }

    mock_response = Mock()
    mock_response.status_code = 200
    mock_response.json.return_value = {
        "access_token": "fake-jwt-token",
        "token_type": "bearer",
        "user": {"id": "user-123", "email": "valid@example.com"}
    }

    with patch("httpx.AsyncClient.post", new_callable=AsyncMock) as mock_post:
        mock_post.return_value = mock_response
        
        with TestClient(app) as client:
            response = client.post("/auth/login", json=payload)

    assert response.status_code == 200
    assert response.json()["access_token"] == "fake-jwt-token"


@pytest.mark.asyncio
async def test_login_failure():
    """TC-007, TC-008: Validar error con contraseña incorrecta o usuario no registrado"""
    payload = {
        "email": "wrong@example.com",
        "password": "wrongPassword"
    }

    # Supabase devuelve 400 o 401 para fallos de login
    mock_response = Mock()
    mock_response.status_code = 400 
    mock_response.text = "Invalid login credentials"

    with patch("httpx.AsyncClient.post", new_callable=AsyncMock) as mock_post:
        mock_post.return_value = mock_response
        
        with TestClient(app) as client:
            response = client.post("/auth/login", json=payload)

    # El backend mapea >=400 a 401 en login
    assert response.status_code == 401
    assert "inválidos" in response.json()["detail"]



if __name__ == "__main__":
    pytest.main([__file__, "-v"])

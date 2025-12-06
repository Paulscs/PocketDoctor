import pytest
from unittest.mock import Mock
from fastapi.testclient import TestClient
from app.main import app
from app.core.security import get_current_user


# Mock data
MOCK_ESPECIALISTA = {
    "id": 1,
    "nombre": "Juan",
    "apellido": "Pérez",
    "especialidad": ["Cardiología"],
    "ubicacion_geografica": "18.4861,-69.9312",
    "contacto": "juan@example.com",
    "disponibilidad": {"lunes": "09:00-17:00"},
    "estado": True,
}

MOCK_ESPECIALISTAS = [
    MOCK_ESPECIALISTA,
    {
        "id": 2,
        "nombre": "María",
        "apellido": "García",
        "especialidad": ["Pediatría"],
        "ubicacion_geografica": "19.4539,-70.3006",
        "contacto": "maria@example.com",
        "disponibilidad": {"martes": "10:00-18:00"},
        "estado": True,
    },
]


@pytest.fixture
def client_with_auth(mock_supabase_client, mock_auth_user):
    """Fixture que proporciona un cliente de test con autenticación mockeada"""
    mock_client, mock_table, mock_query = mock_supabase_client
    
    def mock_get_current_user():
        return mock_auth_user
    
    app.dependency_overrides[get_current_user] = mock_get_current_user
    
    from app.routers import especialistas
    especialistas.client_for_user = lambda token: mock_client
    
    client = TestClient(app)
    yield client, mock_query
    
    app.dependency_overrides.clear()


# --- Pruebas de Especialistas (TC-039, TC-041) ---

def test_list_especialistas_success(client_with_auth):
    """Test GET /especialistas - Lista especialistas exitosamente"""
    client, mock_query = client_with_auth
    mock_query.execute.return_value = Mock(data=MOCK_ESPECIALISTAS)

    response = client.get("/especialistas")

    assert response.status_code == 200
    assert len(response.json()) == 2
    assert response.json()[0]["nombre"] == "Juan"
    assert response.json()[1]["nombre"] == "María"


def test_list_especialistas_with_search(client_with_auth):
    """Test GET /especialistas?q=Juan - Búsqueda por nombre"""
    client, mock_query = client_with_auth
    mock_query.execute.return_value = Mock(data=[MOCK_ESPECIALISTA])

    response = client.get("/especialistas?q=Juan")

    assert response.status_code == 200
    assert len(response.json()) == 1
    assert response.json()[0]["nombre"] == "Juan"


def test_list_especialistas_empty(client_with_auth):
    """Test GET /especialistas - Sin resultados"""
    client, mock_query = client_with_auth
    mock_query.execute.return_value = Mock(data=None)

    response = client.get("/especialistas")

    assert response.status_code == 200
    assert response.json() == []


def test_list_especialistas_pagination(client_with_auth):
    """Test GET /especialistas?limit=1&offset=0 - Paginación"""
    client, mock_query = client_with_auth
    mock_query.execute.return_value = Mock(data=[MOCK_ESPECIALISTA])

    response = client.get("/especialistas?limit=1&offset=0")

    assert response.status_code == 200
    assert len(response.json()) == 1
    mock_query.range.assert_called_with(0, 0)


def test_get_especialista_by_id_success(client_with_auth):
    """Test GET /especialistas/{id} - Obtener especialista por ID"""
    client, mock_query = client_with_auth
    mock_query.execute.return_value = Mock(data=MOCK_ESPECIALISTA)

    response = client.get("/especialistas/1")

    assert response.status_code == 200
    assert response.json()["id"] == 1
    assert response.json()["nombre"] == "Juan"


def test_get_especialista_by_id_not_found(client_with_auth):
    """Test GET /especialistas/{id} - Especialista no encontrado"""
    client, mock_query = client_with_auth
    mock_query.execute.return_value = Mock(data=None)

    response = client.get("/especialistas/999")

    assert response.status_code == 404
    assert "no encontrado" in response.json()["detail"].lower()


if __name__ == "__main__":
    pytest.main([__file__, "-v"])

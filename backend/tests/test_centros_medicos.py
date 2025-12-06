import pytest
from unittest.mock import Mock
from fastapi.testclient import TestClient
from app.main import app
from app.core.security import get_current_user


# Mock data
MOCK_CENTRO = {
    "id": 1,
    "nombre": "Centro Médico Principal",
    "direccion": "Calle Principal 123",
    "telefono": "809-555-1234",
    "ciudad": "Santo Domingo",
    "provincia": "Santo Domingo",
    "rnc": "1234567",
    "ubicacion_geografica": "18.4861,-69.9312",
    "estado": True,
}

MOCK_CENTROS = [
    MOCK_CENTRO,
    {
        "id": 2,
        "nombre": "Clínica Secundaria",
        "direccion": "Calle Secundaria 456",
        "telefono": "809-555-5678",
        "ciudad": "Santiago",
        "provincia": "Santiago",
        "rnc": "7654321",
        "ubicacion_geografica": "19.4539,-70.3006",
        "estado": True,
    },
]


@pytest.fixture
def client_with_auth(mock_supabase_client, mock_auth_user):
    """Fixture que proporciona un cliente de test con autenticación mockeada"""
    mock_client, mock_table, mock_query = mock_supabase_client
    
    # Override de la dependencia get_current_user
    def mock_get_current_user():
        return mock_auth_user
    
    app.dependency_overrides[get_current_user] = mock_get_current_user
    
    # Override de client_for_user
    from app.routers import centros_medicos
    centros_medicos.client_for_user = lambda token: mock_client
    
    client = TestClient(app)
    yield client, mock_query
    
    # Limpiar overrides
    app.dependency_overrides.clear()


def test_list_centros_success(client_with_auth):
    """Test GET /centros - Lista centros exitosamente"""
    client, mock_query = client_with_auth
    
    # Configurar el mock para devolver datos
    mock_query.execute.return_value = Mock(data=MOCK_CENTROS)

    response = client.get("/centros")

    # Assertions
    assert response.status_code == 200
    assert len(response.json()) == 2
    assert response.json()[0]["nombre"] == "Centro Médico Principal"
    assert response.json()[1]["nombre"] == "Clínica Secundaria"


def test_list_centros_with_search_query(client_with_auth):
    """Test GET /centros?q=Principal - Búsqueda por nombre"""
    client, mock_query = client_with_auth
    
    # Configurar el mock para devolver datos filtrados
    mock_query.execute.return_value = Mock(data=[MOCK_CENTRO])

    response = client.get("/centros?q=Principal")

    # Assertions
    assert response.status_code == 200
    assert len(response.json()) == 1
    assert response.json()[0]["nombre"] == "Centro Médico Principal"


def test_list_centros_with_ciudad_filter(client_with_auth):
    """Test GET /centros?ciudad=Santo%20Domingo - Filtro por ciudad"""
    client, mock_query = client_with_auth
    
    filtered_centros = [MOCK_CENTRO]
    mock_query.execute.return_value = Mock(data=filtered_centros)

    response = client.get("/centros?ciudad=Santo%20Domingo")

    # Assertions
    assert response.status_code == 200
    assert len(response.json()) == 1
    assert response.json()[0]["ciudad"] == "Santo Domingo"


def test_list_centros_empty_result(client_with_auth):
    """Test GET /centros - Sin resultados"""
    client, mock_query = client_with_auth
    
    mock_query.execute.return_value = Mock(data=None)

    response = client.get("/centros")

    # Assertions
    assert response.status_code == 200
    assert response.json() == []


def test_get_centro_by_id_success(client_with_auth):
    """Test GET /centros/{id} - Obtener un centro por ID"""
    client, mock_query = client_with_auth
    
    mock_query.execute.return_value = Mock(data=MOCK_CENTRO)

    response = client.get("/centros/1")

    # Assertions
    assert response.status_code == 200
    assert response.json()["id"] == 1
    assert response.json()["nombre"] == "Centro Médico Principal"
    assert response.json()["ciudad"] == "Santo Domingo"


def test_get_centro_by_id_not_found(client_with_auth):
    """Test GET /centros/{id} - Centro no encontrado"""
    client, mock_query = client_with_auth
    
    mock_query.execute.return_value = Mock(data=None)

    response = client.get("/centros/999")

    # Assertions
    assert response.status_code == 404
    assert "no encontrado" in response.json()["detail"].lower()


def test_get_centro_especialistas(client_with_auth):
    """Test GET /centros/{id}/especialistas - Obtener especialistas de un centro"""
    client, mock_query = client_with_auth
    
    mock_especialistas = [
        {
            "especialista_id": 1,
            "nombre": "Juan",
            "apellido": "Pérez",
            "especialidad": ["Cardiología", "Medicina General"],
            "contacto": "juan@example.com",
            "centro_id": 1,
        },
        {
            "especialista_id": 2,
            "nombre": "María",
            "apellido": "García",
            "especialidad": ["Pediatría"],
            "contacto": "maria@example.com",
            "centro_id": 1,
        },
    ]

    mock_query.execute.return_value = Mock(data=mock_especialistas)

    response = client.get("/centros/1/especialistas")

    # Assertions
    assert response.status_code == 200
    assert len(response.json()) == 2
    assert response.json()[0]["nombre"] == "Juan"
    assert response.json()[1]["nombre"] == "María"


def test_list_centros_pagination(client_with_auth):
    """Test GET /centros?limit=1&offset=0 - Paginación"""
    client, mock_query = client_with_auth
    
    mock_query.execute.return_value = Mock(data=[MOCK_CENTRO])

    response = client.get("/centros?limit=1&offset=0")

    # Assertions
    assert response.status_code == 200
    assert len(response.json()) == 1
    # Verificar que range fue llamado con los parámetros correctos
    mock_query.range.assert_called_with(0, 0)


if __name__ == "__main__":
    pytest.main([__file__, "-v"])

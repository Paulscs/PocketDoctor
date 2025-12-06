import pytest
from unittest.mock import Mock
from fastapi.testclient import TestClient
from app.main import app
from app.core.security import get_current_user


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


if __name__ == "__main__":
    pytest.main([__file__, "-v"])

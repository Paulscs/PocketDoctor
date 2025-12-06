import pytest
from unittest.mock import Mock
from fastapi.testclient import TestClient
from app.main import app
from app.core.security import get_current_user


# Mock data
MOCK_HISTORIAL = {
    "id": 1,
    "usuario_id": 1,
    "condiciones_previas": "Diabetes Tipo 2",
    "alergias": "Penicilina, Asma",
    "tipo_sangre": "O+",
    "raza": "Latinoamericano",
    "fecha_actualizacion": "2024-01-01",
    "estado": True,
}


@pytest.fixture
def client_with_auth(mock_supabase_client, mock_auth_user):
    """Fixture que proporciona un cliente de test con autenticación mockeada"""
    mock_client, mock_table, mock_query = mock_supabase_client
    
    def mock_get_current_user():
        return mock_auth_user
    
    app.dependency_overrides[get_current_user] = mock_get_current_user
    
    from app.routers import historial
    historial.client_for_user = lambda token: mock_client
    
    client = TestClient(app)
    yield client, mock_query, mock_table
    
    app.dependency_overrides.clear()


# --- Pruebas de Historial (TC-017, TC-019, TC-042 - TC-050) ---

def test_get_my_historial_success(client_with_auth):
    """Test GET /historial/me - Obtener historial del usuario actual"""
    client, mock_query, mock_table = client_with_auth
    
    # Mock para get_mi_usuario_id
    mock_query.execute.side_effect = [
        Mock(data=[{"id": 1}]),  # Primera llamada para obtener usuario_id
        Mock(data=[MOCK_HISTORIAL]),  # Segunda llamada para obtener historial
    ]

    response = client.get("/historial/me")

    assert response.status_code == 200
    assert response.json()["id"] == 1
    assert response.json()["usuario_id"] == 1
    assert "Penicilina" in response.json()["alergias"]


def test_get_my_historial_not_found(client_with_auth):
    """Test GET /historial/me - Historial no encontrado"""
    client, mock_query, mock_table = client_with_auth
    
    # Mock: usuario existe pero no tiene historial
    mock_query.execute.side_effect = [
        Mock(data=[{"id": 1}]),  # Usuario encontrado
        Mock(data=None),  # Historial no encontrado
    ]

    response = client.get("/historial/me")

    assert response.status_code == 404
    assert "no encontrado" in response.json()["detail"].lower()


def test_get_my_historial_usuario_not_found(client_with_auth):
    """Test GET /historial/me - Usuario no encontrado"""
    client, mock_query, mock_table = client_with_auth
    
    # Mock: usuario no existe
    mock_query.execute.return_value = Mock(data=None)

    response = client.get("/historial/me")

    assert response.status_code == 404
    assert "perfil" in response.json()["detail"].lower()


def test_get_historial_by_usuario_admin(client_with_auth):
    """Test GET /historial/{usuario_id} - Admin obtiene historial de otro usuario"""
    client, mock_query, mock_table = client_with_auth
    
    # Mock para ensure_admin_or_403 debe retornar admin=true
    # Mock para el read final
    mock_query.execute.side_effect = [
        Mock(data={"id": 1, "es_admin": True}),  # ensure_admin_or_403 check
        Mock(data=[MOCK_HISTORIAL]),  # read historial
    ]

    response = client.get("/historial/1")

    assert response.status_code == 200
    assert response.json()["usuario_id"] == 1


def test_get_historial_by_usuario_not_found(client_with_auth):
    """Test GET /historial/{usuario_id} - Historial de usuario no encontrado"""
    client, mock_query, mock_table = client_with_auth
    
    mock_query.execute.side_effect = [
        Mock(data={"id": 1, "es_admin": True}),  # ensure_admin_or_403 check
        Mock(data=None),  # read historial - no existe
    ]

    response = client.get("/historial/999")

    assert response.status_code == 404
    assert "no encontrado" in response.json()["detail"].lower()






if __name__ == "__main__":
    pytest.main([__file__, "-v"])

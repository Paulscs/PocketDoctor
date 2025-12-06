"""
conftest.py - Fixtures compartidas entre tests

Este archivo contiene fixtures reutilizables para todos los tests
de los routers que usan Supabase y autenticación.
"""
import pytest
from unittest.mock import MagicMock
from app.core.security import AuthUser


MOCK_AUTH_USER = AuthUser(
    sub="user-123",
    email="test@example.com",
    token="mock_token_xyz",
)


@pytest.fixture
def mock_auth_user():
    """Fixture que proporciona un usuario autenticado mockeado"""
    return MOCK_AUTH_USER


@pytest.fixture
def mock_supabase_client():
    """
    Fixture que simula un cliente de Supabase con todas las
    operaciones básicas (select, insert, update, delete, etc.)
    """
    mock_client = MagicMock()
    mock_table = MagicMock()
    mock_query = MagicMock()

    # Configurar la cadena de llamadas para query builder pattern
    mock_table.select.return_value = mock_query
    mock_query.ilike.return_value = mock_query
    mock_query.eq.return_value = mock_query
    mock_query.range.return_value = mock_query
    mock_query.single.return_value = mock_query
    mock_query.limit.return_value = mock_query
    mock_query.update.return_value = mock_query
    mock_query.insert.return_value = mock_query
    mock_query.delete.return_value = mock_query

    mock_client.table.return_value = mock_table
    mock_client.postgrest.auth = MagicMock()
    
    return mock_client, mock_table, mock_query

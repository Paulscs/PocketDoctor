# Tests del Backend - PocketDoctor

Este directorio contiene los tests funcionales automatizados para los routers de la API.

## Estructura

```
tests/
├── conftest.py                    # Fixtures compartidas
├── test_centros_medicos.py        # Tests para GET /centros
├── test_especialistas.py          # Tests para GET /especialistas
├── test_users.py                  # Tests para GET /users
├── test_historial.py              # Tests para GET /historial
└── __init__.py
```

## Características

- ✅ **Sin conexión real a Supabase**: Todos los tests usan mocks
- ✅ **Automatizados**: Se ejecutan con pytest
- ✅ **Cobertura completa**: Cubren casos exitosos, errores 404, búsqueda, filtros, paginación
- ✅ **Fixtures reutilizables**: `conftest.py` proporciona mocks comunes

## Instalación

Las dependencias ya están en `requirements.txt`. Solo necesitas instalar:

```bash
pip install pytest pytest-asyncio
```

O desde requirements.txt:

```bash
pip install -r requirements.txt
```

## Ejecución

### Ejecutar todos los tests:

```bash
pytest tests/ -v
```

### Ejecutar un archivo específico:

```bash
pytest tests/test_centros_medicos.py -v
pytest tests/test_especialistas.py -v
pytest tests/test_users.py -v
pytest tests/test_historial.py -v
```

### Ejecutar un test específico:

```bash
pytest tests/test_centros_medicos.py::test_list_centros_success -v
```

### Con reporte de cobertura:

```bash
pytest tests/ -v --cov=app --cov-report=html
```

## Tests disponibles

### test_centros_medicos.py

- `test_list_centros_success` - Lista centros exitosamente
- `test_list_centros_with_search_query` - Búsqueda por nombre
- `test_list_centros_with_ciudad_filter` - Filtro por ciudad
- `test_list_centros_empty_result` - Sin resultados
- `test_list_centros_pagination` - Paginación
- `test_get_centro_by_id_success` - Obtener centro por ID
- `test_get_centro_by_id_not_found` - Centro no encontrado (404)
- `test_get_centro_especialistas` - Obtener especialistas de un centro

### test_especialistas.py

- `test_list_especialistas_success` - Lista especialistas
- `test_list_especialistas_with_search` - Búsqueda por nombre
- `test_list_especialistas_empty` - Sin resultados
- `test_list_especialistas_pagination` - Paginación
- `test_get_especialista_by_id_success` - Obtener especialista por ID
- `test_get_especialista_by_id_not_found` - Especialista no encontrado (404)

### test_users.py

- `test_get_me_success` - Obtener perfil del usuario actual
- `test_get_me_not_found` - Perfil no encontrado (404)
- `test_get_me_with_ubicacion_format` - Formatea correctamente la ubicación

### test_historial.py

- `test_get_my_historial_success` - Obtener historial del usuario actual
- `test_get_my_historial_not_found` - Historial no encontrado (404)
- `test_get_my_historial_usuario_not_found` - Usuario no encontrado (404)
- `test_get_historial_by_usuario_admin` - Admin obtiene historial de otro usuario
- `test_get_historial_by_usuario_not_found` - Historial de usuario no encontrado
- `test_upsert_my_historial_create` - Crear historial nuevo (upsert: insert)
- `test_upsert_my_historial_update` - Actualizar historial existente (upsert: update)

## Cómo funcionan los mocks

1. **conftest.py**: Define fixtures base (`mock_auth_user`, `mock_supabase_client`)
2. **Cada test file**: Define su propio `client_with_auth` que:

   - Overridea `get_current_user` en FastAPI
   - Reemplaza el cliente de Supabase por un mock
   - Proporciona un `TestClient` listo para hacer requests

3. **Mock data**: Cada archivo tiene datos ficticios realistas para testing

## Ejemplo de test

```python
def test_list_centros_success(client_with_auth):
    """Test GET /centros - Lista centros exitosamente"""
    client, mock_query = client_with_auth
    mock_query.execute.return_value = Mock(data=MOCK_CENTROS)

    response = client.get("/centros")

    assert response.status_code == 200
    assert len(response.json()) == 2
```

## Troubleshooting

### ImportError: No module named 'pytest'

```bash
pip install pytest
```

### Tests fallan con 401 Unauthorized

Verifica que `app.dependency_overrides[get_current_user]` esté configurado en la fixture.

### Los mocks no funcionan

Asegúrate de que el orden de imports es correcto y que usas `from conftest import MOCK_AUTH_USER`.

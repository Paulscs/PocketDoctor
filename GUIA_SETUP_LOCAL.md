# Guía de Configuración Local (IPv4)

Esta guía es para configurar el proyecto usando tu dirección IP local (IPv4) para que el celular y la computadora se conecten a través de la misma red Wi-Fi, sin necesidad de túneles (como localtunnel).

## Requisitos Previos

1.  **Misma Red Wi-Fi**: Tu computadora y tu celular deben estar conectados a la misma red Wi-Fi.
2.  **Firewall**: Asegúrate de que tu firewall de Windows permita conexiones entrantes al puerto `8000` (Python) y `8081` (Expo). Si tienes problemas, prueba desactivar el firewall momentáneamente para probar.

## Pasos

### 1. Obtener tu IPv4
Ya la tienes, pero por si acaso:
- Abre una terminal (PowerShell o CMD).
- Ejecuta: `ipconfig`
- Busca "Dirección IPv4" (ej. `192.168.1.15`). Copiála.

### 2. Configurar y Correr el Backend (Servidor)

1.  Abre una terminal en la carpeta `backend`.
2.  Activa el entorno virtual:
    ```powershell
    .\venv\Scripts\Activate
    ```
3.  Instala dependencias (si no lo has hecho):
    ```powershell
    pip install -r requirements.txt
    ```
4.  **IMPORTANTE**: Corre el servidor escuchando en `0.0.0.0` para permitir conexiones externas:
    ```powershell
    python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
    ```
    *(No cierres esta terminal)*

### 3. Configurar el Frontend (App Móvil)

1.  Ve a la carpeta `frontend/pocket-doctor`.
2.  Crea o edita el archivo `.env` en esa carpeta.
3.  Busca la variable `EXPO_PUBLIC_API_BASE_URL` y pon tu IPv4:
    ```ini
    EXPO_PUBLIC_API_BASE_URL=http://<TU_IPV4_AQUI>:8000
    # Ejemplo:
    # EXPO_PUBLIC_API_BASE_URL=http://192.168.1.15:8000
    ```
    *Asegurate de poner `http://` y no `https://`.*

### 4. Correr la App

1.  En una nueva terminal en `frontend/pocket-doctor`:
    ```powershell
    npx expo start --clear
    ```
2.  Escanea el código QR con tu celular (usando la app **Expo Go** en Android o la cámara en iOS).

---

### Solución de Problemas Comunes

*   **Error de conexión / Network Error**:
    *   Verifica que la IP en el `.env` sea correcta.
    *   Verifica que ambos dispositivos estén en la misma Wi-Fi.
    *   Revisa el Firewall de Windows.
*   **La app no carga cambios**:
    *   Cierra la app en el celular y vuelve a abrirla.
    *   Reinicia el servidor de Expo con `r` en la terminal.

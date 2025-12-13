# 🩺 Pocket Doctor

**Pocket Doctor** es un asistente médico personal impulsado por Inteligencia Artificial, diseñado para ayudar a los usuarios a entender sus análisis de laboratorio de manera clara, accesible y sin tecnicismos.

> 🎓 **Proyecto Académico:** Esta aplicación es un prototipo funcional desarrollado con fines educativos. **No reemplaza el consejo médico profesional.**

---

## ✨ Características Principales

### 🔍 Análisis IA de Resultados y OCR
Sube una foto o PDF de tus análisis de laboratorio. Pocket Doctor utiliza **Google Gemini 2.5 Flash** para:
*   Extraer automáticamente los datos (OCR avanzado).
*   Interpretar cada valor (Alto/Bajo/Normal).
*   Generar un resumen comprensible de tu estado de salud.
*   Detectar posibles alertas o riesgos que requieren atención.

### 💬 Asistente Médico Interactivo (Simulación)
¿Tienes dudas sobre tus resultados? Chatea con nuestro asistente virtual:
*   Pregunta "¿Qué significa este valor?".
*   Recibe recomendaciones de estilo de vida.
*   Obtén una lista de preguntas sugeridas para tu próxima cita médica.
*   *Nota: El chat utiliza una base de conocimientos generada por la IA para garantizar respuestas precisas y seguras.*

### 📂 Historial Médico
Guarda todos tus análisis en un solo lugar. Accede a tus reportes pasados en cualquier momento, incluso sin conexión.

### 📍 Mapa de Clínicas
Encuentra rápidamente laboratorios y centros médicos cercanos a tu ubicación (Integración con mapas locales).

---

## 🛠️ Stack Tecnológico

La arquitectura de Pocket Doctor es moderna, escalable y eficiente:

### 📱 Frontend (Móvil)
*   **Framework:** [React Native](https://reactnative.dev/) con **Expo**.
*   **Lenguaje:** TypeScript.
*   **Estado:** Zustand (Gestión ligera y rápida).
*   **UI/UX:** Diseño personalizado, animaciones fluidas, y soporte para Modo Oscuro/Claro.

### ⚡ Backend (API)
*   **Framework:** [FastAPI](https://fastapi.tiangolo.com/) (Python).
*   **IA & NLP:** Google Gemini 2.5 Flash (vía Google GenAI SDK).
*   **Procesamiento:** `pdf2image`, `Pillow` para manejo de archivos.

### ☁️ Infraestructura & Servicios
*   **Base de Datos & Auth:** [Supabase](https://supabase.com/) (PostgreSQL).
*   **Almacenamiento:** Supabase Storage (para archivos médicos).

---

## 🚀 Instalación y Ejecución

### Requisitos Previos
*   Node.js & npm/yarn
*   Python 3.10+
*   Cuenta de Expo (opcional para desarrollo móvil)

### 1. Configurar Backend
```bash
cd backend
python -m venv venv
# Windows
.\venv\Scripts\activate
# Mac/Linux
source venv/bin/activate

pip install -r requirements.txt
uvicorn app.main:app --reload
```

### 2. Configurar Frontend
```bash
cd frontend/pocket-doctor
npm install
npx expo start
```

---

## ⚠️ Descargo de Responsabilidad
Pocket Doctor es una herramienta **informativa**. La interpretación de la IA puede contener errores. Siempre validez tus resultados con un médico certificado antes de tomar decisiones de salud.

---

*Última actualización: Diciembre 2025*

# Análisis del Stack Tecnológico

## Resumen
**PocketDoctor** es un asistente médico móvil avanzado construido con una arquitectura moderna y escalable. Utiliza **React Native** para una experiencia nativa fluida y un backend en **Python (FastAPI)** potenciado por Inteligencia Artificial para el procesamiento de documentos médicos.

---

## 📱 Frontend (Aplicación Móvil)
**Framework Principal**: React Native (Expo SDK 54)
**Lenguaje**: TypeScript

### Tecnologías Clave
| Categoría | Tecnología | Propósito |
| :--- | :--- | :--- |
| **Framework** | `expo` | Plataforma de desarrollo unificada para iOS y Android. |
| **Navegación** | `expo-router` | Sistema de ruteo basado en archivos (similar a Next.js). |
| **Estado Global** | `zustand` | Gestión de estado ligera y eficiente. |
| **Mapas** | `react-native-maps` | Integración de mapas nativos (Google Maps en Android). |
| **Base de Datos & Auth** | `@supabase/supabase-js` | Conexión en tiempo real y autenticación de usuarios. |
| **Animaciones** | `react-native-reanimated` | Motor de animaciones de alto rendimiento (60fps). |

---

## 🚀 Backend (API e Inteligencia Artificial)
**Framework Principal**: FastAPI (Python 3.10)
**Infraestructura**: Docker

### Tecnologías Clave
| Categoría | Tecnología | Propósito |
| :--- | :--- | :--- |
| **Motor OCR** | `python-doctr` | **Reconocimiento Óptico de Caracteres**. Extrae texto de análisis clínicos con alta precisión utilizando modelos de Deep Learning. |
| **Deep Learning** | `torch` (PyTorch) | Motor de redes neuronales que impulsa el sistema de OCR. |
| **Inteligencia Artificial** | `openai` | Análisis semántico y diagnóstico preliminar de los datos médicos extraídos. |
| **Visión Computarizada** | `opencv` | Pre-procesamiento de imágenes para mejorar la legibilidad antes del análisis. |
| **Servidor Web** | `fastapi` | API asíncrona de alto rendimiento para gestionar las peticiones de la app. |

---

## ☁️ Infraestructura y Despliegue
*   **Base de Datos**: Supabase (PostgreSQL)
*   **Alojamiento Backend**: Render (Containerizado con Docker)
*   **Distribución Móvil**: Expo EAS (Generación de APKs en la nube)

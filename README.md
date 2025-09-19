# 🩺 Pocket Doctor

Pocket Doctor es una aplicación móvil multiplataforma desarrollada con **React Native (Expo)** y un backend en **FastAPI (Python)**.  
Su propósito es ayudar a los usuarios a **interpretar de forma clara y accesible resultados de laboratorio clínico**, utilizando tecnologías de **OCR (Tesseract, OpenCV)** e **inteligencia artificial**.  

⚠️ **Nota importante:** Pocket Doctor **no reemplaza diagnósticos médicos**. Su función es **informativa y educativa**, orientando al usuario para que consulte con profesionales de la salud.

---

## 🚀 Propósito del Proyecto
- Democratizar el acceso a la interpretación básica de resultados clínicos.
- Reducir la ansiedad del usuario mientras espera la opinión de un profesional.
- Promover la educación en salud y la toma de decisiones informada.
- Reforzar la privacidad y seguridad en el manejo de datos clínicos.

---

## 📌 Funcionalidades principales (MVP)
- 📄 Carga de documentos clínicos en formato **PDF o imagen**.  
- 🔍 Extracción automática de valores clínicos mediante **OCR**.  
- 🧮 Normalización y comparación de resultados con tablas de referencia.  
- 🗣️ Interpretación en **lenguaje natural** y sin tecnicismos médicos.  
- 🏥 Recomendación de especialidades médicas según los valores detectados.  
- 📍 Consulta de una base de datos de **clínicas y especialistas en RD**.  
- 📑 Exportación de resultados en formato **PDF**.  
- 👤 Registro e inicio de sesión con datos básicos del usuario.  

---

## 🛠️ Stack Tecnológico
### Frontend
- [React Native](https://reactnative.dev/) (Expo)  
- Interfaz accesible y amigable (cumple con **WCAG 2.1 AA**).  

### Backend
- [FastAPI](https://fastapi.tiangolo.com/) (Python).  
- [Tesseract OCR](https://github.com/tesseract-ocr/tesseract) + [OpenCV](https://opencv.org/) para análisis de imágenes.  
- [Supabase PostgreSQL](https://supabase.com/) para almacenamiento de datos clínicos.  

### Infraestructura
- Contenerización con **Docker**.  
- Despliegue en **Heroku/Azure**.  
- Autenticación con **JWT** y Supabase Auth.  

---

## 📂 Estructura del Proyecto

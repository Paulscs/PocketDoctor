from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .core.config import settings
from .routers import auth_guard, users, auth, centros_medicos, especialistas, historial, files, ocr_local as ocr, parse_llm


app = FastAPI(title=settings.API_NAME, version=settings.API_VERSION)

# Ajusta origins según tu frontend (si ya lo tienes)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_guard.router)
app.include_router(users.router)
app.include_router(auth.router)
app.include_router(centros_medicos.router)
app.include_router(especialistas.router)
app.include_router(historial.router)
app.include_router(files.router)
app.include_router(ocr.router)
app.include_router(parse_llm.router)


@app.get("/health")
def health():
    return {"status": "ok"}

@app.get("/")
def root():
    return {"message": "Hello Pocket Doctor!"}

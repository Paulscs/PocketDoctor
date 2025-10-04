from fastapi import FastAPI
from .routers import centros_medicos  

app = FastAPI(title="Pocket Doctor API")
app.include_router(centros_medicos.router, prefix="/api/v1")  

@app.get("/")
def root():
    return {"message": "Hello Pocket Doctor!"}

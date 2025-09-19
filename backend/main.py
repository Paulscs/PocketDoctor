from fastapi import FastAPI
from supabase import create_client, Client
from dotenv import load_dotenv
import os

# Cargar variables de entorno
load_dotenv()

# Inicializar Supabase
url = os.getenv("SUPABASE_URL")
key = os.getenv("SUPABASE_KEY")
supabase: Client = create_client(url, key)

app = FastAPI()

@app.get("/")
def root():
    return {"message": "Hello Pocket Doctor!"}

@app.get("/clinicas")
def get_clinicas():
    """
    Ejemplo de consulta a la tabla 'clinicas'
    """
    try:
        data = supabase.table("clinicas").select("*").execute()
        return {"status": "ok", "data": data.data}
    except Exception as e:
        return {"status": "error", "detail": str(e)}

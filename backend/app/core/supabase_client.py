import os
from dotenv import load_dotenv
from supabase import create_client, Client

load_dotenv()  # lee .env

SUPABASE_URL = os.getenv("SUPABASE_URL", "")
SUPABASE_KEY = os.getenv("SUPABASE_KEY", "")

if not SUPABASE_URL or not SUPABASE_KEY:
    raise RuntimeError("Faltan SUPABASE_URL o SUPABASE_KEY en el .env")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

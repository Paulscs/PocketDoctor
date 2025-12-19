
import os
from dotenv import load_dotenv

print("--- DEBUG ENV START ---")
load_dotenv(verbose=True)
service_key = os.getenv("SUPABASE_SERVICE_KEY")
print(f"os.getenv('SUPABASE_SERVICE_KEY'): {service_key}")

try:
    from app.core.config import settings
    print(f"settings.SUPABASE_SERVICE_KEY: {settings.SUPABASE_SERVICE_KEY}")
except Exception as e:
    print(f"Error loading settings: {e}")

print("--- DEBUG ENV END ---")

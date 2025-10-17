# backend/get_token.py
import httpx
from app.core.config import settings  # <- reusa tu config que ya lee .env

EMAIL = "paulscalderon2@gmail.com"
PASSWORD = "prueba1234"

def signup_if_needed():
    url = f"{settings.SUPABASE_URL}/auth/v1/signup"
    headers = {"apikey": settings.SUPABASE_KEY, "Content-Type": "application/json"}
    body = {"email": EMAIL, "password": PASSWORD}
    try:
        r = httpx.post(url, headers=headers, json=body, timeout=15)
        print("Signup status:", r.status_code)
    except Exception as e:
        print("Signup error (seguimos):", e)

def login_and_print_token():
    url = f"{settings.SUPABASE_URL}/auth/v1/token?grant_type=password"
    headers = {"apikey": settings.SUPABASE_KEY, "Content-Type": "application/json"}
    body = {"email": EMAIL, "password": PASSWORD}
    r = httpx.post(url, headers=headers, json=body, timeout=15)
    r.raise_for_status()
    data = r.json()
    token = data.get("access_token")
    print("\n=== ACCESS TOKEN  ===\n")
    print(token)
    print("\n=== FIN TOKEN ===\n")

if __name__ == "__main__":
    signup_if_needed()
    # login y mostrar token
    login_and_print_token()

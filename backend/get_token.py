# backend/get_token.py
import httpx
from app.core.config import settings

EMAIL = "keloke123@gmail.com"
PASSWORD = "123456"

# Prefer using the ANON key here. SERVICE_ROLE should only be used in trusted backend code.
SUPABASE_URL = settings.SUPABASE_URL.rstrip("/")  # avoid accidental double slashes
SUPABASE_KEY = settings.SUPABASE_KEY              # ideally your ANON key for this flow

COMMON_HEADERS = {
    "apikey": SUPABASE_KEY,
    "Authorization": f"Bearer {SUPABASE_KEY}",
    "Content-Type": "application/json",
}

def signup_if_needed():
    url = f"{SUPABASE_URL}/auth/v1/signup"
    body = {"email": EMAIL, "password": PASSWORD}
    try:
        r = httpx.post(url, headers=COMMON_HEADERS, json=body, timeout=15)
        print("Signup status:", r.status_code)
        if r.status_code >= 400:
            # Show GoTrue's explanation so we know if it's "User already registered", etc.
            print("Signup response text:", r.text)
    except Exception as e:
        print("Signup error (seguimos):", e)

def login_and_print_token():
    url = f"{SUPABASE_URL}/auth/v1/token?grant_type=password"
    body = {"email": EMAIL, "password": PASSWORD}
    r = httpx.post(url, headers=COMMON_HEADERS, json=body, timeout=15)
    if r.status_code >= 400:
        print("Login response text:", r.text)
    r.raise_for_status()
    data = r.json()
    token = data.get("access_token")
    print("\n=== ACCESS TOKEN  ===\n")
    print(token)
    print("\n=== FIN TOKEN ===\n")

if __name__ == "__main__":
    signup_if_needed()
    login_and_print_token()

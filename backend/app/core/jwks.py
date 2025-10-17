import httpx
from jose import jwk
from jose.utils import base64url_decode
from typing import Any

class JWKSCache:
    def __init__(self, url: str):
        self.url = url
        self._jwks: dict[str, Any] | None = None

    async def get(self) -> dict[str, Any]:
        if self._jwks is None:
            async with httpx.AsyncClient(timeout=10) as client:
                r = await client.get(self.url)
                r.raise_for_status()
                self._jwks = r.json()
        return self._jwks

    async def find_key(self, kid: str) -> dict[str, Any] | None:
        jwks = await self.get()
        for key in jwks.get("keys", []):
            if key.get("kid") == kid:
                return key
        return None

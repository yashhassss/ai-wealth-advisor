import base64
import json
from fastapi import Request
from slowapi import Limiter
from slowapi.util import get_remote_address
import logging

logger = logging.getLogger(__name__)

def get_user_or_ip(request: Request) -> str:
    """
    Extracts the user ID from the JWT token for user-based rate limiting.
    Falls back to the IP address if no token is present or parsing fails.
    Since slowapi runs before dependencies, we decode the JWT payload manually without signature verification
    (verification happens safely in the auth dependency later).
    """
    auth_header = request.headers.get("Authorization")
    if auth_header and auth_header.startswith("Bearer "):
        token = auth_header.split(" ")[1]
        try:
            parts = token.split(".")
            if len(parts) >= 2:
                payload_b64 = parts[1]
                # Add padding if necessary
                payload_b64 += "=" * ((4 - len(payload_b64) % 4) % 4)
                payload = json.loads(base64.urlsafe_b64decode(payload_b64).decode("utf-8"))
                if "sub" in payload:
                    return f"user:{payload['sub']}"
        except Exception as e:
            # Ignore parsing errors here; auth dependency will explicitly reject invalid tokens
            pass
            
    # Fallback to IP address
    return f"ip:{get_remote_address(request)}"

# Initialize the rate limiter with the custom key function
limiter = Limiter(key_func=get_user_or_ip)

from datetime import datetime, timedelta
from typing import Any, Dict
import os

from jose import jwt
from dotenv import load_dotenv

load_dotenv()

# Configurable via .env
SECRET_KEY = os.environ.get("JWT_SECRET", "dev-secret-change-me")
ALGORITHM = os.environ.get("JWT_ALGORITHM", "HS256")
try:
    ACCESS_TOKEN_EXPIRE_MINUTES = int(os.environ.get("ACCESS_TOKEN_EXPIRE_MINUTES", "1440"))
except ValueError:
    ACCESS_TOKEN_EXPIRE_MINUTES = 1440


def create_access_token(subject: str, extra: Dict[str, Any] | None = None) -> str:
    now = datetime.utcnow()
    payload = {"sub": subject, "iat": int(now.timestamp())}
    if extra:
        payload.update(extra)
    expire = now + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    payload.update({"exp": int(expire.timestamp())})
    token = jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)
    return token

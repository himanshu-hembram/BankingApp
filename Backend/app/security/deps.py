from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import jwt, JWTError
from app.db import get_db
from sqlalchemy.ext.asyncio import AsyncSession
from app.crud.admin import get_admin_by_id
from app.security.jwt import SECRET_KEY, ALGORITHM

bearer_scheme = HTTPBearer()


async def get_current_admin(
    creds: HTTPAuthorizationCredentials = Depends(bearer_scheme), db: AsyncSession = Depends(get_db)
):
    """Dependency that returns the Admin model for the token's subject.

    Raises 401 if token is missing/invalid or admin not found.
    """
    token = creds.credentials
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        sub = payload.get('sub')
        if not sub:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail='Invalid token')
    except JWTError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail='Invalid token')

    admin = await get_admin_by_id(db, sub)
    if not admin:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail='Admin not found')
    return admin

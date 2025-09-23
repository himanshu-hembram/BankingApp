from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.db import get_db
from app.schemas.admin import AdminRegisterIn, AdminOut
from app.security.password import hash_password
from app.crud.admin import get_admin_by_username, get_admin_by_email, create_admin

router = APIRouter(prefix="/admin", tags=["admin"])

@router.post("/register", response_model=AdminOut, status_code=status.HTTP_201_CREATED)
async def register_admin(payload: AdminRegisterIn, db: AsyncSession = Depends(get_db)):
    username = payload.userName.strip()
    email = payload.userEmail.lower().strip()

    if await get_admin_by_username(db, username):
        raise HTTPException(status_code=409, detail="Username already exists")

    if await get_admin_by_email(db, email):
        raise HTTPException(status_code=409, detail="Email already exists")

    admin = await create_admin(db, username=username, email=email, password_hash=hash_password(payload.password))
    return AdminOut(admin_id=str(admin.admin_id), userName=admin.username, userEmail=admin.email)

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.db import get_db
from app.schemas.admin import AdminRegisterIn, AdminOut, AdminLoginIn, TokenOut
from app.security.password import hash_password, verify_password
from app.security.jwt import create_access_token
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


@router.post("/login", response_model=TokenOut)
async def login_admin(payload: AdminLoginIn, db: AsyncSession = Depends(get_db)):
    identifier = payload.identifier.strip()

    # Try username first, then email
    admin = await get_admin_by_username(db, identifier)
    if not admin:
        admin = await get_admin_by_email(db, identifier.lower())

    if not admin:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")

    if not verify_password(payload.password, admin.password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")

    # Subject is admin_id (UUID string)
    token = create_access_token(subject=str(admin.admin_id), extra={"username": admin.username, "email": admin.email})
    return TokenOut(
        access_token=token,
        userId=str(admin.admin_id),
        userName=admin.username,
        userEmailid=admin.email,
    )

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.models import Admin

async def get_admin_by_username(db: AsyncSession, username: str) -> Admin | None:
    res = await db.execute(select(Admin).where(Admin.username == username))
    return res.scalars().first()

async def get_admin_by_email(db: AsyncSession, email: str) -> Admin | None:
    res = await db.execute(select(Admin).where(Admin.email == email))
    return res.scalars().first()

async def create_admin(db: AsyncSession, username: str, email: str, password_hash: str) -> Admin:
    admin = Admin(username=username, email=email, password_hash=password_hash)
    db.add(admin)
    await db.commit()
    await db.refresh(admin)
    return admin

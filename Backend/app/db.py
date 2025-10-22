# app/db.py
from sqlalchemy.orm import declarative_base
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncEngine, AsyncSession


# Load from .env if present, otherwise fall back to the default
from dotenv import load_dotenv
import os

load_dotenv()

# Use asyncpg driver
DATABASE_URL = os.environ.get(
    "DATABASE_URL",
    "postgresql+asyncpg://postgres:Training%40123@104.154.187.244:5432/banking_db",
)

# Global SQLAlchemy objects
Base = declarative_base()
engine: AsyncEngine = create_async_engine(DATABASE_URL, pool_pre_ping=True)
AsyncSessionLocal = async_sessionmaker(bind=engine, class_=AsyncSession, expire_on_commit=False)

# Session dependency
async def get_db():
    async with AsyncSessionLocal() as session:
        yield session

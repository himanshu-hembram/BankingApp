# app/db.py
from sqlalchemy.orm import declarative_base
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncEngine, AsyncSession


# Use asyncpg driver
DATABASE_URL = "postgresql+asyncpg://sourav_jkt:jkt123@localhost:5432/bank_db_f2"

# Global SQLAlchemy objects
Base = declarative_base()
engine: AsyncEngine = create_async_engine(DATABASE_URL, pool_pre_ping=True)
AsyncSessionLocal = async_sessionmaker(bind=engine, class_=AsyncSession, expire_on_commit=False)

# Session dependency
async def get_db():
    async with AsyncSessionLocal() as session:
        yield session

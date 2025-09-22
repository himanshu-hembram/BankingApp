# app/main.py
from fastapi import FastAPI
from sqlalchemy import text, inspect
from db import engine, Base, get_db

# Import models so Base.metadata is populated (ensure they use Base from app.db)
from models import *

app = FastAPI()

# Startup: create tables asynchronously
@app.on_event("startup")
async def on_startup():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    print("Database tables created")

# Health: DB connectivity
@app.get("/health/db")
async def db_health():
    async with engine.connect() as conn:
        await conn.execute(text("SELECT 1"))
    return {"status": "ok", "db": "connected"}

# Health: list tables and verify expected ones
@app.get("/health/tables")
async def tables_health():
    async with engine.connect() as conn:
        def _get_tables(sync_conn):
            insp = inspect(sync_conn)
            return insp.get_table_names()
        tables = await conn.run_sync(_get_tables)

    expected_tables = [
        "country", "state", "city", "postal_code",
        "customer_detail", "account_type", "customer_accounts",
        "saving_account_detail", "saving_account_txn_history",
        "loan_account_detail", "loan_emi_detail",
    ]
    missing = [t for t in expected_tables if t not in tables]
    if missing:
        return {"status": "error", "missing_tables": missing, "tables_found": tables}
    return {"status": "ok", "tables": tables}

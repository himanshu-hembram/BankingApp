# app/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text, inspect
from app.db import engine, Base
from app.models import *
from app.routes.admin import router as admin_router
from app.routes.customers import router as customers_router
from app.routes.account import router as account_router
from app.routes.savings_txn import router as savings_txn_router
# from app.routes.admin_sso import router as admin_sso_router

app = FastAPI()

# CORS: allow frontend dev server(s) to access the API during development
# Adjust or read from environment in production as needed.
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

# Register routers
app.include_router(admin_router)
# app.include_router(admin_sso_router)
app.include_router(customers_router)
app.include_router(account_router)
app.include_router(savings_txn_router)


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

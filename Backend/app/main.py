# app/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes.admin import router as admin_router
from app.routes.customers import router as customers_router
from app.routes.account import router as account_router
from app.routes.savings_txn import router as savings_txn_router
# from app.routes.admin_sso import router as admin_sso_router

app = FastAPI()

# CORS: allow frontend dev server(s) to access the API during development
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

# Simple health endpoint to confirm container is running
@app.get("/health")
async def health():
    return {"status": "ok"}

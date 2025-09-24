from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.db import get_db
from app.schemas.customer import CustomerCreate, CustomerOut
from app.crud.customer import create_customer, get_customer_by_email
from app.security.deps import get_current_admin

router = APIRouter(prefix="/customers", tags=["customers"])


@router.post("/", response_model=CustomerOut, status_code=status.HTTP_201_CREATED)
async def add_customer(payload: CustomerCreate, db: AsyncSession = Depends(get_db), admin=Depends(get_current_admin)):
    """Create a new customer. Only authenticated admins may call this endpoint.

    admin parameter is consumed to ensure the dependency runs (and will 401 if token is invalid).
    """
    # Check unique email
    existing = await get_customer_by_email(db, payload.EmailID)
    if existing:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Customer with this email already exists")

    try:
        cust = await create_customer(db, payload=payload.model_dump())
    except ValueError as ve:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(ve))

    return CustomerOut.from_orm(cust)

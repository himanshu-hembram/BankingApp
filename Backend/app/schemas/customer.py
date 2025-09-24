from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import date


class CustomerCreate(BaseModel):
    FirstName: str = Field(..., min_length=1)
    LastName: str = Field(..., min_length=1)
    Address1: Optional[str] = None
    Address2: Optional[str] = None
    EmailID: EmailStr
    Phone: Optional[str] = None
    Mobile: Optional[str] = None
    DOB: Optional[date] = None  # Pydantic will parse ISO date strings into date
    MaritalStatus: Optional[str] = None
    ZIPCode: Optional[str] = None
    CityName: Optional[str] = None
    StateName: Optional[str] = None
    CountryName: Optional[str] = None


class CustomerOut(BaseModel):
    CustID: int
    FirstName: str
    LastName: str
    EmailID: EmailStr
    model_config = {"from_attributes": True}

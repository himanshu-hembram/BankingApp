from pydantic import BaseModel, EmailStr, Field, condecimal
from typing import Annotated, Optional
from datetime import date
from decimal import Decimal




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


class CustomerUpdate(BaseModel):
    # All fields optional for partial updates
    FirstName: Optional[str] = None
    LastName: Optional[str] = None
    Address1: Optional[str] = None
    Address2: Optional[str] = None
    EmailID: Optional[EmailStr] = None
    Phone: Optional[str] = None
    Mobile: Optional[str] = None
    DOB: Optional[date] = None
    MaritalStatus: Optional[str] = None
    ZIPCode: Optional[str] = None
    CityName: Optional[str] = None
    StateName: Optional[str] = None
    CountryName: Optional[str] = None


class CustomerUpdateResponse(BaseModel):
    message: str
    updated_columns: list[str]
    customer: "CustomerOut"

    model_config = {"from_attributes": True}


class CustomerOut(BaseModel):
    CustID: int
    FirstName: str
    LastName: str
    EmailID: EmailStr
    model_config = {"from_attributes": True}


class CountryOut(BaseModel):
    CountryCode: int
    CountryName: str

    class Config:
        from_attributes = True  # pydantic v2
        orm_mode = True  # safe for v1 compat

class StateOut(BaseModel):
    StateCode: int
    StateName: str
    country: CountryOut | None = None

    class Config:
        from_attributes = True
        orm_mode = True

class CityOut(BaseModel):
    CityCode: int
    CityName: str
    state: StateOut | None = None

    class Config:
        from_attributes = True
        orm_mode = True

class PostalCodeOut(BaseModel):
    ZIPCode: str
    city: CityOut | None = None

    class Config:
        from_attributes = True
        orm_mode = True

class SavingTxnOut(BaseModel):
    TxnID: int
    TxnType: str
    TxnDate: date
    TxnAmount: float
    Balance: float

    class Config:
        from_attributes = True
        orm_mode = True


class LoanEMIOut(BaseModel):
    EMIID: int
    EMIAmount: float
    DueDate: date
    PaidDate: date | None = None
    Status: str

    class Config:
        from_attributes = True
        orm_mode = True


class AccountOut(BaseModel):
    AcctNum: int
    AccountType: str
    Balance: float | None = None
    transactions: list[SavingTxnOut] = []   # for savings
    emis: list[LoanEMIOut] = []             # for loans

    class Config:
        from_attributes = True
        orm_mode = True


class CustomerOutByID(BaseModel):
    CustID: int
    FirstName: str
    LastName: str
    Address1: str | None = None
    Address2: str | None = None
    EmailID: str
    Phone: str | None = None
    Mobile: str | None = None
    DOB: date | None = None
    MaritalStatus: str | None = None
    ZIPCode: str | None = None
    zipcode: PostalCodeOut | None = None
    accounts: list[AccountOut] = []

    class Config:
        from_attributes = True
        orm_mode = True




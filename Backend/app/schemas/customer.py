from pydantic import BaseModel, EmailStr, Field, condecimal
from typing import Annotated, Optional, List
from datetime import date, datetime
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
    TxnType: str | None = None
    TxnDetail: str | None = None
    TxnDate: date
    WithdrawAmount: Optional[Decimal] = Decimal("0.00")
    DepositAmount: Optional[Decimal] = Decimal("0.00")
    Balance: Optional[Decimal] = Decimal("0.00")

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


# reusable constrained decimal types
Decimal18_2 = Annotated[Decimal, condecimal(max_digits=18, decimal_places=2)]
Decimal5_2 = Annotated[Decimal, condecimal(max_digits=5, decimal_places=2)]


class SavingAccountCreate(BaseModel):
    AccountType: str                  # e.g. "Savings"
    AccSubType: Optional[str] = None
    Balance: Decimal18_2 = Decimal("0.00")
    TransferLimit: Decimal18_2
    BranchCode: str


class LoanAccountCreate(BaseModel):
    AccountType: str                  # e.g. "Loan"
    AccSubType: Optional[str] = None
    BalanceAmount: Decimal18_2
    BranchCode: str
    RateOfInterest: Decimal5_2
    LoanDuration: int                 # months
    TotalLoanAmount: Decimal18_2

class AdvSearchRequest(BaseModel):
    firstName: Optional[str] = None
    lastName: Optional[str] = None
    email: Optional[str] = None
    mobile: Optional[str] = None

class AdvSearchResponseItem(BaseModel):
    custId: int
    firstName: str
    lastName: str
    phone: Optional[str]
    email: Optional[str]

class SavingDepositRequest(BaseModel):
    AcctNum: int
    Amount: Decimal18_2 = Field(..., gt=Decimal("0"))
    # accept either 'YYYY-MM-DD' or ISO datetime; coerce later
    TxnDate: str
    TxnDetail: str | None = None

    def txn_date_as_date(self) -> date:
        # permissive parsing: date string or datetime string
        try:
            return date.fromisoformat(self.TxnDate)
        except ValueError:
            return datetime.fromisoformat(self.TxnDate).date()
class SavingWithdrawRequest(BaseModel):
    AcctNum: int
    Amount: Decimal18_2 = Field(..., gt=Decimal("0"))
    TxnDate: str
    TxnDetail: str | None = None


Decimal18_2 = Annotated[Decimal, condecimal(max_digits=18, decimal_places=2)]


class SavingAccountUpdateRequest(BaseModel):
    AcctNum: int = Field(..., gt=0)
    TransferLimit: Optional[Decimal18_2] = None
    BranchCode: Optional[str] = None
    # New inputs from user
    AccountType: Optional[str] = None
    AccSubType: Optional[str] = None


class SavingAccountDetailOut(BaseModel):
    AcctNum: int
    SavingAccTypeId: Optional[int] = None
    Balance: Optional[Decimal] = None
    TransferLimit: Optional[Decimal] = None
    BranchCode: Optional[str] = None

    class Config:
        orm_mode = True
        from_attributes = True


class SavingAccountUpdateResponse(BaseModel):
    message: str
    updated_columns: List[str]
    account_type_id: int
    saving_detail: SavingAccountDetailOut

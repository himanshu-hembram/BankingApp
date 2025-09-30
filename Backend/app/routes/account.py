# app/routers/accounts.py (async version)
from fastapi import APIRouter, HTTPException, Depends, status
from sqlalchemy import select, and_, func
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession
from app.security.deps import get_current_admin
from app.db import get_db  # returns AsyncSession
from app.models import (
    CustomerDetail, AccountType, CustomerAccounts,
    SavingAccountDetail, LoanAccountDetail
)
from app.schemas.customer import SavingAccountCreate, LoanAccountCreate

import random

router = APIRouter(prefix="/customers", tags=["accounts"])
MAX_RETRIES = 5

def normalize_type_pair(account_type: str, acc_subtype: str | None):
    t = (account_type or "").strip().title()
    st = (acc_subtype or "").strip().title() if acc_subtype else None
    return t, st

async def customer_exists(db: AsyncSession, cust_id: int) -> bool:
    result = await db.execute(
        select(func.count()).select_from(CustomerDetail).where(CustomerDetail.CustID == cust_id)
    )
    return (result.scalar_one() or 0) > 0

async def get_or_create_account_type(db: AsyncSession, account_type: str, acc_subtype: str | None) -> AccountType:
    t, st = normalize_type_pair(account_type, acc_subtype)
    q = select(AccountType).where(
        and_(
            AccountType.AccountType == t,
            (AccountType.AccSubType.is_(None) if st is None else AccountType.AccSubType == st),
        )
    )
    result = await db.execute(q)
    at = result.scalar_one_or_none()
    if at:
        return at
    at = AccountType(AccountType=t, AccSubType=st)
    db.add(at)
    await db.flush()  # assign AccountTypeID
    return at

async def has_duplicate_account(db: AsyncSession, cust_id: int, account_type_id: int) -> bool:
    result = await db.execute(
        select(func.count()).select_from(CustomerAccounts).where(
            and_(
                CustomerAccounts.CustID == cust_id,
                CustomerAccounts.AccountTypeID == account_type_id,
            )
        )
    )
    return (result.scalar_one() or 0) > 0

def generate_random_acctnum_9() -> int:
    return random.randint(100_000_000, 999_999_999)

async def create_customer_account_with_random_acctnum(
    db: AsyncSession, cust_id: int, account_type_id: int
) -> CustomerAccounts:
    last_err = None
    for _ in range(MAX_RETRIES):
        acct_num = generate_random_acctnum_9()
        ca = CustomerAccounts(AcctNum=acct_num, CustID=cust_id, AccountTypeID=account_type_id)
        db.add(ca)
        try:
            await db.flush()  # try INSERT; collision triggers IntegrityError if AcctNum is unique
            return ca
        except IntegrityError as e:
            await db.rollback()
            last_err = e
    raise HTTPException(status_code=503, detail="Unable to allocate account number, retry later")

@router.post("/{cust_id}/savings", status_code=status.HTTP_201_CREATED)
async def create_savings_account(
    cust_id: int, payload: SavingAccountCreate, db: AsyncSession = Depends(get_db),
    admin=Depends(get_current_admin)
):
    if not await customer_exists(db, cust_id):
        raise HTTPException(status_code=404, detail="Customer not found")
    at = await get_or_create_account_type(db, payload.AccountType, payload.AccSubType)

    if await has_duplicate_account(db, cust_id, at.AccountTypeID):
        raise HTTPException(status_code=409, detail="Account of this type/subtype already exists for customer")

    ca = await create_customer_account_with_random_acctnum(db, cust_id, at.AccountTypeID)

    sd = SavingAccountDetail(
        AcctNum=ca.AcctNum,
        SavingAccTypeId=at.AccountTypeID,
        Balance=payload.Balance,
        TransferLimit=payload.TransferLimit,
        BranchCode=payload.BranchCode,
    )
    db.add(sd)

    try:
        await db.commit()
    except IntegrityError:
        await db.rollback()
        raise HTTPException(status_code=409, detail="Account conflict detected")

    return {
        "AcctNum": ca.AcctNum,
        "CustID": cust_id,
        "AccountTypeID": at.AccountTypeID,
        "AccountType": at.AccountType,
        "AccSubType": at.AccSubType,
    }

@router.post("/{cust_id}/loan", status_code=status.HTTP_201_CREATED)
async def create_loan_account(
    cust_id: int, payload: LoanAccountCreate, db: AsyncSession = Depends(get_db),
    admin=Depends(get_current_admin)
):
    if not await customer_exists(db, cust_id):
        raise HTTPException(status_code=404, detail="Customer not found")
    at = await get_or_create_account_type(db, payload.AccountType, payload.AccSubType)

    if await has_duplicate_account(db, cust_id, at.AccountTypeID):
        raise HTTPException(status_code=409, detail="Account of this type/subtype already exists for customer")

    ca = await create_customer_account_with_random_acctnum(db, cust_id, at.AccountTypeID)

    ld = LoanAccountDetail(
        AcctNum=ca.AcctNum,
        EMIID=payload.EMIID,
        BalanceAmount=payload.BalanceAmount,
        BranchCode=payload.BranchCode,
        RateOfInterest=payload.RateOfInterest,
        LoanDuration=payload.LoanDuration,
        TotalLoanAmount=payload.TotalLoanAmount,
        LoanAccountTypeId=at.AccountTypeID,
    )
    db.add(ld)

    try:
        await db.commit()
    except IntegrityError:
        await db.rollback()
        raise HTTPException(status_code=409, detail="Loan conflict detected")

    return {
        "AcctNum": ca.AcctNum,
        "CustID": cust_id,
        "AccountTypeID": at.AccountTypeID,
        "AccountType": at.AccountType,
        "AccSubType": at.AccSubType,
        "EMIID": payload.EMIID,
    }

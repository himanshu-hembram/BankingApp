# app/routers/savings_txn.py
from fastapi import APIRouter, HTTPException, Depends, status
from sqlalchemy import select, and_
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession
from app.db import get_db
from app.models import SavingAccountDetail, SavingAccountTxnHistory, CustomerAccounts
from app.schemas.customer import SavingDepositRequest
from app.schemas.customer import SavingWithdrawRequest
from datetime import date, datetime
import random

router = APIRouter(prefix="/customers", tags=["savings-transactions"])

MAX_TXNID_RETRIES = 7

def generate_9_digit() -> int:
    # exactly 9 digits, no leading zero
    return random.randint(100_000_000, 999_999_999)

def parse_date_only(raw: str) -> date:
    # Accept "YYYY-MM-DD" or ISO datetime strings; store only the date
    try:
        return date.fromisoformat(raw)
    except ValueError:
        return datetime.fromisoformat(raw).date()

async def acct_belongs_to_customer(db: AsyncSession, cust_id: int, acct_num: int) -> bool:
    q = (
        select(CustomerAccounts.AcctNum)
        .where(and_(CustomerAccounts.CustID == cust_id, CustomerAccounts.AcctNum == acct_num))
        .limit(1)
    )
    res = await db.execute(q)
    return res.scalar_one_or_none() is not None

@router.post("/{cust_id}/savings/deposit", status_code=status.HTTP_201_CREATED)
async def deposit_to_savings(
    cust_id: int,
    payload: SavingDepositRequest,
    db: AsyncSession = Depends(get_db),
):
    # Verify account belongs to this customer
    if not await acct_belongs_to_customer(db, cust_id, payload.AcctNum):
        raise HTTPException(status_code=404, detail="Account not found for customer")

    # Parse TxnDate to a pure date (avoids tz issues; DB should use DATE type)
    txn_date = parse_date_only(payload.TxnDate)

    # Load current balance
    res = await db.execute(
        select(SavingAccountDetail).where(SavingAccountDetail.AcctNum == payload.AcctNum)
    )
    sad = res.scalar_one_or_none()
    if not sad:
        raise HTTPException(status_code=404, detail="Saving account detail not found")

    current = sad.Balance or 0
    new_balance = current + payload.Amount

    # Insert txn with 9-digit TxnID and update master balance, with retry on TxnID collision
    txn = None
    for _ in range(MAX_TXNID_RETRIES):
        try:
            txn = SavingAccountTxnHistory(
                TxnID=generate_9_digit(),     # 9-digit transaction id
                TxnDate=txn_date,             # store only date
                AcctNum=payload.AcctNum,
                TxnDetail=payload.TxnDetail,
                WithdrawAmount=0,
                DepositAmount=payload.Amount,
                Balance=new_balance,          # running balance after this deposit
            )
            db.add(txn)

            sad.Balance = new_balance
            db.add(sad)

            await db.flush()  # materialize TxnID uniqueness and updates
            break
        except IntegrityError:
            await db.rollback()
            # Re-read row before retry
            res = await db.execute(
                select(SavingAccountDetail).where(SavingAccountDetail.AcctNum == payload.AcctNum)
            )
            sad = res.scalar_one_or_none()
            if not sad:
                raise HTTPException(status_code=409, detail="Account changed; retry deposit")
            txn = None
            continue

    if txn is None:
        raise HTTPException(status_code=503, detail="Unable to allocate transaction id, retry later")

    try:
        await db.commit()
    except IntegrityError:
        await db.rollback()
        raise HTTPException(status_code=409, detail="Transaction conflict, please retry")

    return {
        "CustID": cust_id,
        "AcctNum": payload.AcctNum,
        "TxnID": txn.TxnID,
        "Deposited": str(payload.Amount),
        "TxnDate": txn_date.isoformat(),  # safe: this is a date object
        "NewBalance": str(new_balance),
    }


def generate_9_digit() -> int:
    return random.randint(100_000_000, 999_999_999)

def parse_date_only(raw: str) -> date:
    try:
        return date.fromisoformat(raw)
    except ValueError:
        return datetime.fromisoformat(raw).date()

async def acct_belongs_to_customer(db: AsyncSession, cust_id: int, acct_num: int) -> bool:
    q = (
        select(CustomerAccounts.AcctNum)
        .where(and_(CustomerAccounts.CustID == cust_id, CustomerAccounts.AcctNum == acct_num))
        .limit(1)
    )
    res = await db.execute(q)
    return res.scalar_one_or_none() is not None

@router.post("/{cust_id}/savings/withdraw", status_code=status.HTTP_201_CREATED)
async def withdraw_from_savings(
    cust_id: int,
    payload: SavingWithdrawRequest,
    db: AsyncSession = Depends(get_db),
):
    # 1) Verify account ownership
    if not await acct_belongs_to_customer(db, cust_id, payload.AcctNum):
        raise HTTPException(status_code=404, detail="Account not found for customer")

    # 2) Parse date-only
    txn_date = parse_date_only(payload.TxnDate)

    # 3) Fetch current balance
    res = await db.execute(
        select(SavingAccountDetail).where(SavingAccountDetail.AcctNum == payload.AcctNum)
    )
    sad = res.scalar_one_or_none()
    if not sad:
        raise HTTPException(status_code=404, detail="Saving account detail not found")

    current = sad.Balance or 0

    # 4) Validate sufficient funds
    if payload.Amount > current:
        raise HTTPException(status_code=409, detail="Insufficient funds")

    new_balance = current - payload.Amount

    # 5) Create txn and update master balance atomically (retry on TxnID collisions)
    txn = None
    for _ in range(MAX_TXNID_RETRIES):
        try:
            txn = SavingAccountTxnHistory(
                TxnID=generate_9_digit(),
                TxnDate=txn_date,              # DATE column
                AcctNum=payload.AcctNum,
                TxnDetail=payload.TxnDetail,
                WithdrawAmount=payload.Amount,
                DepositAmount=0,
                Balance=new_balance,           # running balance after withdrawal
            )
            db.add(txn)

            sad.Balance = new_balance
            db.add(sad)

            await db.flush()
            break
        except IntegrityError:
            await db.rollback()
            # Re-fetch in case of concurrent changes
            res = await db.execute(
                select(SavingAccountDetail).where(SavingAccountDetail.AcctNum == payload.AcctNum)
            )
            sad = res.scalar_one_or_none()
            if not sad:
                raise HTTPException(status_code=409, detail="Account changed; retry withdrawal")
            # Recompute current and validate again in case of concurrent updates
            current = sad.Balance or 0
            if payload.Amount > current:
                raise HTTPException(status_code=409, detail="Insufficient funds")
            new_balance = current - payload.Amount
            txn = None
            continue

    if txn is None:
        raise HTTPException(status_code=503, detail="Unable to allocate transaction id, retry later")

    # 6) Commit
    try:
        await db.commit()
    except IntegrityError:
        await db.rollback()
        raise HTTPException(status_code=409, detail="Transaction conflict, please retry")

    return {
        "CustID": cust_id,
        "AcctNum": payload.AcctNum,
        "TxnID": txn.TxnID,
        "Withdrawn": str(payload.Amount),
        "TxnDate": txn_date.isoformat(),
        "NewBalance": str(new_balance),
    }
import time
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.db import get_db
from app.models import CustomerDetail, SavingAccountDetail, LoanAccountDetail
from app.schemas.customer import SavingAccountCreate, LoanAccountCreate, AccountOut, SavingTxnOut, LoanEMIOut
from app.crud.account import get_or_create_account_type, get_or_create_customer_account
from app.security.deps import get_current_admin


router = APIRouter(prefix="/customers", tags=["customers"])

@router.post("/{cust_id}/savings", status_code=status.HTTP_201_CREATED)
async def create_saving_account(
    cust_id: int,
    payload: SavingAccountCreate,
    db: AsyncSession = Depends(get_db),
    admin=Depends(get_current_admin)
):
    # validate customer
    result = await db.execute(select(CustomerDetail).where(CustomerDetail.CustID == cust_id))
    if not result.scalar_one_or_none():
        raise HTTPException(status_code=404, detail="Customer not found")

    # get or create account type
    account_type_id = await get_or_create_account_type(db, payload.AccountType, payload.AccSubType)

    # get or create customer account (AcctNum)
    acct_num = await get_or_create_customer_account(db, cust_id, account_type_id)

    # insert into savings detail (if not exists)
    existing = await db.execute(select(SavingAccountDetail).where(SavingAccountDetail.AcctNum == acct_num))
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Savings account already exists for this customer")

    saving_account = SavingAccountDetail(
        AcctNum=acct_num,
        SavingAccTypeId=account_type_id,
        Balance=payload.Balance,
        TransferLimit=payload.TransferLimit,
        BranchCode=payload.BranchCode,
    )
    db.add(saving_account)

    await db.commit()
    return {"message": "Savings account created", "AcctNum": acct_num}


@router.post("/{cust_id}/loan", status_code=status.HTTP_201_CREATED)
async def create_loan_account(
    cust_id: int,
    payload: LoanAccountCreate,
    db: AsyncSession = Depends(get_db),
    admin=Depends(get_current_admin)
):
    # validate customer
    result = await db.execute(select(CustomerDetail).where(CustomerDetail.CustID == cust_id))
    if not result.scalar_one_or_none():
        raise HTTPException(status_code=404, detail="Customer not found")

    # get or create account type
    account_type_id = await get_or_create_account_type(db, payload.AccountType, payload.AccSubType)

    # get or create customer account (AcctNum)
    acct_num = await get_or_create_customer_account(db, cust_id, account_type_id)

    # insert into loan detail
    loan_account = LoanAccountDetail(
        AcctNum=acct_num,
        EMIID=payload.EMIID,
        BalanceAmount=payload.BalanceAmount,
        BranchCode=payload.BranchCode,
        RateOfInterest=payload.RateOfInterest,
        LoanDuration=payload.LoanDuration,
        TotalLoanAmount=payload.TotalLoanAmount,
        LoanAccountTypeId=account_type_id,
    )
    db.add(loan_account)

    await db.commit()
    return {"message": "Loan account created", "AcctNum": acct_num}

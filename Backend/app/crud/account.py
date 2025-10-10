from sqlalchemy import select
from sqlalchemy.exc import NoResultFound
from sqlalchemy.ext.asyncio import AsyncSession
from app.models import AccountType, CustomerAccounts, SavingAccountDetail, LoanAccountDetail, SavingAccountTxnHistory
from app.schemas.customer import SavingAccountCreate
from decimal import Decimal
from datetime import date
import time
from typing import Optional

async def get_or_create_account_type(db: AsyncSession, account_type: str, sub_type: str | None = None):
    result = await db.execute(
        select(AccountType).where(AccountType.AccountType == account_type)
    )
    acct_type = result.scalar_one_or_none()
    if acct_type:
        return acct_type.AccountTypeID

    # create new account type
    new_type = AccountType(AccountType=account_type, AccSubType=sub_type)
    db.add(new_type)
    await db.flush()  # ensures ID is generated
    return new_type.AccountTypeID


async def get_or_create_customer_account(db: AsyncSession, cust_id: int, account_type_id: int):
    result = await db.execute(
        select(CustomerAccounts).where(CustomerAccounts.CustID == cust_id)
    )
    cust_account = result.scalar_one_or_none()
    if cust_account:
        return cust_account.AcctNum

    # create new account
    acct_num = int(time.time() * 1000)  # or use DB sequence
    new_cust_account = CustomerAccounts(
        AcctNum=acct_num,
        CustID=cust_id,
        AccountTypeID=account_type_id
    )
    db.add(new_cust_account)
    await db.flush()
    return acct_num


# New: create saving account and add an initial deposit txn if Balance > 0
async def create_saving_account_with_initial_txn(
    db: AsyncSession,
    cust_id: int,
    saving_in: SavingAccountCreate,
    txn_date: Optional[date] = None
) -> SavingAccountDetail:
    """
    Create (or ensure) customer account, create SavingAccountDetail record,
    and insert an initial deposit row into SavingAccountTxnHistory when Balance > 0.
    """
    # 1) ensure account type exists
    acct_type_id = await get_or_create_account_type(db, saving_in.AccountType, saving_in.AccSubType)

    # 2) ensure customer account exists and get AcctNum
    acct_num = await get_or_create_customer_account(db, cust_id, acct_type_id)

    # 3) create saving account detail (or update if exists)
    # try to find existing saving detail for acct_num
    result = await db.execute(select(SavingAccountDetail).where(SavingAccountDetail.AcctNum == acct_num))
    existing = result.scalar_one_or_none()

    if existing:
        # update fields if needed
        existing.SavingAccTypeId = getattr(saving_in, "SavingAccTypeId", existing.SavingAccTypeId)
        existing.Balance = Decimal(saving_in.Balance) if saving_in.Balance is not None else existing.Balance
        existing.TransferLimit = Decimal(saving_in.TransferLimit) if saving_in.TransferLimit is not None else existing.TransferLimit
        existing.BranchCode = getattr(saving_in, "BranchCode", existing.BranchCode)
        saving_detail = existing
        db.add(saving_detail)
        await db.flush()
    else:
        saving_detail = SavingAccountDetail(
            AcctNum=acct_num,
            SavingAccTypeId=getattr(saving_in, "SavingAccTypeId", None),
            Balance=Decimal(saving_in.Balance) if saving_in.Balance is not None else Decimal("0.00"),
            TransferLimit=Decimal(saving_in.TransferLimit) if saving_in.TransferLimit is not None else Decimal("0.00"),
            BranchCode=getattr(saving_in, "BranchCode", None),
        )
        db.add(saving_detail)
        await db.flush()

    # 4) create initial transaction if balance > 0
    try:
        balance_val = Decimal(saving_detail.Balance or 0)
    except Exception:
        balance_val = Decimal("0.00")

    if balance_val > Decimal("0.00"):
        tx_date = txn_date or date.today()
        txn = SavingAccountTxnHistory(
            AcctNum=acct_num,
            TxnType="Deposit",
            TxnDetail="Initial deposit",
            TxnDate=tx_date,
            WithdrawAmount=None,
            DepositAmount=balance_val,
            Balance=balance_val
        )
        db.add(txn)

    # 5) commit and refresh
    await db.commit()
    await db.refresh(saving_detail)
    return saving_detail

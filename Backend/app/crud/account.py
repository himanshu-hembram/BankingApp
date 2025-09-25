from sqlalchemy import select
from sqlalchemy.exc import NoResultFound
from sqlalchemy.ext.asyncio import AsyncSession
from app.models import AccountType, CustomerAccounts, SavingAccountDetail, LoanAccountDetail
import time

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

from fastapi import APIRouter, Depends, HTTPException, status, Body
from sqlalchemy.ext.asyncio import AsyncSession
from app.db import get_db
from app.schemas.customer import CustomerCreate, CustomerOut, CustomerUpdate, CustomerUpdateResponse, CustomerOutByID, AccountOut, PostalCodeOut, SavingTxnOut, LoanEMIOut
from app.crud.customer import get_customer_full_by_id
from app.crud.customer import create_customer, get_customer_by_email
from app.crud.customer import get_customer_by_id, update_customer
from app.security.deps import get_current_admin
from app.crud.customer import delete_customer


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
        # only include fields that were provided and are not null
        cust = await create_customer(db, payload=payload.model_dump(exclude_none=True))
    except ValueError as ve:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(ve))

    return CustomerOut.from_orm(cust)


@router.put("/{cust_id}", response_model=CustomerUpdateResponse)
async def update_customer_route(cust_id: int, payload_raw: dict = Body(...), db: AsyncSession = Depends(get_db), admin=Depends(get_current_admin)):
    """Update an existing customer by CustID. The payload should include fields to update (same schema as create).

    If ZIPCode is changed to a non-existing ZIP, you must include CityName, StateName and CountryName to create the postal hierarchy.
    """
    cust = await get_customer_by_id(db, cust_id)
    if not cust:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Customer not found")

    # Normalize incoming keys (case-insensitive and common variants) to our canonical schema keys
    def _canonicalize_keys(d: dict) -> dict:
        mapping = {
            'firstname': 'FirstName',
            'lastname': 'LastName',
            'address1': 'Address1',
            'address2': 'Address2',
            'emailid': 'EmailID',
            'phone': 'Phone',
            'mobile': 'Mobile',
            'dob': 'DOB',
            'maritalstatus': 'MaritalStatus',
            'zipcode': 'ZIPCode',
            'zip_code': 'ZIPCode',
            'cityname': 'CityName',
            'city_name': 'CityName',
            'statename': 'StateName',
            'state_name': 'StateName',
            'countryname': 'CountryName',
            'country_name': 'CountryName',
        }

        out: dict = {}
        for k, v in d.items():
            # normalize to alphanumeric lowercase for matching
            key_norm = ''.join(ch.lower() for ch in k if ch.isalnum())
            canon = mapping.get(key_norm)
            if canon:
                out[canon] = v
            else:
                # keep unknown keys as-is
                out[k] = v
        return out

    canon = _canonicalize_keys(payload_raw)

    try:
        # validate and coerce types (e.g. DOB strings -> date) using the Pydantic model
        payload = CustomerUpdate.model_validate(canon)
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=str(e))

    try:
        # only include fields that were provided and are not null
        updated_cust, updated_columns = await update_customer(db, cust, payload.model_dump(exclude_none=True))
    except ValueError as ve:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(ve))

    msg = "No changes applied" if not updated_columns else f"Updated columns: {', '.join(updated_columns)}"
    return CustomerUpdateResponse(
        message=msg,
        updated_columns=updated_columns,
        customer=CustomerOut.from_orm(updated_cust),
    )

@router.get("/{cust_id}", response_model=CustomerOutByID, status_code=status.HTTP_200_OK)
async def get_customer(
    cust_id: int,
    db: AsyncSession = Depends(get_db),
    admin = Depends(get_current_admin),
):
    cust = await get_customer_full_by_id(db, cust_id)
    if not cust:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Customer not found")

    accounts_out: list[AccountOut] = []

    for acc in cust.accounts:
        # Savings
        if acc.saving_detail:
            transactions = [
                SavingTxnOut(
                    TxnID=txn.TxnID,
                    TxnType=txn.TxnType,
                    TxnDate=txn.TxnDate,
                    TxnAmount=float(txn.TxnAmount or 0),
                    Balance=float(txn.Balance or 0),
                )
                for txn in (acc.saving_detail.transactions or [])
            ]

            accounts_out.append(
                AccountOut(
                    AcctNum=acc.AcctNum,
                    AccountType=acc.account_type.AccountType,
                    Balance=float(acc.saving_detail.Balance or 0),
                    transactions=transactions,
                    emis=[],
                )
            )

        # Loan
        elif acc.loan_detail:
            emis = [
                LoanEMIOut(
                    EMIID=emi.EMIID,
                    EMIAmount=float(emi.EMIAmount or 0),
                    DueDate=emi.DueDate,
                    PaidDate=emi.PaidDate,
                    Status=emi.Status,
                )
                for emi in (acc.loan_detail.emis or [])
            ]

            accounts_out.append(
                AccountOut(
                    AcctNum=acc.AcctNum,
                    AccountType=acc.account_type.AccountType,
                    Balance=float(acc.loan_detail.BalanceAmount or 0),
                    transactions=[],
                    emis=emis,
                )
            )

    customer_out = CustomerOutByID(
        CustID=cust.CustID,
        FirstName=cust.FirstName,
        LastName=cust.LastName,
        Address1=cust.Address1,
        Address2=cust.Address2,
        EmailID=cust.EmailID,
        Phone=cust.Phone,
        Mobile=cust.Mobile,
        DOB=cust.DOB,
        MaritalStatus=cust.MaritalStatus,
        ZIPCode=cust.ZIPCode,
        zipcode=PostalCodeOut.model_validate(cust.zipcode) if cust.zipcode else None,
        accounts=accounts_out,
    )
    return customer_out






@router.delete("/{identifier}", status_code=status.HTTP_200_OK)
async def delete_customer_route(
    identifier: str,
    db: AsyncSession = Depends(get_db),
    admin=Depends(get_current_admin),
):
    """
    Delete a customer by CustID (int) or EmailID (string).
    """
    deleted = False

    # Try CustID first
    try:
        cust_id = int(identifier)
        deleted = await delete_customer(db, cust_id=cust_id)
    except ValueError:
        # Not an int → try email
        deleted = await delete_customer(db, email=identifier)

    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Customer not found",
        )

    return {"message": f"Customer '{identifier}' deleted successfully"}

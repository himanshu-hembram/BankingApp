from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from app.models import CustomerDetail, PostalCode, City, State, Country, CustomerAccounts, SavingAccountDetail, LoanAccountDetail
from sqlalchemy.orm import joinedload

async def get_customer_by_id(db: AsyncSession, cust_id: int) -> CustomerDetail | None:
    res = await db.execute(select(CustomerDetail).where(CustomerDetail.CustID == cust_id))
    return res.scalars().first()


async def get_customer_by_email(db: AsyncSession, email: str) -> CustomerDetail | None:
    res = await db.execute(select(CustomerDetail).where(CustomerDetail.EmailID == email))
    return res.scalars().first()


async def create_customer(db: AsyncSession, *, payload: dict) -> CustomerDetail:
    """Create a new customer. payload keys must match model fields (FirstName, LastName, EmailID, etc.).

    If ZIPCode is provided it must exist in PostalCode table; otherwise it will be stored as-is.
    """
    # Optional: ensure ZIPCode exists. If it does not exist, create PostalCode and its City/State/Country
    zip_code = payload.get('ZIPCode')

    postal = None
    if zip_code:
        res = await db.execute(select(PostalCode).where(PostalCode.ZIPCode == zip_code))
        postal = res.scalars().first()

    if not postal:
        # Need extra location data to create full hierarchy
        city_name = payload.get('CityName')
        state_name = payload.get('StateName')
        country_name = payload.get('CountryName')

        if not (zip_code and city_name and state_name and country_name):
            raise ValueError(
                "ZIP code not found. To create a new postal record, provide ZIPCode, CityName, StateName and CountryName in the payload."
            )

        # Find or create Country (case-insensitive by name)
        q = select(Country).where(func.lower(Country.CountryName) == country_name.lower())
        res = await db.execute(q)
        country = res.scalars().first()
        if not country:
            country = Country(CountryName=country_name)
            db.add(country)
            await db.flush()  # populate country.CountryCode

        # Find or create State under the country
        q = select(State).where(
            func.lower(State.StateName) == state_name.lower(), State.CountryCode == country.CountryCode
        )
        res = await db.execute(q)
        state = res.scalars().first()
        if not state:
            state = State(StateName=state_name, CountryCode=country.CountryCode)
            db.add(state)
            await db.flush()

        # Find or create City under the state
        q = select(City).where(func.lower(City.CityName) == city_name.lower(), City.StateCode == state.StateCode)
        res = await db.execute(q)
        city = res.scalars().first()
        if not city:
            city = City(CityName=city_name, StateCode=state.StateCode)
            db.add(city)
            await db.flush()

        # Create PostalCode
        postal = PostalCode(ZIPCode=zip_code, CityCode=city.CityCode)
        db.add(postal)
        await db.flush()

    # At this point postal exists (either pre-existing or just created)
    # Ensure the payload contains the ZIPCode field referencing it
    payload['ZIPCode'] = postal.ZIPCode

    # Remove any helper location keys we used so model construction won't fail
    for k in ('CityName', 'StateName', 'CountryName'):
        if k in payload:
            payload.pop(k)

    cust = CustomerDetail(**payload)
    db.add(cust)
    await db.commit()
    await db.refresh(cust)
    return cust


async def update_customer(db: AsyncSession, cust: CustomerDetail, payload: dict) -> tuple[CustomerDetail, list[str]]:
    """Update an existing customer in-place. payload contains keys like in create_customer.

    Only keys present in payload (not None) will be considered for update. Handles ZIPCode changes
    and will create postal/city/state/country if needed (same rules as create_customer).
    """
    # Track which columns were changed
    updated_columns: list[str] = []

    # Track whether we need to change ZIP/postal
    new_zip = payload.get('ZIPCode')
    if new_zip and new_zip != cust.ZIPCode:
        # find existing postal
        res = await db.execute(select(PostalCode).where(PostalCode.ZIPCode == new_zip))
        postal = res.scalars().first()
        if not postal:
            # create hierarchy
            city_name = payload.get('CityName')
            state_name = payload.get('StateName')
            country_name = payload.get('CountryName')
            if not (new_zip and city_name and state_name and country_name):
                raise ValueError(
                    "ZIP code not found. To create a new postal record, provide ZIPCode, CityName, StateName and CountryName in the payload."
                )

            # Country
            q = select(Country).where(func.lower(Country.CountryName) == country_name.lower())
            res = await db.execute(q)
            country = res.scalars().first()
            if not country:
                country = Country(CountryName=country_name)
                db.add(country)
                await db.flush()

            # State
            q = select(State).where(
                func.lower(State.StateName) == state_name.lower(), State.CountryCode == country.CountryCode
            )
            res = await db.execute(q)
            state = res.scalars().first()
            if not state:
                state = State(StateName=state_name, CountryCode=country.CountryCode)
                db.add(state)
                await db.flush()

            # City
            q = select(City).where(func.lower(City.CityName) == city_name.lower(), City.StateCode == state.StateCode)
            res = await db.execute(q)
            city = res.scalars().first()
            if not city:
                city = City(CityName=city_name, StateCode=state.StateCode)
                db.add(city)
                await db.flush()

            postal = PostalCode(ZIPCode=new_zip, CityCode=city.CityCode)
            db.add(postal)
            await db.flush()

        # assign new postal ZIP
        cust.ZIPCode = postal.ZIPCode
        updated_columns.append('ZIPCode')

    # Update other fields if provided and different
    updatable = [
        'FirstName','LastName','Address1','Address2','EmailID','Phone','Mobile','DOB','MaritalStatus'
    ]
    for key in updatable:
        if key in payload and payload.get(key) is not None:
            new_val = payload.get(key)
            old_val = getattr(cust, key)
            # For dates, compare date objects (Pydantic should supply date)
            if new_val != old_val:
                setattr(cust, key, new_val)
                updated_columns.append(key)

    await db.commit()
    await db.refresh(cust)
    return cust, updated_columns


async def get_customer_full_by_id(db: AsyncSession, cust_id: int):
    result = await db.execute(
        select(CustomerDetail)
        .options(
            joinedload(CustomerDetail.zipcode)
                .joinedload(PostalCode.city)
                .joinedload(City.state)
                .joinedload(State.country),
            joinedload(CustomerDetail.accounts)
                .joinedload(CustomerAccounts.account_type),
            joinedload(CustomerDetail.accounts)
                .joinedload(CustomerAccounts.saving_detail)
                .joinedload(SavingAccountDetail.transactions),
            joinedload(CustomerDetail.accounts)
                .joinedload(CustomerAccounts.loan_detail)
                .joinedload(LoanAccountDetail.emis),
        )
        .where(CustomerDetail.CustID == cust_id)
    )
    return result.unique().scalar_one_or_none()

async def delete_customer(db: AsyncSession, cust_id: int = None, email: str = None):
    """
    Delete a customer by CustID or EmailID.
    Returns True if deleted, False if not found.
    """
    query = None
    if cust_id is not None:
        query = select(CustomerDetail).where(CustomerDetail.CustID == cust_id)
    elif email is not None:
        query = select(CustomerDetail).where(CustomerDetail.EmailID == email)
    else:
        return False

    result = await db.execute(query)
    customer = result.scalar_one_or_none()
    if not customer:
        return False

    await db.delete(customer)
    await db.commit()
    return True
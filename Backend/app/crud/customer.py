from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from app.models import CustomerDetail, PostalCode, City, State, Country


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

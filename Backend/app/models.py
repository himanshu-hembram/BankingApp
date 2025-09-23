from sqlalchemy import (
    Column,
    Integer,
    String,
    ForeignKey,
    Date,
    Numeric,
    Boolean,
    BigInteger,
    Text,
    TIMESTAMP,
    PrimaryKeyConstraint,
    func,
    UniqueConstraint,
    DateTime,
    Float,
)
from sqlalchemy.orm import relationship
from app.db import Base
import uuid
from sqlalchemy.dialects.postgresql import UUID

# ============== MASTER TABLES ==============


class Admin(Base):
    __tablename__ = "admin"
    admin_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    username = Column(String(100), nullable=False, unique=True)
    email = Column(String(255), nullable=False, unique=True)
    password_hash = Column(String(255), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    __table_args__ = (
        UniqueConstraint("username", name="uq_admin_username"),
        UniqueConstraint("email", name="uq_admin_email"),
    )
    
class Country(Base):
    __tablename__ = "Country"
    CountryCode = Column(Integer, primary_key=True, index=True)
    CountryName = Column(String, nullable=False)
    states = relationship("State", back_populates="country")


class State(Base):
    __tablename__ = "State"
    StateCode = Column(Integer, primary_key=True, index=True)
    StateName = Column(String, nullable=False)
    CountryCode = Column(Integer, ForeignKey("Country.CountryCode", ondelete="CASCADE"))
    country = relationship("Country", back_populates="states")
    cities = relationship("City", back_populates="state")


class City(Base):
    __tablename__ = "City"
    CityCode = Column(Integer, primary_key=True, index=True)
    CityName = Column(String, nullable=False)
    StateCode = Column(Integer, ForeignKey("State.StateCode", ondelete="CASCADE"))
    state = relationship("State", back_populates="cities")
    zips = relationship("PostalCode", back_populates="city")


class PostalCode(Base):
    __tablename__ = "PostalCode"
    ZIPCode = Column(String, primary_key=True, index=True)
    CityCode = Column(Integer, ForeignKey("City.CityCode", ondelete="CASCADE"))
    city = relationship("City", back_populates="zips")
    customers = relationship("CustomerDetail", back_populates="zipcode")


# ============== CUSTOMER & ACCOUNTS ==============


class CustomerDetail(Base):
    __tablename__ = "CustomerDetail"
    CustID = Column(Integer, primary_key=True, index=True)
    FirstName = Column(String, nullable=False)
    LastName = Column(String, nullable=False)
    Address1 = Column(String)
    Address2 = Column(String)
    EmailID = Column(String, unique=True, nullable=False)
    Phone = Column(String(15))
    Mobile = Column(String(15))
    DOB = Column(Date)
    MaritalStatus = Column(String)
    ZIPCode = Column(String, ForeignKey("PostalCode.ZIPCode"))

    zipcode = relationship("PostalCode", back_populates="customers")
    accounts = relationship("CustomerAccounts", back_populates="customer")


class AccountType(Base):
    __tablename__ = "AccountType"
    AccountTypeID = Column(Integer, primary_key=True, index=True)
    AccountType = Column(String, nullable=False)
    AccSubType = Column(String)

    accounts = relationship("CustomerAccounts", back_populates="account_type")


class CustomerAccounts(Base):
    __tablename__ = "CustomerAccounts"
    AcctNum = Column(BigInteger, primary_key=True, index=True)
    CustID = Column(Integer, ForeignKey("CustomerDetail.CustID", ondelete="CASCADE"))
    AccountTypeID = Column(
        Integer, ForeignKey("AccountType.AccountTypeID", ondelete="CASCADE")
    )

    customer = relationship("CustomerDetail", back_populates="accounts")
    account_type = relationship("AccountType", back_populates="accounts")
    saving_detail = relationship(
        "SavingAccountDetail", back_populates="account", uselist=False
    )
    loan_detail = relationship(
        "LoanAccountDetail", back_populates="account", uselist=False
    )


# ============== SAVINGS ==============


class SavingAccountDetail(Base):
    __tablename__ = "SavingAccountDetail"
    AcctNum = Column(
        BigInteger,
        ForeignKey("CustomerAccounts.AcctNum", ondelete="CASCADE"),
        primary_key=True,
    )
    SavingAccTypeId = Column(Integer, ForeignKey("AccountType.AccountTypeID"))
    Balance = Column(Numeric(18, 2), default=0.00)
    TransferLimit = Column(Numeric(18, 2))
    BranchCode = Column(String(20))

    account = relationship("CustomerAccounts", back_populates="saving_detail")
    transactions = relationship(
        "SavingAccountTxnHistory", back_populates="saving_account"
    )


class SavingAccountTxnHistory(Base):
    __tablename__ = "SavingAccountTxnHistory"
    TxnID = Column(Integer, primary_key=True, index=True)
    TxnDate = Column(TIMESTAMP, nullable=False)
    AcctNum = Column(
        BigInteger, ForeignKey("SavingAccountDetail.AcctNum", ondelete="CASCADE")
    )
    TxnDetail = Column(Text)
    WithdrawAmount = Column(Numeric(18, 2), default=0.00)
    DepositAmount = Column(Numeric(18, 2), default=0.00)
    Balance = Column(Numeric(18, 2))

    saving_account = relationship("SavingAccountDetail", back_populates="transactions")


# ============== LOAN ==============


class LoanAccountDetail(Base):
    __tablename__ = "LoanAccountDetail"

    AcctNum = Column(
        BigInteger, ForeignKey("CustomerAccounts.AcctNum", ondelete="CASCADE")
    )
    EMIID = Column(Integer, unique=True)

    BalanceAmount = Column(Numeric(18, 2))
    BranchCode = Column(String(20))
    RateOfInterest = Column(Numeric(5, 2))
    LoanDuration = Column(Integer)  # months
    TotalLoanAmount = Column(Numeric(18, 2))
    LoanAccountTypeId = Column(Integer, ForeignKey("AccountType.AccountTypeID"))

    __table_args__ = (PrimaryKeyConstraint("AcctNum", "EMIID", name="loanaccount_pk"),)

    account = relationship("CustomerAccounts", back_populates="loan_detail")
    emis = relationship("LoanEMIDetail", back_populates="loan_account")


class LoanEMIDetail(Base):
    __tablename__ = "LoanEMIDetail"
    EMINum = Column(Integer, primary_key=True, index=True)
    EMIID = Column(Integer, ForeignKey("LoanAccountDetail.EMIID", ondelete="CASCADE"))
    AcctNum = Column(BigInteger)
    EMIDate = Column(Date)
    EMIAmount = Column(Numeric(18, 2))
    EMIStatus = Column(String)  # Paid/Pending
    EMIReminder = Column(Boolean, default=False)
    RemainingBalance = Column(Numeric(18, 2))

    loan_account = relationship("LoanAccountDetail", back_populates="emis")
 
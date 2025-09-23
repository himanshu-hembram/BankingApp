# app/schemas.py
from pydantic import BaseModel, EmailStr, Field

class AdminRegisterIn(BaseModel):
    userName: str = Field(min_length=3, max_length=100)
    password: str = Field(min_length=8, max_length=128)
    userEmail: EmailStr

class AdminOut(BaseModel):
    admin_id: str
    userName: str
    userEmail: EmailStr


class AdminLoginIn(BaseModel):
    # Accept either username or email in the same field
    identifier: str = Field(..., description="username or email")
    password: str = Field(min_length=8, max_length=128)


class TokenOut(BaseModel):
    access_token: str
    token_type: str = "bearer"
    userId: str
    userName: str
    userEmailid: EmailStr

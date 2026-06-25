from datetime import datetime

from pydantic import BaseModel, EmailStr, Field


class RegisterRequest(BaseModel):
    name: str = Field(min_length=2, max_length=120)
    email: EmailStr
    password: str = Field(min_length=6)


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class UserOut(BaseModel):
    id: int
    name: str
    email: EmailStr
    created_at: datetime

    model_config = {"from_attributes": True}


class TokenOut(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut


class ProfileUpdateRequest(BaseModel):
    name: str = Field(min_length=2, max_length=120)
    email: EmailStr


class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str = Field(min_length=6)
    confirm_password: str = Field(min_length=6)

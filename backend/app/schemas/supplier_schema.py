from datetime import datetime

from pydantic import BaseModel, EmailStr, Field


class SupplierBase(BaseModel):
    name: str = Field(min_length=2)
    contact_person: str | None = None
    email: EmailStr | None = None
    phone: str | None = None
    lead_time_days: int = Field(default=7, ge=1)
    address: str | None = None
    status: str = "active"


class SupplierCreate(SupplierBase):
    pass


class SupplierUpdate(SupplierBase):
    pass


class SupplierOut(SupplierBase):
    id: int
    created_at: datetime

    model_config = {"from_attributes": True}

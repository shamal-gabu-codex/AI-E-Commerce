from datetime import date, datetime
from decimal import Decimal

from pydantic import BaseModel, Field


class SaleCreate(BaseModel):
    product_id: int
    sale_date: date
    quantity: int = Field(gt=0)
    revenue: Decimal = Field(ge=0)


class SaleOut(SaleCreate):
    id: int
    created_at: datetime

    model_config = {"from_attributes": True}

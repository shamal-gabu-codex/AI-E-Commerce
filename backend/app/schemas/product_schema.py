from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, Field


class ProductBase(BaseModel):
    name: str = Field(min_length=2)
    sku: str = Field(min_length=2)
    category: str
    price: Decimal = Field(gt=0)
    current_stock: int = Field(default=0, ge=0)
    reorder_level: int = Field(default=10, ge=0)
    supplier_id: int | None = None
    brand_id: int | None = None
    status: str = Field(default="active", pattern="^(active|inactive)$")


class ProductCreate(ProductBase):
    pass


class ProductUpdate(ProductBase):
    pass


class ProductOut(ProductBase):
    id: int
    created_at: datetime

    model_config = {"from_attributes": True}

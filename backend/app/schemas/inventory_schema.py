from datetime import datetime

from pydantic import BaseModel, Field


class InventoryUpdate(BaseModel):
    stock: int = Field(ge=0)
    reorder_level: int = Field(ge=0)


class InventoryOut(BaseModel):
    id: int
    product_id: int
    stock: int
    reorder_level: int
    last_updated: datetime

    model_config = {"from_attributes": True}

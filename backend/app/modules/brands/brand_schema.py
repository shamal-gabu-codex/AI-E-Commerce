from datetime import datetime

from pydantic import BaseModel, Field


class BrandBase(BaseModel):
    name: str = Field(min_length=2, max_length=160)
    description: str | None = None
    status: str = Field(pattern="^(active|inactive)$")


class BrandCreate(BrandBase):
    pass


class BrandUpdate(BrandBase):
    pass


class BrandOut(BrandBase):
    id: int
    created_at: datetime

    model_config = {"from_attributes": True}

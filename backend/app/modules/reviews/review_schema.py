from datetime import datetime

from pydantic import BaseModel, Field


class ReviewCreate(BaseModel):
    product_id: int
    rating: int = Field(ge=1, le=5)
    review_text: str = Field(min_length=3)


class ReviewOut(ReviewCreate):
    id: int
    sentiment: str
    sentiment_score: float
    issue_category: str | None
    created_at: datetime

    model_config = {"from_attributes": True}

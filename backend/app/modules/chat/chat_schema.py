from datetime import datetime
from typing import Any

from pydantic import BaseModel, Field


class ChatRequest(BaseModel):
    question: str = Field(min_length=3)


class ChatResponse(BaseModel):
    question: str
    intent: str
    response: dict[str, Any]


class ChatHistoryOut(BaseModel):
    id: int
    user_id: int
    question: str
    intent: str
    response: str
    created_at: datetime

    model_config = {"from_attributes": True}

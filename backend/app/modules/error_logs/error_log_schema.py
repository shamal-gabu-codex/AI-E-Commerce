from datetime import datetime

from pydantic import BaseModel


class ErrorLogOut(BaseModel):
    id: int
    level: str
    source: str
    path: str | None
    method: str | None
    status_code: int | None
    message: str
    stack_trace: str | None
    user_id: int | None
    request_id: str | None
    created_at: datetime

    model_config = {"from_attributes": True}

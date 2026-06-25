from datetime import datetime

from sqlalchemy import DateTime, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class ErrorLog(Base):
    __tablename__ = "error_logs"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    level: Mapped[str] = mapped_column(String(30), default="error", index=True)
    source: Mapped[str] = mapped_column(String(120), default="api")
    path: Mapped[str | None] = mapped_column(String(500), index=True)
    method: Mapped[str | None] = mapped_column(String(20))
    status_code: Mapped[int | None] = mapped_column(Integer, index=True)
    message: Mapped[str] = mapped_column(Text)
    stack_trace: Mapped[str | None] = mapped_column(Text)
    user_id: Mapped[int | None] = mapped_column(Integer, index=True)
    request_id: Mapped[str | None] = mapped_column(String(80), index=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, index=True)

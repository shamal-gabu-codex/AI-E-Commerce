from datetime import datetime

from sqlalchemy import DateTime, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class Alert(Base):
    __tablename__ = "alerts"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    type: Mapped[str] = mapped_column(String(80), index=True)
    channel: Mapped[str] = mapped_column(String(30), default="in_app")
    message: Mapped[str] = mapped_column(Text)
    status: Mapped[str] = mapped_column(String(30), default="created")
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

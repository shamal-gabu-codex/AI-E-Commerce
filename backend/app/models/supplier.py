from datetime import datetime

from sqlalchemy import DateTime, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class Supplier(Base):
    __tablename__ = "suppliers"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(160), index=True)
    contact_person: Mapped[str | None] = mapped_column(String(120))
    email: Mapped[str | None] = mapped_column(String(255))
    phone: Mapped[str | None] = mapped_column(String(50))
    lead_time_days: Mapped[int] = mapped_column(Integer, default=7)
    address: Mapped[str | None] = mapped_column(String(500))
    status: Mapped[str] = mapped_column(String(30), default="active")
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    products = relationship("Product", back_populates="supplier")
    recommendations = relationship("AIRecommendation", back_populates="supplier")

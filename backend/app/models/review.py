from datetime import datetime

from sqlalchemy import DateTime, Float, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class Review(Base):
    __tablename__ = "reviews"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    product_id: Mapped[int] = mapped_column(ForeignKey("products.id"), index=True)
    rating: Mapped[int] = mapped_column(Integer)
    review_text: Mapped[str] = mapped_column(Text)
    sentiment: Mapped[str] = mapped_column(String(30), default="neutral")
    sentiment_score: Mapped[float] = mapped_column(Float, default=0)
    issue_category: Mapped[str | None] = mapped_column(String(80))
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    product = relationship("Product", back_populates="reviews")

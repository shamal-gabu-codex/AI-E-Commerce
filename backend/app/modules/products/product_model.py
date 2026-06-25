from datetime import datetime
from decimal import Decimal

from sqlalchemy import DateTime, ForeignKey, Integer, Numeric, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class Product(Base):
    __tablename__ = "products"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(180), index=True)
    sku: Mapped[str] = mapped_column(String(80), unique=True, index=True)
    category: Mapped[str] = mapped_column(String(100), index=True)
    price: Mapped[Decimal] = mapped_column(Numeric(10, 2))
    current_stock: Mapped[int] = mapped_column(Integer, default=0)
    reorder_level: Mapped[int] = mapped_column(Integer, default=10)
    supplier_id: Mapped[int | None] = mapped_column(ForeignKey("suppliers.id"))
    brand_id: Mapped[int | None] = mapped_column(ForeignKey("brands.id"))
    status: Mapped[str] = mapped_column(String(30), default="active")
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    supplier = relationship("Supplier", back_populates="products")
    brand = relationship("Brand", back_populates="products")
    sales = relationship("Sale", back_populates="product", cascade="all, delete-orphan")
    inventory = relationship("Inventory", back_populates="product", uselist=False, cascade="all, delete-orphan")
    reviews = relationship("Review", back_populates="product", cascade="all, delete-orphan")
    recommendations = relationship("AIRecommendation", back_populates="product")

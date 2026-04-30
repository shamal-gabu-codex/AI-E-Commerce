from sqlalchemy import create_engine, inspect, text
from sqlalchemy.orm import DeclarativeBase, sessionmaker

from app.config import settings


engine = create_engine(settings.database_url, pool_pre_ping=True)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


class Base(DeclarativeBase):
    pass


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db():
    from app import models  # noqa: F401

    Base.metadata.create_all(bind=engine)
    ensure_lightweight_schema_upgrades()


def ensure_lightweight_schema_upgrades():
    """POC-friendly schema upgrade for projects created before brands existed."""
    inspector = inspect(engine)
    if "products" not in inspector.get_table_names():
        return
    product_columns = {column["name"] for column in inspector.get_columns("products")}
    if "brand_id" not in product_columns:
        with engine.begin() as conn:
            conn.execute(text("ALTER TABLE products ADD COLUMN brand_id INTEGER REFERENCES brands(id)"))

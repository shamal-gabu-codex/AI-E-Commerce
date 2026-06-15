from datetime import date, timedelta

from sqlalchemy.orm import Session

from app.models.alert import Alert
from app.models.product import Product
from app.models.recommendation import AIRecommendation
from app.models.sales import Sale


def product_days_left(db: Session, product: Product) -> float | None:
    rows = db.query(Sale).filter(Sale.product_id == product.id, Sale.sale_date >= date.today() - timedelta(days=30)).all()
    total_qty = sum(r.quantity for r in rows)
    days = len({r.sale_date for r in rows}) or 30
    avg_daily_sales = total_qty / days if days else 0
    return round(product.current_stock / avg_daily_sales, 1) if avg_daily_sales else None


def run_recommendations(db: Session) -> list[dict]:
    created: list[dict] = []
    db.query(AIRecommendation).delete()
    db.query(Alert).filter(Alert.type.in_(["low_stock", "demand_risk"])).delete()
    for product in db.query(Product).all():
        days_left = product_days_left(db, product)
        supplier = product.supplier
        low_stock = product.current_stock <= product.reorder_level
        urgent = days_left is not None and supplier and days_left <= supplier.lead_time_days + 2
        if low_stock or urgent:
            priority = "high" if urgent else "medium"
            message = f"{product.name} needs restocking; {product.current_stock} units left"
            if days_left is not None:
                message += f" and estimated stock covers {days_left} days"
            rec = AIRecommendation(
                product_id=product.id,
                supplier_id=product.supplier_id,
                type="RESTOCK",
                message=message,
                priority=priority,
            )
            alert = Alert(type="low_stock", channel="in_app", message=message, status="created")
            db.add_all([rec, alert])
            created.append({"product_id": product.id, "message": message, "priority": priority})
    db.commit()
    return created

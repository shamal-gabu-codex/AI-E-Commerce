from datetime import date, timedelta

import pandas as pd
from sqlalchemy.orm import Session

from app.models.product import Product
from app.models.review import Review
from app.models.sales import Sale
from app.services.ai.anomaly_detection import sales_windows
from app.services.ai.recommendation_engine import product_days_left


def build_context(db: Session, intent: str) -> dict:
    products = db.query(Product).all()
    sales = db.query(Sale).filter(Sale.sale_date >= date.today() - timedelta(days=60)).all()
    sales_df = pd.DataFrame([{"product_id": s.product_id, "quantity": s.quantity, "revenue": float(s.revenue)} for s in sales])
    top_products = []
    if not sales_df.empty:
        top_products = sales_df.groupby("product_id").agg({"quantity": "sum", "revenue": "sum"}).reset_index().sort_values("revenue", ascending=False).head(5).to_dict("records")
    return {
        "intent": intent,
        "sales_windows": sales_windows(db),
        "low_stock": [
            {
                "product": p.name,
                "stock": p.current_stock,
                "reorder_level": p.reorder_level,
                "supplier": p.supplier.name if p.supplier else None,
                "days_left": product_days_left(db, p),
            }
            for p in products
            if p.current_stock <= p.reorder_level
        ],
        "top_products": top_products,
        "negative_reviews": [
            {"product": r.product.name, "rating": r.rating, "issue": r.issue_category, "text": r.review_text[:180]}
            for r in db.query(Review).filter(Review.sentiment == "negative").order_by(Review.created_at.desc()).limit(10)
        ],
    }

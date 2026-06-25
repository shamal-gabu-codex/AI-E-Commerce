from datetime import date, timedelta

import pandas as pd
from sqlalchemy.orm import Session

from app.modules.products.product_model import Product
from app.modules.reviews.review_model import Review
from app.modules.sales.sales_model import Sale
from app.modules.ai.anomaly_service import sales_windows
from app.modules.ai.recommendation_service import product_days_left
from app.modules.ai.advisor_service import business_advisor
from app.modules.ai.business_health_service import calculate_business_health
from app.modules.ai.executive_summary_service import generate_executive_summary
from app.modules.ai.restocking_service import smart_restocking


def build_context(db: Session, intent: str) -> dict:
    products = db.query(Product).all()
    sales = db.query(Sale).filter(Sale.sale_date >= date.today() - timedelta(days=60)).all()
    sales_df = pd.DataFrame([{"product_id": s.product_id, "quantity": s.quantity, "revenue": float(s.revenue)} for s in sales])
    top_products = []
    if not sales_df.empty:
        top_products = sales_df.groupby("product_id").agg({"quantity": "sum", "revenue": "sum"}).reset_index().sort_values("revenue", ascending=False).head(5).to_dict("records")
    context = {
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
    if intent == "BUSINESS_HEALTH":
        context["business_health"] = calculate_business_health(db, save_history=False)
    if intent == "SMART_RESTOCKING":
        context["smart_restocking"] = smart_restocking(db)[:10]
    if intent == "EXECUTIVE_SUMMARY":
        context["executive_summary"] = generate_executive_summary(db, "weekly", save_history=False)
    if intent == "BUSINESS_ADVISOR":
        context["advisor"] = business_advisor(db)
    if intent == "WHAT_IF_SIMULATION":
        context["simulation_note"] = "Ask for a scenario type, product, and percentage or delay days to run precise simulation."
    return context

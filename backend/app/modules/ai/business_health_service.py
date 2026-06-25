import json
from datetime import date, timedelta

from sqlalchemy import func
from sqlalchemy.orm import Session

from app.modules.ai.ai_insight_model import AIHealthScoreHistory
from app.modules.inventory.inventory_model import Inventory
from app.modules.products.product_model import Product
from app.modules.reviews.review_model import Review
from app.modules.sales.sales_model import Sale
from app.modules.suppliers.supplier_model import Supplier


def _clamp(value: float) -> int:
    return max(0, min(100, round(value)))


def calculate_business_health(db: Session, save_history: bool = True) -> dict:
    today = date.today()
    recent_revenue = float(db.query(func.coalesce(func.sum(Sale.revenue), 0)).filter(Sale.sale_date >= today - timedelta(days=30)).scalar() or 0)
    previous_revenue = float(db.query(func.coalesce(func.sum(Sale.revenue), 0)).filter(Sale.sale_date < today - timedelta(days=30), Sale.sale_date >= today - timedelta(days=60)).scalar() or 0)
    sales_score = _clamp(65 + ((recent_revenue - previous_revenue) / max(previous_revenue, 1)) * 35)

    inventory_rows = db.query(Inventory).all()
    low_stock = [row for row in inventory_rows if row.stock <= row.reorder_level]
    inventory_score = _clamp(100 - (len(low_stock) / max(len(inventory_rows), 1)) * 100)

    suppliers = db.query(Supplier).all()
    active_suppliers = [s for s in suppliers if s.status == "active"]
    avg_lead_time = sum(s.lead_time_days or 0 for s in active_suppliers) / max(len(active_suppliers), 1)
    supplier_score = _clamp((len(active_suppliers) / max(len(suppliers), 1)) * 70 + max(0, 30 - avg_lead_time))

    reviews = db.query(Review).all()
    positive_reviews = [r for r in reviews if r.sentiment == "positive"]
    sentiment_score = _clamp((len(positive_reviews) / max(len(reviews), 1)) * 100)

    forecast_risks = 0
    products = db.query(Product).all()
    for product in products[:25]:
        recent_quantity = int(db.query(func.coalesce(func.sum(Sale.quantity), 0)).filter(Sale.product_id == product.id, Sale.sale_date >= today - timedelta(days=30)).scalar() or 0)
        demand = (recent_quantity / 30) * 14
        if demand > product.current_stock:
            forecast_risks += 1
    forecast_score = _clamp(100 - (forecast_risks / max(len(products), 1)) * 100)

    breakdown = {
        "sales_performance": sales_score,
        "inventory_health": inventory_score,
        "supplier_performance": supplier_score,
        "customer_sentiment": sentiment_score,
        "demand_forecast": forecast_score,
    }
    score = _clamp(sum(breakdown.values()) / len(breakdown))
    risk_level = "Low" if score >= 75 else "Medium" if score >= 50 else "High"
    reasons = []
    actions = []
    if sales_score < 60:
        reasons.append("Recent revenue is weaker than the previous 30-day period.")
        actions.append("Review pricing, promotions, and top product demand.")
    if inventory_score < 70:
        reasons.append(f"{len(low_stock)} products are at or below reorder level.")
        actions.append("Prioritize replenishment for low-stock products.")
    if supplier_score < 70:
        reasons.append("Supplier coverage or lead time is creating operational risk.")
        actions.append("Contact slow suppliers and add backup suppliers for critical products.")
    if sentiment_score < 70:
        reasons.append("Customer sentiment is below healthy threshold.")
        actions.append("Address recurring review issues and quality complaints.")
    if forecast_score < 70:
        reasons.append("Forecasted demand may exceed available stock for some products.")
        actions.append("Increase purchase quantities for forecasted high-demand products.")
    if not reasons:
        reasons.append("Core business metrics are stable across sales, inventory, suppliers, sentiment, and demand.")
        actions.append("Keep monitoring demand shifts and supplier lead times.")

    result = {
        "overall_score": score,
        "risk_level": risk_level,
        "breakdown": breakdown,
        "reasons": reasons,
        "recommended_actions": actions,
    }
    if save_history:
        db.add(AIHealthScoreHistory(score=score, risk_level=risk_level, payload=json.dumps(result)))
        db.commit()
    return result


def health_history(db: Session) -> list[dict]:
    rows = db.query(AIHealthScoreHistory).order_by(AIHealthScoreHistory.created_at.desc()).limit(30).all()
    return [{"id": row.id, "created_at": row.created_at, **json.loads(row.payload)} for row in rows]

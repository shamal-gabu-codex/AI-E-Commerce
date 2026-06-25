import json
from datetime import date, timedelta

from sqlalchemy import func
from sqlalchemy.orm import Session

from app.modules.ai.ai_insight_model import AIExecutiveSummaryHistory
from app.modules.ai.business_health_service import calculate_business_health
from app.modules.ai.gemini_client import ask_gemini
from app.modules.ai.restocking_service import smart_restocking
from app.modules.reviews.review_model import Review
from app.modules.sales.sales_model import Sale


def generate_executive_summary(db: Session, period: str = "weekly", save_history: bool = True) -> dict:
    days = {"daily": 1, "weekly": 7, "monthly": 30}.get(period, 7)
    start = date.today() - timedelta(days=days)
    revenue = float(db.query(func.coalesce(func.sum(Sale.revenue), 0)).filter(Sale.sale_date >= start).scalar() or 0)
    quantity = int(db.query(func.coalesce(func.sum(Sale.quantity), 0)).filter(Sale.sale_date >= start).scalar() or 0)
    negative_reviews = db.query(Review).filter(Review.created_at >= start, Review.sentiment == "negative").count()
    health = calculate_business_health(db, save_history=False)
    restocks = smart_restocking(db)
    result = {
        "period": period,
        "key_wins": [
            f"${revenue:,.2f} revenue generated in the selected period.",
            f"{quantity} units sold.",
        ],
        "risks": [
            f"{len([r for r in restocks if r['urgency_level'] == 'High'])} high urgency restock risks.",
            f"{negative_reviews} negative reviews detected.",
            f"Business health risk level is {health['risk_level']}.",
        ],
        "opportunities": [
            "Focus promotions on products with strong demand forecast.",
            "Use supplier lead time to place purchase orders before stockout risk increases.",
        ],
        "recommended_actions": health["recommended_actions"][:4],
        "metrics": {"revenue": revenue, "units_sold": quantity, "health_score": health["overall_score"]},
    }
    result["ai_explanation"] = ask_gemini(f"Give me this {period} executive summary", result)
    if save_history:
        db.add(AIExecutiveSummaryHistory(period=period, payload=json.dumps(result)))
        db.commit()
    return result


def summary_history(db: Session) -> list[dict]:
    rows = db.query(AIExecutiveSummaryHistory).order_by(AIExecutiveSummaryHistory.created_at.desc()).limit(30).all()
    return [{"id": row.id, "created_at": row.created_at, **json.loads(row.payload)} for row in rows]

from sqlalchemy.orm import Session

from app.modules.ai.business_health_service import calculate_business_health
from app.modules.ai.restocking_service import smart_restocking
from app.modules.reviews.review_model import Review


def business_advisor(db: Session) -> list[dict]:
    health = calculate_business_health(db, save_history=False)
    recs = []
    for item in smart_restocking(db)[:5]:
        recs.append({
            "priority": item["urgency_level"],
            "title": f"Restock {item['product']}",
            "message": f"Suggested order quantity: {item['suggested_reorder_quantity']} from {item['supplier']}.",
        })
    negatives = db.query(Review).filter(Review.sentiment == "negative").count()
    if negatives:
        recs.append({
            "priority": "Medium",
            "title": "Review customer issues",
            "message": f"{negatives} negative reviews need quality or service follow-up.",
        })
    recs.append({
        "priority": "High" if health["risk_level"] == "High" else "Medium" if health["risk_level"] == "Medium" else "Low",
        "title": "Business health action",
        "message": health["recommended_actions"][0],
    })
    return recs

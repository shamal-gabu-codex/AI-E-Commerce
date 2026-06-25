import json

from sqlalchemy.orm import Session

from app.modules.ai.ai_insight_model import AISimulationHistory
from app.modules.ai.gemini_client import ask_gemini
from app.modules.products.product_model import Product


def run_simulation(db: Session, scenario: dict) -> dict:
    scenario_type = scenario.get("scenario_type", "price_change")
    product_id = int(scenario.get("product_id") or 0)
    percent = float(scenario.get("percent") or 0)
    delay_days = int(scenario.get("delay_days") or 0)
    product = db.get(Product, product_id) if product_id else None
    base_revenue = float(product.price * product.current_stock) if product else 0
    revenue_impact = 0.0
    inventory_impact = 0
    stockout_risk = "Low"
    reasons = []
    if scenario_type == "price_change":
      revenue_impact = round(base_revenue * (percent / 100), 2)
      reasons.append(f"Price change of {percent}% changes projected revenue for current stock.")
    elif scenario_type == "inventory_reduction":
      inventory_impact = round((product.current_stock if product else 0) * (percent / 100))
      stockout_risk = "High" if percent >= 20 else "Medium"
      reasons.append(f"Inventory reduction of {percent}% lowers available stock.")
    elif scenario_type == "supplier_delay":
      stockout_risk = "High" if delay_days >= 7 else "Medium"
      reasons.append(f"Supplier delay of {delay_days} days increases stockout exposure.")
    elif scenario_type == "demand_increase":
      inventory_impact = round((product.current_stock if product else 0) * (percent / 100))
      revenue_impact = round(base_revenue * (percent / 100), 2)
      stockout_risk = "High" if percent >= 30 else "Medium"
      reasons.append(f"Demand increase of {percent}% raises revenue opportunity and inventory pressure.")
    result = {
        "scenario_type": scenario_type,
        "product": product.name if product else "All products",
        "revenue_impact": revenue_impact,
        "inventory_impact": inventory_impact,
        "profit_impact": round(revenue_impact * 0.3, 2),
        "stockout_risk": stockout_risk,
        "reasons": reasons,
        "recommended_actions": [
            "Review stock coverage before applying this scenario.",
            "Compare supplier lead time with projected demand.",
        ],
    }
    result["ai_explanation"] = ask_gemini("Explain this what-if simulation result", {"scenario": scenario, "result": result})
    db.add(AISimulationHistory(scenario_type=scenario_type, payload=json.dumps({**scenario, "result": result})))
    db.commit()
    return result


def simulation_history(db: Session) -> list[dict]:
    rows = db.query(AISimulationHistory).order_by(AISimulationHistory.created_at.desc()).limit(30).all()
    return [{"id": row.id, "created_at": row.created_at, **json.loads(row.payload)} for row in rows]

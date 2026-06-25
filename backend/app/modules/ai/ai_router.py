from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.modules.products.product_model import Product
from app.modules.ai.recommendation_model import AIRecommendation
from app.modules.ai.advisor_service import business_advisor
from app.modules.ai.business_health_service import calculate_business_health, health_history
from app.modules.ai.executive_summary_service import generate_executive_summary, summary_history
from app.modules.ai.forecasting_service import forecast_product
from app.modules.ai.recommendation_service import run_recommendations
from app.modules.ai.restocking_service import smart_restocking
from app.modules.ai.simulation_service import run_simulation, simulation_history

router = APIRouter(prefix="/ai", tags=["AI"])


@router.get("/forecast/{product_id}")
def forecast(product_id: int, db: Session = Depends(get_db)):
    if not db.get(Product, product_id):
        raise HTTPException(404, "Product not found")
    data = forecast_product(db, product_id, 30)
    data["next_7_total"] = round(sum(x["yhat"] for x in data["forecast"][:7]), 2)
    data["next_14_total"] = round(sum(x["yhat"] for x in data["forecast"][:14]), 2)
    data["next_30_total"] = round(sum(x["yhat"] for x in data["forecast"][:30]), 2)
    return data


@router.get("/recommendations")
def recommendations(db: Session = Depends(get_db)):
    return db.query(AIRecommendation).order_by(AIRecommendation.created_at.desc()).all()


@router.post("/run-analysis")
def run_analysis(db: Session = Depends(get_db)):
    return {"created": run_recommendations(db)}


@router.get("/business-health")
def business_health(db: Session = Depends(get_db)):
    return calculate_business_health(db)


@router.get("/business-health/history")
def business_health_history(db: Session = Depends(get_db)):
    return health_history(db)


@router.get("/restocking")
def restocking(db: Session = Depends(get_db)):
    return smart_restocking(db)


@router.get("/executive-summary")
def executive_summary(period: str = "weekly", db: Session = Depends(get_db)):
    return generate_executive_summary(db, period)


@router.get("/executive-summary/history")
def executive_summary_history(db: Session = Depends(get_db)):
    return summary_history(db)


@router.post("/simulation")
def simulation(payload: dict, db: Session = Depends(get_db)):
    return run_simulation(db, payload)


@router.get("/simulation/history")
def simulations(db: Session = Depends(get_db)):
    return simulation_history(db)


@router.get("/advisor")
def advisor(db: Session = Depends(get_db)):
    return business_advisor(db)

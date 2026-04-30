from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.recommendation import AIRecommendation
from app.services.ai.forecasting import forecast_product
from app.services.ai.recommendation_engine import run_recommendations

router = APIRouter(prefix="/ai", tags=["AI"])


@router.get("/forecast/{product_id}")
def forecast(product_id: int, db: Session = Depends(get_db)):
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

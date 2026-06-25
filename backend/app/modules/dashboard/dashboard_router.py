from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.modules.dashboard.dashboard_service import dashboard

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


@router.get("")
def get_dashboard(db: Session = Depends(get_db)):
    return dashboard(db)


@router.get("/summary")
def summary(db: Session = Depends(get_db)):
    return dashboard(db)["summary"]


@router.get("/action-cards")
def action_cards(db: Session = Depends(get_db)):
    return dashboard(db)["action_cards"]

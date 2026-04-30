from app.database import SessionLocal
from app.services.ai.recommendation_engine import run_recommendations
from app.tasks.celery_app import celery_app


@celery_app.task
def run_scheduled_analysis():
    db = SessionLocal()
    try:
        return run_recommendations(db)
    finally:
        db.close()

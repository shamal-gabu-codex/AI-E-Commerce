from app.database import SessionLocal
from app.modules.ai.recommendation_service import run_recommendations
from app.tasks.celery_app import celery_app


@celery_app.task
def run_scheduled_analysis():
    db = SessionLocal()
    try:
        return run_recommendations(db)
    finally:
        db.close()

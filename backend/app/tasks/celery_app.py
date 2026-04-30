from celery import Celery

from app.config import settings

celery_app = Celery("ai_ecommerce", broker=settings.redis_url, backend=settings.redis_url)

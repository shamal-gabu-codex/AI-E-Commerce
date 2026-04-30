# Backend

FastAPI backend for AI E-Commerce Sales & Inventory Intelligence.

## Run

```bash
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
copy .env.example .env
python seed.py
uvicorn app.main:app --reload
```

The app creates tables on startup. For production, replace this with Alembic migrations.

## Notes

- Missing Gemini credentials enable mock response mode.
- Missing SendGrid or Twilio credentials enable mock alert mode.
- Celery task entrypoint: `app.tasks.analysis_tasks.run_scheduled_analysis`.
